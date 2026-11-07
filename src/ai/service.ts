// src/ai/service.ts
//
// High-level AI DSS Service.
// Orchestrates prompt generation, Gemini LLM execution, and fallback handling.
// Owned by Anggota 3 (AI Lead).

import { buildAdvisoryPrompt } from "./prompts/advisory.prompt";
import { callGeminiAdvisory } from "./gemini";
import type { AiOrderAdvice } from "./types";
import type { CapacityEngineResult } from "@/engine/types";

export interface GenerateAdviceInput {
  productName: string;
  quantity: number;
  customerName: string;
  deliveryDateStr: string;
  analysis: CapacityEngineResult;
  /** id pertanyaan cepat dari UI: general | why_risk | bottleneck | how_fix | add_worker | priority */
  question?: string;
  /** Peringatan lead time supplier hasil findLeadTimeConflicts (opsional). */
  leadTimeWarnings?: string[];
}

/**
 * Generates actionable DSS operational advice for a given order's capacity analysis.
 */
export async function generateOrderFeasibilityAdvice(input: GenerateAdviceInput): Promise<AiOrderAdvice> {
  const prompt = buildAdvisoryPrompt(input);
  return callGeminiAdvisory(prompt, input.analysis, input.leadTimeWarnings ?? []);
}