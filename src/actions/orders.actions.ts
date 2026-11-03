"use server";

// src/actions/orders.actions.ts
//
// Server Actions for Order creation and status updates.
// Coordinates validation (schemas), business context, capacity engine execution,
// and database persistence.

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "@/schemas/orders.schema";
import { runCapacityEngine } from "@/engine/capacity/calculator";
import { getBusinessResources, getProductById } from "@/queries/resources.queries";
import { getActiveCommitments } from "@/queries/orders.queries";
import type { ActionResult } from "./feasibility.actions";
import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";
import { OrderStatus, FeasibilityStatus, BottleneckResourceType, BottleneckSeverity } from "@prisma/client";

/**
 * Creates an order, runs the deterministic Capacity Engine, and persists the snapshot.
 */
export async function createOrderAction(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; analysis: CapacityEngineResult }>> {
  const businessId = await getBusinessId();

  try {
    // 1. Server-side validation
    const parsed = CreateOrderSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review your input.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { customerName, productId, quantity, requiredDeliveryDate: deliveryDateStr, notes } = parsed.data;
    const requiredDeliveryDate = new Date(deliveryDateStr);

    // 2. Query business resources, product, and commitments
    const [resources, product, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getProductById(productId, businessId),
      getActiveCommitments(businessId),
    ]);

    if (!product) {
      return { success: false, error: "Selected product does not exist." };
    }

    // 3. Assemble CapacityEngineInput
    const engineInput: CapacityEngineInput = {
      newOrder: {
        quantity,
        productId,
        analysisDate: new Date(),
        requiredDeliveryDate,
      },
      product: {
        workerHoursPerUnit: product.workerHoursPerUnit,
        machineHoursPerUnit: product.machineHoursPerUnit,
        materials: product.materials.map((pm: any) => ({
          materialId: pm.materialId,
          quantityPerUnit: pm.quantityPerUnit,
        })),
      },
      workforce: {
        workers: resources.workers.map((w) => ({
          id: w.id,
          dailyAvailableHours: w.dailyAvailableHours,
        })),
      },
      machinery: {
        machines: resources.machines.map((m) => ({
          id: m.id,
          dailyAvailableHours: m.dailyAvailableHours,
        })),
      },
      inventory: {
        materials: resources.materials.map((m) => ({
          id: m.id,
          currentStock: m.currentStock,
          unit: m.unit,
        })),
      },
      activeCommitments: commitments,
    };

    // 4. Run Capacity Engine (Pure function)
    const analysis = runCapacityEngine(engineInput);

    // 5. Atomic persistence in Database transaction
    const savedOrder = await db.$transaction(async (tx) => {
      // Create Order & OrderItem
      const order = await tx.order.create({
        data: {
          businessId,
          customerName,
          notes: notes || null,
          status: OrderStatus.DRAFT,
          requiredDeliveryDate,
          items: {
            create: {
              productId,
              quantity,
            },
          },
        },
      });

      // Save CapacityAnalysis snapshot
      await tx.capacityAnalysis.create({
        data: {
          orderId: order.id,
          status: analysis.status as FeasibilityStatus,
          workerUtilizationPercent: analysis.workerAnalysis.utilizationPercent,
          machineUtilizationPercent: analysis.machineAnalysis.utilizationPercent,
          availableWorkDays: analysis.availableWorkDays,
          estimatedProductionDays: analysis.estimatedProductionDays,
          bufferDays: analysis.bufferDays,
          reasoning: analysis.reasoning,
          bottlenecks: {
            create: analysis.bottlenecks.map((b) => ({
              resourceType: b.resourceType as BottleneckResourceType,
              resourceId: b.resourceId ?? null,
              severity: b.severity as BottleneckSeverity,
              description: b.description,
            })),
          },
        },
      });

      return order;
    });

    revalidatePath("/orders");

    return {
      success: true,
      data: {
        orderId: savedOrder.id,
        analysis,
      },
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
 * Updates an order status (e.g. DRAFT -> CONFIRMED, CONFIRMED -> IN_PROGRESS, etc.)
 */
export async function updateOrderStatusAction(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; status: OrderStatus }>> {
  const businessId = await getBusinessId();

  try {
    const parsed = UpdateOrderStatusSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid status update payload.",
      };
    }

    const { orderId, status } = parsed.data;

    const updated = await db.order.updateMany({
      where: { id: orderId, businessId },
      data: { status: status as OrderStatus },
    });

    if (updated.count === 0) {
      return { success: false, error: "Order not found." };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true,
      data: { orderId, status: status as OrderStatus },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status.",
    };
  }
}

// Backward compatibility aliases
export async function createOrder(formData: unknown) {
  return createOrderAction(formData);
}

export async function updateOrderStatus(formData: unknown) {
  return updateOrderStatusAction(formData);
}
