"use server";

// src/actions/ai.actions.ts
//
// Server Action untuk saran AI. Wajib login dan memvalidasi masukan dari klien.

import { z } from "zod";
import { getBusinessId } from "@/lib/context";
import {
  generateOrderFeasibilityAdvice,
  generateWhatIfInsight,
  type GenerateAdviceInput,
} from "@/ai/service";
import type { AiOrderAdvice, WhatIfAiInsight, WhatIfScenarioSummary } from "@/ai/types";
import type { ActionResult } from "./feasibility.actions";
import { runWhatIfForOrderAction } from "./simulation.actions";

const STATUSES = ["FEASIBLE", "AT_RISK", "NOT_FEASIBLE"];

export async function generateAdviceAction(
  input: GenerateAdviceInput,
): Promise<ActionResult<AiOrderAdvice>> {
  await getBusinessId(); // redirect ke /login jika belum masuk

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
    const advice = await generateOrderFeasibilityAdvice(input);
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
  additionalWorkerDailyHours: z.number().min(0).max(40).optional(),
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
