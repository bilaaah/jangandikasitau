"use server";

// src/actions/ai.actions.ts
//
// Server Action for AI Decision Support System (DSS) recommendations.
// Bridges frontend UI with the Gemini AI service.

import { generateOrderFeasibilityAdvice, type GenerateAdviceInput } from "@/ai/service";
import type { AiOrderAdvice } from "@/ai/types";
import type { ActionResult } from "./feasibility.actions";

export async function generateAdviceAction(
  input: GenerateAdviceInput,
): Promise<ActionResult<AiOrderAdvice>> {
  try {
    const advice = await generateOrderFeasibilityAdvice(input);
    return {
      success: true,
      data: advice,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to generate AI advice.",
    };
  }
}
