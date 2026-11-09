"use server";

// src/actions/ai.actions.ts
//
// Server Action untuk saran AI. Wajib login dan memvalidasi masukan dari klien.

import { z } from "zod";
import { getBusinessId } from "@/lib/context";
import { findLeadTimeConflicts } from "@/ai/leadTime";
import { getBusinessResources } from "@/queries/resources.queries";
import { getOrderById, getActiveCommitments } from "@/queries/orders.queries";
import { runCapacityEngine } from "@/engine/capacity/calculator";
import {
  generateOrderFeasibilityAdvice,
  generateWhatIfInsight,
  type GenerateAdviceInput,
} from "@/ai/service";
import type { AiOrderAdvice, WhatIfAiInsight, WhatIfScenarioSummary } from "@/ai/types";
import type { ActionResult } from "./feasibility.actions";
import { runWhatIfForOrderAction } from "./simulation.actions";
import { MAX_ADDITIONAL_WORKER_DAILY_HOURS } from "@/engine/simulation/types";

const STATUSES = ["FEASIBLE", "AT_RISK", "NOT_FEASIBLE"];

/**
 * Menghasilkan rekomendasi AI operasional khusus untuk pesanan tertentu berdasarkan ID-nya.
 * Data pesanan, produk, komitmen aktif, dan kalkulasi kapasitas dieksekusi secara aman di server.
 */
export async function generateAdviceForOrderAction(input: {
  orderId: string;
  question?: string;
}): Promise<ActionResult<AiOrderAdvice>> {
  const businessId = await getBusinessId();

  if (!input?.orderId || typeof input.orderId !== "string") {
    return { success: false, error: "ID pesanan tidak valid." };
  }

  try {
    const order = await getOrderById(input.orderId, businessId);
    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const item = order.items?.[0];
    if (!item?.product) {
      return { success: false, error: "Pesanan belum memiliki rincian produk yang valid." };
    }

    const [resources, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getActiveCommitments(businessId),
    ]);

    const analysis = runCapacityEngine({
      newOrder: {
        quantity: item.quantity,
        productId: item.productId,
        analysisDate: new Date(),
        requiredDeliveryDate: order.requiredDeliveryDate,
      },
      product: {
        workerHoursPerUnit: item.product.workerHoursPerUnit,
        machineHoursPerUnit: item.product.machineHoursPerUnit,
        materials: item.product.materials.map((pm) => ({
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
    });

    const leadTimes = Object.fromEntries(
      resources.materials.map((material) => [
        material.id,
        { name: material.name, leadTimeDays: material.leadTimeDays },
      ]),
    );

    const leadTimeWarnings = findLeadTimeConflicts({
      materialAnalysis: analysis.materialAnalysis,
      leadTimes,
      availableWorkDays: analysis.availableWorkDays,
      estimatedProductionDays: analysis.estimatedProductionDays,
    });

    const advice = await generateOrderFeasibilityAdvice({
      productName: item.product.name,
      quantity: item.quantity,
      customerName: order.customerName,
      deliveryDateStr: order.requiredDeliveryDate.toISOString(),
      analysis,
      question: input.question,
      leadTimeWarnings,
    });

    return { success: true, data: advice };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat saran AI.",
    };
  }
}

export async function generateAdviceAction(
  input: GenerateAdviceInput,
): Promise<ActionResult<AiOrderAdvice>> {
  const businessId = await getBusinessId(); // redirect ke /login jika belum masuk

  const valid =
    !!input &&
    typeof input.productName === "string" && input.productName.length <= 150 &&
    typeof input.customerName === "string" && input.customerName.length <= 150 &&
    typeof input.deliveryDateStr === "string" && input.deliveryDateStr.length <= 40 &&
    Number.isFinite(input.quantity) && input.quantity > 0 &&
    STATUSES.includes(input.analysis?.status) &&
    (input.leadTimeWarnings === undefined ||
      (Array.isArray(input.leadTimeWarnings) &&
        input.leadTimeWarnings.length <= 5 &&
        input.leadTimeWarnings.every((w) => typeof w === "string" && w.length <= 300)));
  if (!valid) {
    return { success: false, error: "Data analisis tidak valid." };
  }

  try {
    const resources = await getBusinessResources(businessId);
    const leadTimes = Object.fromEntries(
      resources.materials.map((material) => [
        material.id,
        { name: material.name, leadTimeDays: material.leadTimeDays },
      ]),
    );
    const leadTimeWarnings = findLeadTimeConflicts({
      materialAnalysis: input.analysis.materialAnalysis,
      leadTimes,
      availableWorkDays: input.analysis.availableWorkDays,
      estimatedProductionDays: input.analysis.estimatedProductionDays,
    });
    const advice = await generateOrderFeasibilityAdvice({ ...input, leadTimeWarnings });
    return { success: true, data: advice };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat saran AI.",
    };
  }
}

// Ringkasan tuas untuk prompt. Batas nilai sama dengan AdjustmentsSchema di simulation.actions.ts.
const ScenarioSchema = z.object({
  additionalWorkerDailyHours: z.number().min(0).max(MAX_ADDITIONAL_WORKER_DAILY_HOURS).optional(),
  additionalMachineDailyHours: z.number().min(0).max(24).optional(),
  deadlineShiftDays: z.number().int().min(0).max(30).optional(),
  outsourcePercent: z.number().int().min(0).max(100).optional(),
  splitDelivery: z
    .object({
      firstWavePercent: z.number().int().min(10).max(90),
      secondWaveDelayWorkingDays: z.number().int().min(1).max(14),
    })
    .optional(),
});

/**
 * Penjelasan AI untuk hasil What-If. Simulasi dijalankan ulang di server dari data
 * database, sehingga angka yang dijelaskan AI tidak bisa dipalsukan dari klien.
 */
export async function generateWhatIfInsightAction(input: {
  orderRef: unknown;
  adjustments: unknown;
  productName: string;
  customerName: string;
}): Promise<ActionResult<WhatIfAiInsight>> {
  await getBusinessId(); // redirect ke /login jika belum masuk

  const scenario = ScenarioSchema.safeParse(input?.adjustments);
  const valid =
    !!input &&
    scenario.success &&
    typeof input.productName === "string" && input.productName.length <= 150 &&
    typeof input.customerName === "string" && input.customerName.length <= 150;
  if (!valid || !scenario.success) {
    return { success: false, error: "Data simulasi tidak valid." };
  }

  const sim = await runWhatIfForOrderAction(input.orderRef, input.adjustments);
  if (!sim.success || !sim.data) {
    return { success: false, error: sim.error ?? "Simulasi gagal dijalankan." };
  }

  const s = scenario.data;
  const summary: WhatIfScenarioSummary = {
    extraWorkerDailyHours: s.additionalWorkerDailyHours ?? 0,
    extraMachineDailyHours: s.additionalMachineDailyHours ?? 0,
    deadlineShiftWorkingDays: s.deadlineShiftDays ?? 0,
    outsourcePercent: s.outsourcePercent ?? 0,
    splitDelivery: s.splitDelivery,
  };

  try {
    const insight = await generateWhatIfInsight({
      productName: input.productName,
      customerName: input.customerName,
      sim: sim.data,
      scenario: summary,
    });
    return { success: true, data: insight };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat penjelasan AI.",
    };
  }
}
