"use server";

// Server Actions for order creation and lifecycle changes.

import { revalidatePath } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import { CreateOrderSchema, OrderIdSchema, UpdateOrderStatusSchema } from "@/schemas/orders.schema";
import { runCapacityEngine } from "@/engine/capacity/calculator";
import { getActiveCommitments } from "@/queries/orders.queries";
import type { ActionResult } from "./feasibility.actions";
import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";

type CapacitySnapshot = {
  orderId: string;
  status: OrderStatus;
  analysis?: CapacityEngineResult;
};

async function buildCapacityInput(
  tx: Prisma.TransactionClient,
  businessId: string,
  productId: string,
  quantity: number,
  requiredDeliveryDate: Date,
): Promise<CapacityEngineInput | null> {
  const [product, workers, machines, materials, activeCommitments] = await Promise.all([
    tx.product.findFirst({
      where: { id: productId, businessId, isActive: true },
      include: { materials: true },
    }),
    tx.worker.findMany({
      where: { businessId, isActive: true },
      select: { id: true, dailyAvailableHours: true },
    }),
    tx.machine.findMany({
      where: { businessId, isActive: true },
      select: { id: true, dailyAvailableHours: true },
    }),
    tx.material.findMany({
      where: { businessId, isActive: true },
      select: { id: true, currentStock: true, unit: true },
    }),
    getActiveCommitments(businessId, tx),
  ]);

  if (!product) return null;

  return {
    newOrder: {
      quantity,
      productId,
      analysisDate: new Date(),
      requiredDeliveryDate,
    },
    product: {
      workerHoursPerUnit: product.workerHoursPerUnit,
      machineHoursPerUnit: product.machineHoursPerUnit,
      materials: product.materials.map(({ materialId, quantityPerUnit }) => ({
        materialId,
        quantityPerUnit,
      })),
    },
    workforce: { workers },
    machinery: { machines },
    inventory: { materials },
    activeCommitments,
  };
}

async function saveCapacityAnalysis(
  tx: Prisma.TransactionClient,
  orderId: string,
  analysis: CapacityEngineResult,
) {
  return tx.capacityAnalysis.create({
    data: {
      orderId,
      status: analysis.status,
      workerUtilizationPercent: analysis.workerAnalysis.utilizationPercent,
      machineUtilizationPercent: analysis.machineAnalysis.utilizationPercent,
      availableWorkDays: analysis.availableWorkDays,
      estimatedProductionDays: analysis.estimatedProductionDays,
      bufferDays: analysis.bufferDays,
      reasoning: analysis.reasoning,
      bottlenecks: {
        create: analysis.bottlenecks.map((bottleneck) => ({
          resourceType: bottleneck.resourceType,
          resourceId: bottleneck.resourceId ?? null,
          severity: bottleneck.severity,
          description: bottleneck.description,
        })),
      },
    },
  });
}

function revalidateOrderPages(orderId?: string) {
  revalidatePath("/orders");
  if (orderId) revalidatePath(`/orders/${orderId}`);
}

function isSerializationConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

/**
 * Creates a DRAFT order with a capacity-analysis snapshot in one transaction.
 */
export async function createOrderAction(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; analysis: CapacityEngineResult }>> {
  const businessId = await getBusinessId();

  try {
    const parsed = CreateOrderSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review your input.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { customerName, productId, quantity, requiredDeliveryDate, notes } = parsed.data;
    const deliveryDate = new Date(requiredDeliveryDate);
    const result = await db.$transaction(async (tx) => {
      const input = await buildCapacityInput(
        tx,
        businessId,
        productId,
        quantity,
        deliveryDate,
      );
      if (!input) return null;

      const analysis = runCapacityEngine(input);
      const order = await tx.order.create({
        data: {
          businessId,
          customerName,
          notes: notes || null,
          status: OrderStatus.DRAFT,
          requiredDeliveryDate: deliveryDate,
          items: { create: { productId, quantity } },
        },
      });

      await saveCapacityAnalysis(tx, order.id, analysis);
      return { order, analysis };
    });

    if (!result) {
      return { success: false, error: "Selected product does not exist in this business." };
    }

    revalidateOrderPages(result.order.id);
    return {
      success: true,
      data: { orderId: result.order.id, analysis: result.analysis },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating order.",
    };
  }
}

/**
 * Confirms a DRAFT order only after rechecking capacity in the same transaction
 * that marks it CONFIRMED, which is the capacity reservation.
 */
export async function acceptOrderAction(
  formData: unknown,
): Promise<ActionResult<CapacitySnapshot>> {
  const businessId = await getBusinessId();
  const parsed = OrderIdSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Invalid order ID." };
  }

  const { orderId } = parsed.data;

  try {
    const result = await db.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { id: orderId, businessId },
          include: { items: true },
        });
        if (!order) return { error: "Order not found." } as const;
        if (order.status !== OrderStatus.DRAFT) {
          return { error: "Only DRAFT orders can be accepted." } as const;
        }
        if (order.items.length !== 1) {
          return { error: "Capacity analysis currently supports orders with one product." } as const;
        }

        const item = order.items[0];
        const input = await buildCapacityInput(
          tx,
          businessId,
          item.productId,
          item.quantity,
          order.requiredDeliveryDate,
        );
        if (!input) {
          return { error: "The order product is no longer active in this business." } as const;
        }

        const analysis = runCapacityEngine(input);
        if (analysis.status === "NOT_FEASIBLE") {
          const bottleneck = analysis.bottlenecks[0]?.description;
          return {
            error: bottleneck
              ? `Cannot accept a NOT_FEASIBLE order. ${bottleneck}`
              : "Cannot accept a NOT_FEASIBLE order.",
          } as const;
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CONFIRMED },
        });
        await saveCapacityAnalysis(tx, order.id, analysis);
        return {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          analysis,
        } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) return { success: false, error: result.error };
    revalidateOrderPages(orderId);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (isSerializationConflict(error)) {
      return {
        success: false,
        error: "Capacity changed while accepting this order. Please retry the capacity check.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order.",
    };
  }
}

/**
 * Cancelling removes the order from the active-commitment query and releases
 * its reserved capacity.
 */
export async function cancelOrderAction(
  formData: unknown,
): Promise<ActionResult<CapacitySnapshot>> {
  const businessId = await getBusinessId();
  const parsed = OrderIdSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Invalid order ID." };
  }

  const { orderId } = parsed.data;

  try {
    const result = await db.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { id: orderId, businessId },
          select: { id: true, status: true },
        });
        if (!order) return { error: "Order not found." } as const;
        if (order.status === OrderStatus.COMPLETED) {
          return { error: "Completed orders cannot be cancelled." } as const;
        }

        if (order.status !== OrderStatus.CANCELLED) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });
        }
        return { orderId: order.id, status: OrderStatus.CANCELLED } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) return { success: false, error: result.error };
    revalidateOrderPages(orderId);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (isSerializationConflict(error)) {
      return { success: false, error: "Order status changed concurrently. Please retry." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order.",
    };
  }
}

/**
 * Applies only forward lifecycle transitions. Confirm/cancel use dedicated
 * actions so reservation and release rules cannot be bypassed.
 */
export async function updateOrderStatusAction(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; status: OrderStatus }>> {
  const parsed = UpdateOrderStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Invalid status update payload." };
  }

  const { orderId, status } = parsed.data;
  if (status === OrderStatus.CONFIRMED) {
    const result = await acceptOrderAction({ orderId });
    return result.success && result.data
      ? { success: true, data: { orderId: result.data.orderId, status: result.data.status } }
      : { success: false, error: result.error };
  }
  if (status === OrderStatus.CANCELLED) {
    const result = await cancelOrderAction({ orderId });
    return result.success && result.data
      ? { success: true, data: { orderId: result.data.orderId, status: result.data.status } }
      : { success: false, error: result.error };
  }

  const businessId = await getBusinessId();
  try {
    const result = await db.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { id: orderId, businessId },
          select: { id: true, status: true },
        });
        if (!order) return { error: "Order not found." } as const;

        const canTransition =
          (order.status === OrderStatus.CONFIRMED && status === OrderStatus.IN_PROGRESS) ||
          (order.status === OrderStatus.IN_PROGRESS && status === OrderStatus.COMPLETED);
        if (!canTransition) {
          return {
            error: `Cannot change order status from ${order.status} to ${status}.`,
          } as const;
        }

        await tx.order.update({ where: { id: order.id }, data: { status } });
        return { orderId: order.id, status } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) return { success: false, error: result.error };
    revalidateOrderPages(orderId);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (isSerializationConflict(error)) {
      return { success: false, error: "Order status changed concurrently. Please retry." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status.",
    };
  }
}

export async function createOrder(formData: unknown) {
  return createOrderAction(formData);
}

export async function updateOrderStatus(formData: unknown) {
  return updateOrderStatusAction(formData);
}
