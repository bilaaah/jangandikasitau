// src/ai/types.ts
//
// Structured types for AI-generated Decision Support System (DSS) insights.
// Owned by AI Integration Lead (Anggota 3).

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface OperationalActionItem {
  category: "WORKFORCE" | "MACHINERY" | "MATERIAL" | "DEADLINE" | "STRATEGY";
  priority: "HIGH" | "MEDIUM" | "LOW";
  action: string;
  impact: string;
}

export interface AiOrderAdvice {
  headline: string;
  summary: string;
  riskAssessment: RiskLevel;
  actionItems: OperationalActionItem[];
  customerNegotiationTip?: string;
  isFallback?: boolean;
}

export interface WhatIfAiInsight {
  feasibilityComparison: string;
  recommendedTradeoff: string;
  pros: string[];
  cons: string[];
  actionPlan: string;
  isFallback?: boolean;
}

/** Tuas skenario yang sedang dicoba di Simulasi What-If (dipakai prompt dan fallback AI). */
export interface WhatIfScenarioSummary {
  /** Total jam kerja tambahan per hari (lembur + pekerja lepas). */
  extraWorkerDailyHours: number;
  extraMachineDailyHours: number;
  /** Mundur tenggat, dalam HARI KERJA. */
  deadlineShiftWorkingDays: number;
  outsourcePercent: number;
  splitDelivery?: { firstWavePercent: number; secondWaveDelayWorkingDays: number };
}
