"use server";

// src/actions/feasibility.actions.ts
//
// Server Action for real-time capacity feasibility preview without DB persistence.
// Allows DSS users and frontend forms to test quantities and delivery dates interactively.

import { getBusinessId } from "@/lib/context";
import { runCapacityEngine } from "@/engine/capacity/calculator";
import { getBusinessResources, getProductById } from "@/queries/resources.queries";
import { getActiveCommitments } from "@/queries/orders.queries";
import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Real-time feasibility check (preview) without persisting to DB.
 */
export async function checkFeasibilityPreviewAction(
  productId: string,
  quantity: number,
  deliveryDateStr: string,
): Promise<ActionResult<CapacityEngineResult>> {
  const businessId = await getBusinessId();

  try {
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
      return { success: false, error: "Produk tidak ditemukan pada usaha ini." };
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

    const analysisResult = runCapacityEngine(engineInput);

    return {
      success: true,
      data: analysisResult,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghitung kelayakan kapasitas.",
    };
  }
}

// Backward compatibility alias
export async function checkFeasibilityPreview(
  productId: string,
  quantity: number,
  deliveryDateStr: string,
) {
  return checkFeasibilityPreviewAction(productId, quantity, deliveryDateStr);
}
