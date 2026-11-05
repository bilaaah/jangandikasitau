"use server";

// src/actions/simulation.actions.ts
//
// What-if dari data usaha yang sedang login. Tidak menulis apa pun ke database.

import { z } from "zod";
import { getBusinessId } from "@/lib/context";
import { simulateScenario } from "@/engine/simulation/scenario";
import type { WhatIfSimulationResult } from "@/engine/simulation/types";
import type { CapacityEngineInput } from "@/engine/types";
import { getBusinessResources, getProductById } from "@/queries/resources.queries";
import { getActiveCommitments } from "@/queries/orders.queries";
import type { ActionResult } from "./feasibility.actions";

const OrderRefSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(1_000_000),
  deliveryDateStr: z.string().min(1).max(40),
});

const AdjustmentsSchema = z.object({
  additionalWorkerDailyHours: z.number().min(0).max(40).optional(),
  additionalMachineDailyHours: z.number().min(0).max(24).optional(),
  deadlineShiftDays: z.number().int().min(0).max(30).optional(),
  additionalMaterialStock: z.record(z.string(), z.number().min(0).max(1_000_000)).optional(),
});

/** Menghitung berapa hari kalender yang setara dengan N hari kerja (Senin–Jumat). */
function workingDaysToCalendarDays(from: Date, workingDays: number): number {
  let added = 0;
  let calendar = 0;
  const cursor = new Date(from);
  while (added < workingDays) {
    cursor.setDate(cursor.getDate() + 1);
    calendar += 1;
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return calendar;
}

export async function runWhatIfForOrderAction(
  orderRef: unknown,
  adjustments: unknown,
): Promise<ActionResult<WhatIfSimulationResult>> {
  const businessId = await getBusinessId();

  const ref = OrderRefSchema.safeParse(orderRef);
  const adj = AdjustmentsSchema.safeParse(adjustments);
  if (!ref.success || !adj.success) {
    return { success: false, error: "Parameter simulasi tidak valid." };
  }

  const deliveryDate = new Date(ref.data.deliveryDateStr);
  if (Number.isNaN(deliveryDate.getTime())) {
    return { success: false, error: "Tanggal pengiriman tidak valid." };
  }

  try {
    const [resources, product, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getProductById(ref.data.productId, businessId),
      getActiveCommitments(businessId),
    ]);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan pada usaha ini." };
    }

    const baseInput: CapacityEngineInput = {
      newOrder: {
        quantity: ref.data.quantity,
        productId: ref.data.productId,
        analysisDate: new Date(),
        requiredDeliveryDate: deliveryDate,
      },
      product: {
        workerHoursPerUnit: product.workerHoursPerUnit,
        machineHoursPerUnit: product.machineHoursPerUnit,
        materials: product.materials.map((pm: { materialId: string; quantityPerUnit: number }) => ({
          materialId: pm.materialId,
          quantityPerUnit: pm.quantityPerUnit,
        })),
      },
      workforce: {
        workers: resources.workers.map((w) => ({ id: w.id, dailyAvailableHours: w.dailyAvailableHours })),
      },
      machinery: {
        machines: resources.machines.map((m) => ({ id: m.id, dailyAvailableHours: m.dailyAvailableHours })),
      },
      inventory: {
        materials: resources.materials.map((m) => ({ id: m.id, currentStock: m.currentStock, unit: m.unit })),
      },
      activeCommitments: commitments,
    };

        const adjustmentsForEngine = {
      ...adj.data,
      deadlineShiftDays: adj.data.deadlineShiftDays
        ? workingDaysToCalendarDays(deliveryDate, adj.data.deadlineShiftDays)
        : undefined,
    };

    return { success: true, data: simulateScenario(baseInput, adjustmentsForEngine) };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menjalankan simulasi what-if.",
    };
  }
}