"use server";

// src/actions/ai.actions.ts
//
// Server Action untuk saran AI. Wajib login dan memvalidasi masukan dari klien.

import { getBusinessId } from "@/lib/context";
import { generateOrderFeasibilityAdvice, type GenerateAdviceInput } from "@/ai/service";
import type { AiOrderAdvice } from "@/ai/types";
import type { ActionResult } from "./feasibility.actions";

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