import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { findLeadTimeConflicts } from "@/ai/leadTime";
import { buildAdvisoryPrompt } from "@/ai/prompts/advisory.prompt";
import { callGeminiAdvisory, generateLocalFallbackAdvice } from "@/ai/gemini";
import type { CapacityEngineResult, MaterialAnalysis } from "@/engine/types";

const shortFlour: MaterialAnalysis = {
  materialId: "flour", unit: "kg", requiredQuantity: 40, currentStock: 30,
  committedQuantity: 0, effectiveAvailable: 30, gap: -10,
};

function makeAnalysis(status: CapacityEngineResult["status"] = "NOT_FEASIBLE"): CapacityEngineResult {
  return {
    status,
    availableWorkDays: 5,
    estimatedProductionDays: 4,
    bufferDays: 1,
    workerAnalysis: { totalAvailableHours: 100, committedHours: 30, requiredHours: 56, freeHours: 70, gap: 14, utilizationPercent: 86 },
    machineAnalysis: { totalAvailableHours: 80, committedHours: 0, requiredHours: 40, freeHours: 80, gap: 40, utilizationPercent: 50 },
    materialAnalysis: [shortFlour],
    bottlenecks: [{ resourceType: "MATERIAL", resourceId: "flour", description: "Material shortage", severity: "CRITICAL" }],
    reasoning: ["Material shortage"],
  };
}

describe("findLeadTimeConflicts (AI-03)", () => {
  const leadTimes = { flour: { name: "Tepung", leadTimeDays: 3 } };

  it("memberi peringatan jika lead time melebihi batas mulai produksi", () => {
    const w = findLeadTimeConflicts({ materialAnalysis: [shortFlour], leadTimes, availableWorkDays: 5, estimatedProductionDays: 4 });
    expect(w).toHaveLength(1);
    expect(w[0]).toContain("Tepung");
    expect(w[0]).toContain("3 hari kerja");
    expect(w[0]).toContain("1 hari kerja lagi");
  });

  it("tidak memberi peringatan jika lead time masih sempat", () => {
    const w = findLeadTimeConflicts({ materialAnalysis: [shortFlour], leadTimes, availableWorkDays: 10, estimatedProductionDays: 4 });
    expect(w).toEqual([]);
  });

  it("tidak memberi peringatan jika stok cukup atau lead time tidak diketahui", () => {
    expect(findLeadTimeConflicts({ materialAnalysis: [{ ...shortFlour, gap: 5 }], leadTimes, availableWorkDays: 5, estimatedProductionDays: 4 })).toEqual([]);
    expect(findLeadTimeConflicts({ materialAnalysis: [shortFlour], leadTimes: {}, availableWorkDays: 5, estimatedProductionDays: 4 })).toEqual([]);
  });

  it("estimasi produksi tak terhitung (-1) dianggap harus mulai sekarang", () => {
    const w = findLeadTimeConflicts({ materialAnalysis: [shortFlour], leadTimes, availableWorkDays: 5, estimatedProductionDays: -1 });
    expect(w[0]).toContain("0 hari kerja lagi");
  });

  it("peringatan masuk prompt dan fallback lokal", () => {
    const warnings = ["Bahan Tepung kurang 10kg, tetapi lead time supplier (3 hari kerja) melebihi batas mulai produksi (1 hari kerja lagi)."];
    const prompt = buildAdvisoryPrompt({
      productName: "Hampers", quantity: 10, customerName: "A", deliveryDateStr: "2026-11-10",
      analysis: makeAnalysis(), leadTimeWarnings: warnings,
    });
    expect(prompt).toContain("KENDALA LEAD TIME SUPPLIER");
    expect(prompt).toContain("Tepung");

    const withoutWarnings = buildAdvisoryPrompt({
      productName: "Hampers", quantity: 10, customerName: "A", deliveryDateStr: "2026-11-10", analysis: makeAnalysis(),
    });
    expect(withoutWarnings).not.toContain("KENDALA LEAD TIME SUPPLIER");

    const advice = generateLocalFallbackAdvice(makeAnalysis(), warnings);
    const material = advice.actionItems.find((a) => a.category === "MATERIAL");
    expect(material?.action).toContain("tidak akan tiba tepat waktu");
    expect(material?.impact).toBe(warnings[0]);
  });
});

describe("anggaran waktu AI (AI-04)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "model-utama");
    vi.stubEnv("GEMINI_FALLBACK_MODEL", "model-cadangan");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("jika semua model menggantung, jatuh ke fallback lokal dalam ≤ ~16 detik", async () => {
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const promise = callGeminiAdvisory("prompt", makeAnalysis("AT_RISK"));
    await vi.advanceTimersByTimeAsync(16_000);
    const result = await promise;

    expect(result.isFallback).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
