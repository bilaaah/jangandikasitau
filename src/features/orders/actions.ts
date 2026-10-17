"use server";

// src/features/orders/actions.ts
//
// Server Actions for Order management and Capacity Feasibility Analysis.
// Contains server-side validation, business context isolation, Capacity Engine execution,
// and database persistence.

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "./schema";
import { runCapacityEngine } from "@/features/capacity/engine";
import { getBusinessResources, getProductById } from "@/features/resources/queries";
import { getActiveCommitments } from "./queries";
import type { CapacityEngineInput, CapacityEngineResult } from "@/features/capacity/types";
import { OrderStatus, FeasibilityStatus, BottleneckResourceType, BottleneckSeverity } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Real-time feasibility check (preview) without persisting to DB.
 * Allows DSS users to test quantities and delivery dates interactively.
 */
export async function checkFeasibilityPreview(
  productId: string,
  quantity: number,
  deliveryDateStr: string,
): Promise<ActionResult<CapacityEngineResult>> {
  try {
    const businessId = await getBusinessId();

    if (!productId || quantity <= 0 || !deliveryDateStr) {
      return { success: false, error: "Product, valid quantity, and delivery date are required." };
    }

    const deliveryDate = new Date(deliveryDateStr);
    if (isNaN(deliveryDate.getTime())) {
      return { success: false, error: "Invalid delivery date." };
    }

    const [resources, product, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getProductById(productId, businessId),
      getActiveCommitments(businessId),
    ]);

    if (!product) {
      return { success: false, error: "Selected product not found." };
    }

    const engineInput: CapacityEngineInput = {
      newOrder: {
        quantity,
        productId,
        analysisDate: new Date(),
        requiredDeliveryDate: deliveryDate,
      },
      product: {
        workerHoursPerUnit: product.workerHoursPerUnit,
        machineHoursPerUnit: product.machineHoursPerUnit,
        materials: product.materials.map((pm) => ({
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

    const analysisResult = runCapacityEngine(engineInput);

    return {
      success: true,
      data: analysisResult,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to run capacity analysis.",
    };
  }
}

/**
 * Creates an order, runs the deterministic Capacity Engine, and persists the analysis snapshot.
 */
export async function createOrder(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; analysis: CapacityEngineResult }>> {
  try {
    const businessId = await getBusinessId();

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
        materials: product.materials.map((pm) => ({
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred while creating order.",
    };
  }
}

/**
 * Updates an order status (e.g. DRAFT -> CONFIRMED, CONFIRMED -> IN_PROGRESS, etc.)
 */
export async function updateOrderStatus(
  formData: unknown,
): Promise<ActionResult<{ orderId: string; status: OrderStatus }>> {
  try {
    const businessId = await getBusinessId();

    const parsed = UpdateOrderStatusSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid status update payload.",
      };
    }

    const { orderId, status } = parsed.data;

    // Verify order ownership
    const existingOrder = await db.order.findFirst({
      where: { id: orderId, businessId },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found." };
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true,
      data: { orderId: updated.id, status: updated.status },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update order status.",
    };
  }
}
