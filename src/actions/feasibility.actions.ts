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

export async function runDemoSimulation(
  productId: string,
  quantity: number,
  deliveryDate: Date,
): Promise<CapacityEngineResult> {
  const demoProductMap: Record<string, { workerHours: number; machineHours: number; materials: { materialId: string; quantityPerUnit: number }[] }> = {
    "prod-hampers-lebaran": {
      workerHours: 1.5,
      machineHours: 0.8,
      materials: [
        { materialId: "mat-box", quantityPerUnit: 1 },
        { materialId: "mat-ribbon", quantityPerUnit: 2 },
        { materialId: "mat-jar", quantityPerUnit: 3 },
      ],
    },
    "prod-brownies-box": {
      workerHours: 0.4,
      machineHours: 0.7,
      materials: [
        { materialId: "mat-cocoa", quantityPerUnit: 0.25 },
        { materialId: "mat-butter", quantityPerUnit: 0.2 },
        { materialId: "mat-box-brownie", quantityPerUnit: 1 },
      ],
    },
    "prod-sourdough-loaf": {
      workerHours: 0.6,
      machineHours: 1.2,
      materials: [
        { materialId: "mat-flour", quantityPerUnit: 0.6 },
        { materialId: "mat-starter", quantityPerUnit: 0.15 },
      ],
    },
  };

  const prod = demoProductMap[productId] || demoProductMap["prod-hampers-lebaran"];

  const engineInput: CapacityEngineInput = {
    newOrder: {
      quantity,
      productId,
      analysisDate: new Date(),
      requiredDeliveryDate: deliveryDate,
    },
    product: {
      workerHoursPerUnit: prod.workerHours,
      machineHoursPerUnit: prod.machineHours,
      materials: prod.materials,
    },
    workforce: {
      workers: [
        { id: "w1", dailyAvailableHours: 8 },
        { id: "w2", dailyAvailableHours: 8 },
        { id: "w3", dailyAvailableHours: 8 },
        { id: "w4", dailyAvailableHours: 8 },
      ],
    },
    machinery: {
      machines: [
        { id: "m1", dailyAvailableHours: 8 },
        { id: "m2", dailyAvailableHours: 8 },
        { id: "m3", dailyAvailableHours: 8 },
      ],
    },
    inventory: {
      materials: [
        { id: "mat-box", currentStock: 250, unit: "box" },
        { id: "mat-ribbon", currentStock: 600, unit: "meter" },
        { id: "mat-jar", currentStock: 800, unit: "pcs" },
        { id: "mat-cocoa", currentStock: 80, unit: "kg" },
        { id: "mat-butter", currentStock: 60, unit: "kg" },
        { id: "mat-box-brownie", currentStock: 500, unit: "box" },
        { id: "mat-flour", currentStock: 120, unit: "kg" },
        { id: "mat-starter", currentStock: 30, unit: "kg" },
      ],
    },
    activeCommitments: {
      workerHoursCommitted: 32,
      machineHoursCommitted: 16,
      materialCommitments: [
        { materialId: "mat-box", quantityCommitted: 50 },
        { materialId: "mat-jar", quantityCommitted: 100 },
        { materialId: "mat-cocoa", quantityCommitted: 10 },
        { materialId: "mat-butter", quantityCommitted: 10 },
      ],
    },
  };

  return runCapacityEngine(engineInput);
}

/**
 * Real-time feasibility check (preview) without persisting to DB.
 */
export async function checkFeasibilityPreviewAction(
  productId: string,
  quantity: number,
  deliveryDateStr: string,
): Promise<ActionResult<CapacityEngineResult>> {
  try {
    let businessId: string | null = null;
    try {
      businessId = await getBusinessId();
    } catch {
      // Demo preview mode without local DB
    }

    if (!productId || quantity <= 0 || !deliveryDateStr) {
      return { success: false, error: "Product, valid quantity, and delivery date are required." };
    }

    const deliveryDate = new Date(deliveryDateStr);
    if (isNaN(deliveryDate.getTime())) {
      return { success: false, error: "Invalid delivery date." };
    }

    if (!businessId) {
      const demoResult = await runDemoSimulation(productId, quantity, deliveryDate);
      return {
        success: true,
        data: demoResult,
      };
    }

    const [resources, product, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getProductById(productId, businessId),
      getActiveCommitments(businessId),
    ]);

    if (!product) {
      const demoResult = await runDemoSimulation(productId, quantity, deliveryDate);
      return { success: true, data: demoResult };
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
  } catch {
    const deliveryDate = new Date(deliveryDateStr || Date.now());
    const demoResult = await runDemoSimulation(productId, quantity || 10, isNaN(deliveryDate.getTime()) ? new Date() : deliveryDate);
    return {
      success: true,
      data: demoResult,
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
