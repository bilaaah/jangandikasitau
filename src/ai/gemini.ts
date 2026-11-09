// src/ai/gemini.ts
//
// Google Gemini LLM Client: keluaran dipaksa skema, divalidasi Zod, dicek terhadap engine,
// lalu jatuh ke heuristik lokal jika gagal.
// Owned by Anggota 3 (AI Lead).

import type { AiOrderAdvice, RiskLevel, WhatIfAiInsight, WhatIfScenarioSummary } from "./types";
import type { CapacityEngineResult, FeasibilityStatus } from "@/engine/types";
import type { WhatIfSimulationResult } from "@/engine/simulation/types";
import {
  adviceSchema,
  geminiResponseSchema,
  geminiWhatIfResponseSchema,
  whatIfInsightSchema,
} from "./schema";

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
  responseSchema: object = geminiResponseSchema,
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
          responseSchema,
          temperature: 0.2,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
      signal: controller.signal,
    });
        if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[AI Gemini] ${plan.name} returned status ${response.status}. ${detail.slice(0, 200)}`,
      );
      return null;
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (error) {
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : "unknown error";
    console.warn(`[AI Gemini] ${plan.name} gagal (${plan.timeoutMs}ms): ${reason}`);
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
  return hasPercentagesOutside(text, [
    analysis.workerAnalysis.utilizationPercent,
    analysis.machineAnalysis.utilizationPercent,
    ...KNOWN_PERCENT_REFERENCES,
  ]);
}

/** Benar jika ada persentase di teks yang tidak ada di daftar angka sah (toleransi pembulatan 0,6). */
export function hasPercentagesOutside(text: string, allowed: number[]): boolean {
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

// ---------------------------------------------------------------------------
// What-If: penjelasan hasil simulasi
// ---------------------------------------------------------------------------

const STATUS_LABEL_ID: Record<FeasibilityStatus, string> = {
  FEASIBLE: "Bisa Dikerjakan",
  AT_RISK: "Masih Perlu Perhatian",
  NOT_FEASIBLE: "Belum Sanggup",
};

/** Semua persentase yang sah disebut AI: dari hasil engine dan tuas skenario. */
export function whatIfAllowedPercents(
  sim: WhatIfSimulationResult,
  scenario: WhatIfScenarioSummary,
): number[] {
  const results = [
    sim.baselineResult,
    sim.simulatedResult,
    sim.splitDelivery?.wave1Result,
    sim.splitDelivery?.wave2Result,
  ].filter((r): r is CapacityEngineResult => Boolean(r));
  const split = scenario.splitDelivery?.firstWavePercent;
  return [
    ...results.flatMap((r) => [r.workerAnalysis.utilizationPercent, r.machineAnalysis.utilizationPercent]),
    Math.abs(sim.deltaWorkerUtilization),
    Math.abs(sim.deltaMachineUtilization),
    scenario.outsourcePercent,
    100 - scenario.outsourcePercent,
    ...(split !== undefined ? [split, 100 - split] : []),
    ...KNOWN_PERCENT_REFERENCES,
  ];
}

/**
 * Penjelasan What-If via Gemini (model utama, lalu cadangan), divalidasi Zod dan dicek
 * terhadap angka engine; jatuh ke penjelasan lokal jika gagal.
 */
export async function callGeminiWhatIf(
  prompt: string,
  sim: WhatIfSimulationResult,
  scenario: WhatIfScenarioSummary,
): Promise<WhatIfAiInsight> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return generateLocalWhatIfInsight(sim, scenario);

  const allowed = whatIfAllowedPercents(sim, scenario);
  const startedAt = Date.now();
  for (const plan of getModelChain()) {
    const remainingMs = TOTAL_AI_BUDGET_MS - (Date.now() - startedAt);
    if (remainingMs < 1000) break;
    const rawText = await requestGeminiJson(
      { ...plan, timeoutMs: Math.min(plan.timeoutMs, remainingMs) },
      apiKey,
      prompt,
      geminiWhatIfResponseSchema,
    );
    if (!rawText) continue;

    try {
      const cleaned = rawText.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      const parsed = whatIfInsightSchema.safeParse(JSON.parse(cleaned));
      if (!parsed.success) {
        console.warn(`[AI Gemini] ${plan.name}: output What-If gagal validasi Zod.`);
        continue;
      }
      if (hasPercentagesOutside(JSON.stringify(parsed.data), allowed)) {
        console.warn(`[AI Gemini] ${plan.name}: persentase What-If tidak cocok dengan engine.`);
        continue;
      }
      return { ...parsed.data, isFallback: false };
    } catch {
      continue;
    }
  }
  return generateLocalWhatIfInsight(sim, scenario);
}

/** Penjelasan deterministik dari angka engine (tanpa jaringan). */
export function generateLocalWhatIfInsight(
  sim: WhatIfSimulationResult,
  scenario: WhatIfScenarioSummary,
): WhatIfAiInsight {
  const b = sim.baselineResult;
  const a = sim.simulatedResult;
  const statusText =
    a.status === b.status
      ? `Status tetap "${STATUS_LABEL_ID[a.status]}".`
      : `Status berubah dari "${STATUS_LABEL_ID[b.status]}" menjadi "${STATUS_LABEL_ID[a.status]}".`;
  const feasibilityComparison =
    `${statusText} Utilisasi tenaga kerja ${b.workerAnalysis.utilizationPercent}% menjadi ` +
    `${a.workerAnalysis.utilizationPercent}%, mesin ${b.machineAnalysis.utilizationPercent}% menjadi ` +
    `${a.machineAnalysis.utilizationPercent}%, buffer ${b.bufferDays} menjadi ${a.bufferDays} hari kerja.`;

  const recommendedTradeoff =
    a.status === "FEASIBLE"
      ? sim.statusImproved
        ? "Kombinasi ini sudah cukup untuk menerima pesanan. Pertahankan hanya tuas yang paling murah dan paling mudah dijalankan."
        : "Pesanan sudah aman tanpa tambahan, jadi tidak perlu mengaktifkan solusi yang menambah biaya."
      : a.status === "AT_RISK"
        ? "Pesanan bisa diterima dengan pengawasan ketat. Pertimbangkan satu tuas tambahan agar buffer lebih longgar."
        : "Kombinasi ini belum cukup. Coba gabungkan pengalihan ke mitra maklon, kirim bertahap, atau negosiasi tenggat.";

  const pros: string[] = [];
  if (sim.statusImproved) pros.push(`Status pesanan naik menjadi "${STATUS_LABEL_ID[a.status]}".`);
  if (sim.resolvedBottlenecksCount > 0) pros.push(`${sim.resolvedBottlenecksCount} kendala operasional teratasi.`);
  if (scenario.extraWorkerDailyHours > 0)
    pros.push(`Kapasitas tenaga kerja bertambah ${scenario.extraWorkerDailyHours} jam per hari.`);
  if (scenario.deadlineShiftWorkingDays > 0)
    pros.push(`Tenggat mundur ${scenario.deadlineShiftWorkingDays} hari kerja sehingga produksi lebih longgar.`);
  if (sim.outsourcedUnits > 0)
    pros.push(`${sim.outsourcedUnits} unit dialihkan ke mitra maklon; beban internal tinggal ${sim.internalUnits} unit.`);
  if (sim.splitDelivery)
    pros.push(
      `Kirim bertahap: ${sim.splitDelivery.wave1Units} unit tepat tenggat, ${sim.splitDelivery.wave2Units} unit menyusul.`,
    );
  if (pros.length === 0) pros.push("Belum ada perubahan; geser slider untuk mencoba solusi.");

  const cons: string[] = [];
  if (scenario.extraWorkerDailyHours > 0) cons.push("Menambah biaya lembur atau tenaga kerja lepas.");
  if (scenario.deadlineShiftWorkingDays > 0) cons.push("Butuh persetujuan pelanggan untuk mundur tenggat.");
  if (sim.outsourcedUnits > 0) cons.push("Kualitas dan jadwal sebagian unit bergantung pada mitra maklon.");
  if (sim.splitDelivery) cons.push("Ada ongkos kirim tambahan dan pelanggan menerima barang dalam dua termin.");
  if (a.bottlenecks.length > 0) cons.push(`Masih ada ${a.bottlenecks.length} kendala yang belum teratasi.`);
  if (cons.length === 0) cons.push("Tidak ada biaya tambahan dari skenario ini.");

  const actionPlan =
    a.status === "NOT_FEASIBLE"
      ? "Tambah satu tuas lagi di simulasi sampai status naik, atau hubungi pelanggan untuk menegosiasikan tenggat atau jumlah."
      : a.status === "AT_RISK"
        ? "Siapkan jadwal produksi rinci, kunci stok bahan, dan pantau progres harian selama masa produksi."
        : "Konfirmasi pesanan, kunci stok bahan baku, dan jadwalkan produksi sesuai skenario ini.";

  return {
    feasibilityComparison,
    recommendedTradeoff,
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 4),
    actionPlan,
    isFallback: true,
  };
}
