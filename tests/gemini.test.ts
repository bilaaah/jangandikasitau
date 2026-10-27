import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { callGeminiAdvisory, hasUnknownPercentages } from "@/ai/gemini";
import type { CapacityEngineResult } from "@/engine/types";

function makeAnalysis(): CapacityEngineResult {
  return {
    status: "AT_RISK",
    availableWorkDays: 5,
    estimatedProductionDays: 4,
    bufferDays: 1,
    workerAnalysis: {
      totalAvailableHours: 100, committedHours: 30, requiredHours: 56,
      freeHours: 70, gap: 14, utilizationPercent: 86,
    },
    machineAnalysis: {
      totalAvailableHours: 80, committedHours: 0, requiredHours: 40,
      freeHours: 80, gap: 40, utilizationPercent: 50,
    },
    materialAnalysis: [],
    bottlenecks: [{ resourceType: "WORKER", description: "Jam kerja ketat", severity: "WARNING" }],
    reasoning: ["Worker capacity: 56h required; 70h free (86% utilization if accepted)"],
  };
}

const validAdvice = {
  headline: "Kapasitas ketat",
  summary: "Utilisasi tenaga kerja 86% sehingga buffer tipis.",
  actionItems: [
    { category: "WORKFORCE", priority: "MEDIUM", action: "Siapkan lembur 1 jam per hari.", impact: "Menambah buffer." },
  ],
  customerNegotiationTip: "Konfirmasi DP segera.",
};

function geminiReply(text: string) {
  return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
}
function geminiError(status: number) {
  return { ok: false, status, json: async () => ({}) };
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

describe("callGeminiAdvisory", () => {
  it("tanpa API key memakai fallback lokal dan tidak memanggil jaringan", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = vi.fn().mockResolvedValue(geminiReply(JSON.stringify(validAdvice)));
    vi.stubGlobal("fetch", fetchMock);
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("respons valid dipakai, dan tingkat risiko berasal dari status engine", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(validAdvice))));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(false);
    expect(result.headline).toBe("Kapasitas ketat");
    expect(result.riskAssessment).toBe("HIGH");
  });

  it("klaim risiko dari AI diabaikan; engine yang menentukan", async () => {
    const aiTooDramatic = { ...validAdvice, riskAssessment: "CRITICAL" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(aiTooDramatic))));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.riskAssessment).toBe("HIGH");
  });

  it("model utama gagal (429) lalu model cadangan dipakai", async () => {
    vi.stubEnv("GEMINI_FALLBACK_MODEL", "model-cadangan");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(geminiError(429))
      .mockResolvedValueOnce(geminiReply(JSON.stringify(validAdvice)));
    vi.stubGlobal("fetch", fetchMock);
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("model-cadangan");
  });

  it("semua model gagal jatuh ke fallback lokal", async () => {
    vi.stubEnv("GEMINI_FALLBACK_MODEL", "model-cadangan");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiError(429)));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(true);
  });

  it("JSON rusak jatuh ke fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply("bukan json {")));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(true);
  });

  it("kategori di luar daftar (melanggar skema Zod) jatuh ke fallback", async () => {
    const bad = {
      ...validAdvice,
      actionItems: [{ ...validAdvice.actionItems[0], category: "Tenaga Kerja" }],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(bad))));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(true);
  });

  it("persentase di luar hasil engine ditolak dan jatuh ke fallback", async () => {
    const bad = { ...validAdvice, summary: "Utilisasi tenaga kerja hanya 40%." };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiReply(JSON.stringify(bad))));
    const result = await callGeminiAdvisory("prompt", makeAnalysis());
    expect(result.isFallback).toBe(true);
  });
});

describe("hasUnknownPercentages", () => {
  it("menerima persentase yang cocok dengan engine", () => {
    expect(hasUnknownPercentages("Utilisasi 86% dan mesin 50%", makeAnalysis())).toBe(false);
  });
  it("menolak persentase yang tidak ada di engine", () => {
    expect(hasUnknownPercentages("Utilisasi 40%", makeAnalysis())).toBe(true);
  });
});