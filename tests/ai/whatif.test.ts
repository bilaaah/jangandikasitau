import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { simulateScenario } from "@/engine/simulation/scenario";
import { buildWhatIfPrompt } from "@/ai/prompts/whatif.prompt";
import {
  callGeminiWhatIf,
  generateLocalWhatIfInsight,
  hasPercentagesOutside,
  whatIfAllowedPercents,
} from "@/ai/gemini";
import type { CapacityEngineInput } from "@/engine/types";
import type { WhatIfScenarioSummary } from "@/ai/types";

// Senin 2 Nov 2026 -> Selasa 10 Nov 2026 = 6 hari kerja; 3 pekerja x 8 jam = 144 jam.
// 20 unit x 8 jam = 160 jam -> baseline NOT_FEASIBLE.
function makeInput(): CapacityEngineInput {
  return {
    newOrder: {
      quantity: 20,
      productId: "p1",
      analysisDate: new Date("2026-11-02T00:00:00"),
      requiredDeliveryDate: new Date("2026-11-10T00:00:00"),
    },
    product: {
      workerHoursPerUnit: 8,
      machineHoursPerUnit: 2,
      materials: [{ materialId: "flour", quantityPerUnit: 2 }],
    },
    workforce: {
      workers: [
        { id: "w1", dailyAvailableHours: 8 },
        { id: "w2", dailyAvailableHours: 8 },
        { id: "w3", dailyAvailableHours: 8 },
      ],
    },
    machinery: {
      machines: [
        { id: "m1", dailyAvailableHours: 8 },
        { id: "m2", dailyAvailableHours: 8 },
      ],
    },
    inventory: { materials: [{ id: "flour", currentStock: 1000, unit: "kg" }] },
    activeCommitments: { workerHoursCommitted: 0, machineHoursCommitted: 0, materialCommitments: [] },
  };
}

const scenario: WhatIfScenarioSummary = {
  extraWorkerDailyHours: 0,
  extraMachineDailyHours: 0,
  deadlineShiftWorkingDays: 0,
  outsourcePercent: 40,
};
const sim = simulateScenario(makeInput(), { outsourcePercent: 40 });

function geminiReply(text: string) {
  return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
}

function validInsight() {
  const w = sim.simulatedResult.workerAnalysis.utilizationPercent;
  return {
    feasibilityComparison: `Utilisasi tenaga kerja turun menjadi ${w}% sehingga pesanan bisa dikerjakan.`,
    recommendedTradeoff: "Alihkan sebagian unit ke mitra maklon dan pantau kualitasnya.",
    pros: ["Beban internal turun."],
    cons: ["Bergantung pada mitra maklon."],
    actionPlan: "Hubungi mitra maklon dan konfirmasi jadwal.",
  };
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "model-utama");
  vi.stubEnv("GEMINI_FALLBACK_MODEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("buildWhatIfPrompt", () => {
  it("memuat data pesanan, tuas, dan larangan mengarang angka", () => {
    const prompt = buildWhatIfPrompt({ productName: "Hampers", customerName: "Budi", sim, scenario });
    expect(prompt).toContain("Hampers");
    expect(prompt).toContain("Budi");
    expect(prompt).toContain("40% unit dialihkan ke mitra maklon");
    expect(prompt).toContain("Jumlah total: 20 unit");
    expect(prompt).toContain("Jangan mengarang angka baru");
  });
});

describe("whatIfAllowedPercents / hasPercentagesOutside", () => {
  it("menerima angka engine dan menolak angka lain", () => {
    const allowed = whatIfAllowedPercents(sim, scenario);
    const w = sim.simulatedResult.workerAnalysis.utilizationPercent;
    expect(hasPercentagesOutside(`Utilisasi ${w}% dan outsource 40%`, allowed)).toBe(false);
    expect(hasPercentagesOutside("Utilisasi akan 37,3% saja", allowed)).toBe(true);
  });
});

describe("generateLocalWhatIfInsight", () => {
  it("menyusun penjelasan dari angka engine dan menandai fallback", () => {
    const r = generateLocalWhatIfInsight(sim, scenario);
    expect(r.isFallback).toBe(true);
    expect(r.feasibilityComparison).toContain("Belum Sanggup");
    expect(r.feasibilityComparison).toContain("Bisa Dikerjakan");
    expect(r.pros.some((p) => p.includes("8 unit"))).toBe(true);
    expect(r.cons.length).toBeGreaterThan(0);
    expect(hasPercentagesOutside(JSON.stringify(r), whatIfAllowedPercents(sim, scenario))).toBe(false);
  });
});

describe("callGeminiWhatIf", () => {
  it("tanpa API key memakai fallback lokal dan tidak memanggil jaringan", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await callGeminiWhatIf("prompt", sim, scenario);
    expect(r.isFallback).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keluaran valid diterima dan dikirim dengan skema What-If", async () => {
    const fetchMock = vi.fn().mockResolvedValue(geminiReply(JSON.stringify(validInsight())));
    vi.stubGlobal("fetch", fetchMock);
    const r = await callGeminiWhatIf("prompt", sim, scenario);
    expect(r.isFallback).toBe(false);
    expect(r.pros).toEqual(["Beban internal turun."]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.generationConfig.responseSchema.required).toContain("actionPlan");
  });

  it("persentase di luar hasil engine ditolak dan jatuh ke fallback", async () => {
    const bad = { ...validInsight(), feasibilityComparison: "Utilisasi turun menjadi 12% saja." };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(bad))));
    const r = await callGeminiWhatIf("prompt", sim, scenario);
    expect(r.isFallback).toBe(true);
  });

  it("JSON yang melanggar skema Zod jatuh ke fallback", async () => {
    const bad = { ...validInsight(), pros: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(bad))));
    const r = await callGeminiWhatIf("prompt", sim, scenario);
    expect(r.isFallback).toBe(true);
  });

  it("status HTTP error jatuh ke fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const r = await callGeminiWhatIf("prompt", sim, scenario);
    expect(r.isFallback).toBe(true);
  });
});
