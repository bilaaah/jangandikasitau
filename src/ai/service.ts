// src/ai/service.ts
//
// High-level AI DSS Service.
// Orchestrates prompt generation, Gemini LLM execution, and fallback handling.
// Owned by Anggota 3 (AI Lead).

import { buildAdvisoryPrompt } from "./prompts/advisory.prompt";
import { buildWhatIfPrompt } from "./prompts/whatif.prompt";
import { callGeminiAdvisory, callGeminiWhatIf } from "./gemini";
import type { AiOrderAdvice, WhatIfAiInsight, WhatIfScenarioSummary } from "./types";
import type { CapacityEngineResult } from "@/engine/types";
import type { WhatIfSimulationResult } from "@/engine/simulation/types";

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

export interface GenerateWhatIfInput {
  productName: string;
  customerName: string;
  sim: WhatIfSimulationResult;
  scenario: WhatIfScenarioSummary;
}

/**
 * Menjelaskan hasil simulasi What-If. Angka selalu dari engine; AI hanya merangkai bahasa.
 */
export async function generateWhatIfInsight(input: GenerateWhatIfInput): Promise<WhatIfAiInsight> {
  const prompt = buildWhatIfPrompt(input);
  return callGeminiWhatIf(prompt, input.sim, input.scenario);
}
