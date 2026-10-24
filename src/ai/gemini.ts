// src/ai/gemini.ts
//
// Google Gemini LLM Client with Instant Offline Fallback.
// Ensures development servers run ultra-lightweight and never hang on slow networks or missing keys.
// Owned by Anggota 3 (AI Lead).

import type { AiOrderAdvice } from "./types";
import type { CapacityEngineResult } from "@/engine/types";

/**
 * Generates advice using Gemini REST API or falls back to smart local heuristics.
 */
export async function callGeminiAdvisory(prompt: string, analysis: CapacityEngineResult): Promise<AiOrderAdvice> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateLocalFallbackAdvice(analysis);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to avoid dev server lag

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Gemini] Request returned status ${response.status}. Using smart fallback.`);
      return generateLocalFallbackAdvice(analysis);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return generateLocalFallbackAdvice(analysis);
    }

    const parsed = JSON.parse(rawText) as AiOrderAdvice;
    return {
      ...parsed,
      isFallback: false,
    };
  } catch {
    return generateLocalFallbackAdvice(analysis);
  }
}

/**
 * Deterministic local heuristic generator (0ms, 0 external calls, 0 RAM overhead).
 * Used when offline, during testing, or when GEMINI_API_KEY is not yet configured.
 */
export function generateLocalFallbackAdvice(analysis: CapacityEngineResult): AiOrderAdvice {
  const criticals = analysis.bottlenecks.filter((b) => b.severity === "CRITICAL");
  const warnings = analysis.bottlenecks.filter((b) => b.severity === "WARNING");

  if (analysis.status === "NOT_FEASIBLE") {
    const materialShortage = criticals.find((b) => b.resourceType === "MATERIAL");
    const workerShortage = criticals.find((b) => b.resourceType === "WORKER");
    const deadlineIssue = criticals.find((b) => b.resourceType === "TIME");

    const actionItems = [];

    if (materialShortage) {
      actionItems.push({
        category: "MATERIAL" as const,
        priority: "HIGH" as const,
        action: "Lakukan restock bahan baku prioritas atau pesan bahan secara ekspres.",
        impact: materialShortage.description,
      });
    }

    if (workerShortage) {
      actionItems.push({
        category: "WORKFORCE" as const,
        priority: "HIGH" as const,
        action: "Pekerjakan 1–2 tenaga kerja lepas (freelance) atau jadwalkan lembur terkontrol.",
        impact: `Kekurangan jam kerja sebesar ${Math.abs(analysis.workerAnalysis.gap)} jam.`,
      });
    }

    if (deadlineIssue) {
      actionItems.push({
        category: "DEADLINE" as const,
        priority: "HIGH" as const,
        action: "Tawarkan opsi pengiriman bertahap (split-delivery) atau mundurkan deadline 2–3 hari kerja.",
        impact: `Mengatasi defisit waktu produksi (${analysis.bufferDays} hari buffer).`,
      });
    }

    return {
      headline: "Pesanan Melebihi Batas Kapasitas Riil",
      summary: "Kapasitas saat ini tidak mencukupi untuk memenuhi pesanan sesuai jadwal tanpa tindakan mitigasi langsung pada bahan baku atau tenaga kerja.",
      riskAssessment: "CRITICAL",
      actionItems,
      customerNegotiationTip: "Informasikan estimasi waktu produksi realistis atau tawarkan pengiriman gelombang pertama lebih awal.",
      isFallback: true,
    };
  }

  if (analysis.status === "AT_RISK") {
    return {
      headline: "Kapasitas Ketat, Butuh Pengawasan Ketat",
      summary: `Tingkat utilisasi mencapai batas atas (${analysis.workerAnalysis.utilizationPercent}% tenaga kerja). Resiko keterlambatan tinggi jika terjadi kendala operasional mendadak.`,
      riskAssessment: "HIGH",
      actionItems: [
        {
          category: "STRATEGY",
          priority: "MEDIUM",
          action: "Kunci stok bahan baku dan prioritaskan antrean produksi pesanan ini.",
          impact: "Mencegah perebutan sumber daya dengan pesanan reguler lainnya.",
        },
        {
          category: "WORKFORCE",
          priority: "MEDIUM",
          action: "Siapkan cadangan lembur 1 jam per hari selama masa produksi.",
          impact: `Mengamankan buffer hari yang tersisa (${analysis.bufferDays} hari kerja).`,
        },
      ],
      customerNegotiationTip: "Konfirmasikan spesifikasi final dan DP segera agar jadwal produksi bisa langsung dikunci tanpa penundaan.",
      isFallback: true,
    };
  }

  return {
    headline: "Kapasitas Aman & Siap Diterima",
    summary: `Seluruh kebutuhan tenaga kerja, mesin, dan bahan baku tercukupi dengan buffer ${analysis.bufferDays} hari kerja yang sehat.`,
    riskAssessment: "LOW",
    actionItems: [
      {
        category: "STRATEGY",
        priority: "LOW",
        action: "Konfirmasi pesanan dan alokasikan bahan baku dari gudang.",
        impact: "Mengunci status komitmen kapasitas di sistem.",
      },
    ],
    customerNegotiationTip: "Berikan konfirmasi kesanggupan jadwal tepat waktu untuk membangun reputasi kepuasan pelanggan.",
    isFallback: true,
  };
}
