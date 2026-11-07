// src/ai/gemini.ts
//
// Google Gemini LLM Client: keluaran dipaksa skema, divalidasi Zod, dicek terhadap engine,
// lalu jatuh ke heuristik lokal jika gagal.
// Owned by Anggota 3 (AI Lead).

import type { AiOrderAdvice, RiskLevel } from "./types";
import type { CapacityEngineResult } from "@/engine/types";
import { adviceSchema, geminiResponseSchema } from "./schema";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Persentase referensi yang sah selain utilisasi engine (samakan dengan ambang AT_RISK di engine/capacity/constants.ts). */
const KNOWN_PERCENT_REFERENCES = [85, 100];

/** Tingkat risiko ditentukan engine, bukan AI. */
const RISK_BY_STATUS: Record<CapacityEngineResult["status"], RiskLevel> = {
  FEASIBLE: "LOW",
  AT_RISK: "HIGH",
  NOT_FEASIBLE: "CRITICAL",
};

interface ModelPlan {
  name: string;
  timeoutMs: number;
}

/** Batas TOTAL menunggu AI (semua model) sebelum jatuh ke fallback lokal. */
const TOTAL_AI_BUDGET_MS = 15000;

/** Model utama cepat (lite); model cadangan lebih lambat sehingga diberi batas waktu lebih longgar. */
function getModelChain(): ModelPlan[] {
  const names = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    process.env.GEMINI_FALLBACK_MODEL || "",
  ].filter((name, index, all) => name && all.indexOf(name) === index);
  return names.map((name, index) => ({ name, timeoutMs: index === 0 ? 8000 : 12000 }));
}

async function requestGeminiJson(
  plan: ModelPlan,
  apiKey: string,
  prompt: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), plan.timeoutMs);
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}/${plan.name}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema,
          temperature: 0.2,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`[AI Gemini] ${plan.name} returned status ${response.status}.`);
      return null;
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Guardrail: setiap persentase di teks AI harus sama dengan utilisasi hasil engine
 * (atau ambang referensi). Jika tidak, penjelasan AI ditolak dan model berikutnya/fallback dipakai.
 */
export function hasUnknownPercentages(text: string, analysis: CapacityEngineResult): boolean {
  const allowed = [
    analysis.workerAnalysis.utilizationPercent,
    analysis.machineAnalysis.utilizationPercent,
    ...KNOWN_PERCENT_REFERENCES,
  ];
  const found = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map((m) =>
    parseFloat(m[1].replace(",", ".")),
  );
  return found.some((value) => !allowed.some((a) => Math.abs(a - value) <= 0.6));
}

/**
 * Generates advice using Gemini (model utama, lalu cadangan), divalidasi Zod,
 * atau jatuh ke heuristik lokal.
 */
export async function callGeminiAdvisory(
  prompt: string,
  analysis: CapacityEngineResult,
  leadTimeWarnings: string[] = [],
): Promise<AiOrderAdvice> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Jeda 1.2 detik agar progress step dan animasi loading terbaca dengan mulus di UI
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return generateLocalFallbackAdvice(analysis, leadTimeWarnings);
  }

  const startedAt = Date.now();
  for (const plan of getModelChain()) {
    // Sisa anggaran waktu: total tunggu AI dibatasi agar UI tidak menggantung 30 detik.
    const remainingMs = TOTAL_AI_BUDGET_MS - (Date.now() - startedAt);
    if (remainingMs < 1000) break;
    const rawText = await requestGeminiJson(
      { ...plan, timeoutMs: Math.min(plan.timeoutMs, remainingMs) },
      apiKey,
      prompt,
    );
    if (!rawText) continue;

    try {
      const cleaned = rawText.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      const parsed = adviceSchema.safeParse(JSON.parse(cleaned));
      if (!parsed.success) {
        console.warn(`[AI Gemini] ${plan.name}: output gagal validasi Zod.`);
        continue;
      }
      if (hasUnknownPercentages(JSON.stringify(parsed.data), analysis)) {
        console.warn(`[AI Gemini] ${plan.name}: persentase tidak cocok dengan engine.`);
        continue;
      }
      return {
        ...parsed.data,
        riskAssessment: RISK_BY_STATUS[analysis.status],
        isFallback: false,
      };
    } catch {
      continue;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800));
  return generateLocalFallbackAdvice(analysis, leadTimeWarnings);
}

/**
 * Deterministic local heuristic generator (0ms, 0 external calls, 0 RAM overhead).
 * Used when offline, during testing, or when GEMINI_API_KEY is not yet configured.
 */
export function generateLocalFallbackAdvice(
  analysis: CapacityEngineResult,
  leadTimeWarnings: string[] = [],
): AiOrderAdvice {
  const criticals = analysis.bottlenecks.filter((b) => b.severity === "CRITICAL");
  const warnings = analysis.bottlenecks.filter((b) => b.severity === "WARNING");

  if (analysis.status === "NOT_FEASIBLE") {
    const materialShortage = criticals.find((b) => b.resourceType === "MATERIAL");
    const workerShortage = criticals.find((b) => b.resourceType === "WORKER");
    const deadlineIssue = criticals.find((b) => b.resourceType === "TIME");

    const actionItems = [];

    if (materialShortage) {
      const leadTimeWarning = leadTimeWarnings[0];
      actionItems.push(
        leadTimeWarning
          ? {
              category: "MATERIAL" as const,
              priority: "HIGH" as const,
              action:
                "Restock tidak akan tiba tepat waktu: cari bahan substitusi lokal, atau negosiasikan jadwal kirim / pengiriman bertahap.",
              impact: leadTimeWarning,
            }
          : {
              category: "MATERIAL" as const,
              priority: "HIGH" as const,
              action: "Lakukan restock bahan baku prioritas atau pesan bahan secara ekspres.",
              impact: materialShortage.description,
            },
      );
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
