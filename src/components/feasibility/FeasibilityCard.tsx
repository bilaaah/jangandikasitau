"use client";

// src/components/feasibility/FeasibilityCard.tsx
//
// Comprehensive Decision Support System result display card.
// Visualizes Capacity Engine calculations, resource bottlenecks, and reasoning steps.
// Includes inline "Explain with AI" panel (Modul C) — calls generateAdviceAction.

import React, { useState, useEffect } from "react";
import type { CapacityEngineResult, MaterialAnalysis } from "@/types";
import type { AiOrderAdvice } from "@/ai/types";
import { generateAdviceAction } from "@/actions/ai.actions";
import { FeasibilityBadge } from "./FeasibilityBadge";
import { cn, round } from "@/lib/utils";
/** Hasil engine + nama bahan yang disisipkan oleh checkFeasibilityPreviewAction. */
type MaterialRow = MaterialAnalysis & { materialName?: string };

interface FeasibilityCardProps {
  analysis: CapacityEngineResult;
  className?: string;
  isCompact?: boolean;
  // Context props for AI — provided when used inside order form
  productName?: string;
  quantity?: number;
  customerName?: string;
  deliveryDateStr?: string;
}

// [Finding #5 & #1] Translate English engine messages to Indonesian for display
// and replace raw materialId with human-readable material names in reasoning text.
function translateEngineText(text: string, materialMap?: Map<string, string>): string {
  let res = text;
  if (materialMap) {
    materialMap.forEach((name, id) => {
      res = res.replaceAll(id, name);
    });
  }
  return res
    // Worker bottlenecks
    .replace(
      /Worker capacity: ([\d.]+)h required; only ([\d.]+)h free \(([\d.]+)h committed of ([\d.]+)h total\)\. Shortfall: ([\d.]+)h\./,
      "Kapasitas tenaga kerja: dibutuhkan $1 jam; hanya $2 jam tersedia ($3 jam terpakai dari $4 jam total). Kekurangan: $5 jam.",
    )
    .replace(
      /Worker utilization: ([\d.]+)% if order accepted \(above ([\d.]+)% risk threshold\)\. ([\d.]+)h required; ([\d.]+)h free\./,
      "Utilisasi tenaga kerja: $1% jika pesanan diterima (di atas batas risiko $2%). Dibutuhkan $3 jam; $4 jam tersedia.",
    )
    .replace(
      /Worker capacity: ([\d.]+)h required; ([\d.]+)h free \(([\d.]+)% utilization if accepted\)\./,
      "Kapasitas tenaga kerja: dibutuhkan $1 jam; $2 jam tersedia (utilisasi $3% jika diterima).",
    )
    // Machine bottlenecks
    .replace(
      /Machine capacity: ([\d.]+)h required; only ([\d.]+)h free \(([\d.]+)h committed of ([\d.]+)h total\)\. Shortfall: ([\d.]+)h\./,
      "Kapasitas mesin: dibutuhkan $1 jam; hanya $2 jam tersedia ($3 jam terpakai dari $4 jam total). Kekurangan: $5 jam.",
    )
    .replace(
      /Machine utilization: ([\d.]+)% if order accepted \(above ([\d.]+)% risk threshold\)\. ([\d.]+)h required; ([\d.]+)h free\./,
      "Utilisasi mesin: $1% jika pesanan diterima (di atas batas risiko $2%). Dibutuhkan $3 jam; $4 jam tersedia.",
    )
    .replace(
      /Machine capacity: ([\d.]+)h required; ([\d.]+)h free \(([\d.]+)% utilization if accepted\)\./,
      "Kapasitas mesin: dibutuhkan $1 jam; $2 jam tersedia (utilisasi $3% jika diterima).",
    )
    // Material bottlenecks
    .replace(
      /Material shortage: ([\d.]+)(\w+) required; only ([\d.]+)(\w+) available \(([\d.]+)(\w+) stock − ([\d.]+)(\w+) committed\)\. Shortfall: ([\d.]+)(\w+)\./,
      "Kekurangan bahan baku: dibutuhkan $1$2; hanya $3$4 tersedia ($5$6 stok − $7$8 terpakai). Defisit: $9$10.",
    )
    // Deadline bottlenecks
    .replace(
      /Deadline impossible: (\d+) working days needed; only (\d+) available\. Shortfall: (\d+) day\(s\)\./,
      "Deadline tidak memungkinkan: dibutuhkan $1 hari kerja; hanya $2 hari tersedia. Kekurangan: $3 hari.",
    )
    .replace(
      /Deadline at risk: (\d+) days needed; (\d+) available\. Buffer: (\d+) day\(s\) — at or below (\d+)-day threshold\./,
      "Deadline berisiko: dibutuhkan $1 hari; $2 hari tersedia. Buffer: $3 hari — di batas minimum $4 hari.",
    )
    .replace(
      /Deadline: (\d+) days needed; (\d+) available\. Buffer: (\d+) day\(s\)\./,
      "Deadline: dibutuhkan $1 hari; $2 hari tersedia. Buffer: $3 hari.",
    )
    .replace(
      "Production time cannot be estimated: no workers or machines have available hours.",
      "Waktu produksi tidak dapat diestimasi: tidak ada tenaga kerja atau mesin yang tersedia.",
    )
    // Reasoning prefix labels
    .replace(/^Available working days \(Mon–Fri\): /, "Hari kerja tersedia (Sen–Jum): ")
    .replace(/\(from /, "(dari ")
    .replace(/ to /, " hingga ")
    .replace(/Material \(([^)]+)\): /, "Bahan ($1): ")
    .replace(/h required; /, " jam dibutuhkan; ")
    .replace(/h free\./, " jam tersedia.")
    .replace(/h available\./, " jam tersedia.")
    .replace(/ required; /, " dibutuhkan; ")
    .replace(/ available\./, " tersedia.");
}

// Quick-question shortcuts users can tap for instant AI explanation
const QUICK_QUESTIONS = [
  { id: "why_risk",    icon: "help",          label: "Kenapa pesanan ini berisiko?" },
  { id: "bottleneck",  icon: "speed",         label: "Apa penyebab bottleneck-nya?" },
  { id: "how_fix",     icon: "build",         label: "Bagaimana supaya pesanan ini layak?" },
  { id: "add_worker",  icon: "group_add",     label: "Apa dampaknya kalau tambah 1 pekerja?" },
  { id: "priority",    icon: "low_priority",  label: "Resource mana yang harus diprioritaskan?" },
] as const;

export function FeasibilityCard({
  analysis,
  className,
  isCompact = false,
  productName = "Produk",
  quantity = 0,
  customerName = "Pelanggan",
  deliveryDateStr = new Date().toISOString(),
}: FeasibilityCardProps) {
  const {
    status,
    availableWorkDays,
    estimatedProductionDays,
    bufferDays,
    workerAnalysis,
    machineAnalysis,
    materialAnalysis,
    bottlenecks,
    reasoning,
  } = analysis;

    const materialNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (materialAnalysis as MaterialRow[]).forEach((m) => {
      if (m.materialName) map.set(m.materialId, m.materialName);
    });
    return map;
  }, [materialAnalysis]);

  // ── AI Panel State ────────────────────────────────────────────────
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AiOrderAdvice | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

    useEffect(() => {
    if (!isAiLoading) return;
    const interval = setInterval(() => setLoadingSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isAiLoading]);

  function getLoadingStatus(seconds: number) {
    if (seconds < 4) {
      return {
        step: 1,
        title: "Membaca Data Kapasitas & Bottleneck",
        desc: "Mengambil kalkulasi utilisasi tenaga kerja, jam mesin, dan ketersediaan bahan baku...",
        isFallback: false,
      };
    }
    if (seconds < 12) {
      return {
        step: 2,
        title: "Menghubungi AI Engine (Model Utama)",
        desc: "Merumuskan rekomendasi mitigasi dan saran negosiasi pelanggan secara kontekstual...",
        isFallback: false,
      };
    }
    if (seconds < 22) {
      return {
        step: 3,
        title: "Beralih ke Gemini Fallback Model",
        desc: "Model utama memerlukan waktu lebih lama. Sistem otomatis mengalihkan ke model cadangan (~15-30 dtk)...",
        isFallback: true,
      };
    }
    return {
      step: 4,
      title: "Memvalidasi Hasil & Rekomendasi",
      desc: "Memastikan angka persentase risiko konsisten dan selaras dengan engine kapasitas...",
      isFallback: true,
    };
  }

  async function handleAskAi(questionId?: string) {
    setLoadingSeconds(0);
    setIsAiLoading(true);
    setAiError(null);
    setActiveQuestion(questionId || "general");
    if (!showAiPanel) setShowAiPanel(true);

    try {
      const result = await generateAdviceAction({
        productName,
        quantity,
        customerName,
        deliveryDateStr,
        analysis,
        question: questionId,
      });

      if (result.success && result.data) {
        setAiAdvice(result.data);
      } else {
        setAiError(result.error || "Gagal mendapatkan penjelasan AI.");
      }
    } catch {
      setAiError("Tidak dapat terhubung ke layanan AI. Coba lagi sebentar.");
    } finally {
      setIsAiLoading(false);
    }
  }

  // ── Status Config ─────────────────────────────────────────────────
  const statusConfig = {
    FEASIBLE: {
      headline: "Pesanan Mampu Diselesaikan (Kapasitas Aman)",
      description:
        "Seluruh kebutuhan tenaga kerja, jam oven/mesin, stok bahan baku, dan batas waktu pengiriman terpenuhi dengan leluasa.",
      bannerClass: "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200",
      accentColor: "emerald",
    },
    AT_RISK: {
      headline: "Pesanan Berisiko Keterlambatan (Butuh Tindakan)",
      description:
        "Beban kapasitas mendekati batas maksimal (>85% utilisasi atau buffer pengiriman ≤1 hari kerja). Pertimbangkan lembur atau pekerja harian.",
      bannerClass: "border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-200",
      accentColor: "amber",
    },
    NOT_FEASIBLE: {
      headline: "Pesanan Tidak Layak Diterima (Defisit Kapasitas)",
      description:
        "Terdapat kendala kritis (kekurangan bahan baku, jam kerja tidak mencukupi, atau deadline mustahil dicapai tanpa penyesuaian).",
      bannerClass: "border-rose-500/30 bg-rose-500/5 text-rose-950 dark:text-rose-200",
      accentColor: "rose",
    },
  }[status];

  const riskBadgeStyle: Record<string, string> = {
    LOW:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    MODERATE: "bg-amber-50   text-amber-700   border-amber-200",
    HIGH:     "bg-orange-50  text-orange-700  border-orange-200",
    CRITICAL: "bg-rose-50    text-rose-700    border-rose-200",
  };

  const categoryIcons: Record<string, string> = {
    WORKFORCE: "groups",
    MACHINERY: "precision_manufacturing",
    MATERIAL:  "inventory_2",
    DEADLINE:  "schedule",
    STRATEGY:  "lightbulb",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200",
        statusConfig.bannerClass,
        className,
      )}
    >
      {/* ── Header Banner ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 border-b border-border/40 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <FeasibilityBadge status={status} className="text-xs sm:text-sm px-3 py-1 shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {statusConfig.headline}
            </h3>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {statusConfig.description}
          </p>
        </div>

        {/* Timeline Summary Pill (Responsive 3-Column Strip - Never Overflows) */}
        <div className="grid grid-cols-3 divide-x divide-border/60 bg-background/80 dark:bg-slate-900/60 backdrop-blur-sm border rounded-xl py-2 px-1 text-xs text-muted-foreground shadow-xs">
          <div className="text-center px-1 sm:px-2">
            <span className="block font-semibold text-foreground text-sm font-mono whitespace-nowrap">
              {availableWorkDays} Hari
            </span>
            <span className="text-[10px] sm:text-[11px] block text-muted-foreground">Tersedia</span>
          </div>
          <div className="text-center px-1 sm:px-2">
            <span className="block font-semibold text-foreground text-sm font-mono whitespace-nowrap">
              {estimatedProductionDays >= 0 ? `${estimatedProductionDays} Hari` : "N/A"}
            </span>
            <span className="text-[10px] sm:text-[11px] block text-muted-foreground truncate">Estimasi Produksi</span>
          </div>
          <div className="text-center px-1 sm:px-2">
            <span
              className={cn(
                "block font-semibold text-sm font-mono whitespace-nowrap",
                bufferDays < 0
                  ? "text-rose-600 font-bold"
                  : bufferDays <= 1
                  ? "text-amber-600 font-bold"
                  : "text-emerald-600",
              )}
            >
              {bufferDays >= 0 ? `+${bufferDays} Hari` : `${bufferDays} Hari`}
            </span>
            <span className="text-[10px] sm:text-[11px] block text-muted-foreground">Buffer Aman</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Resource Utilization Cards ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Worker Utilization */}
          <div className="p-4 rounded-xl border bg-background/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Kapasitas Tenaga Kerja
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-bold px-2 py-0.5 rounded",
                  workerAnalysis.utilizationPercent > 100
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400"
                    : workerAnalysis.utilizationPercent > 85
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400",
                )}
              >
                {workerAnalysis.utilizationPercent}% Terpakai
              </span>
            </div>
            <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  workerAnalysis.utilizationPercent > 100
                    ? "bg-rose-500"
                    : workerAnalysis.utilizationPercent > 85
                    ? "bg-amber-500"
                    : "bg-emerald-500",
                )}
                style={{ width: `${Math.min(100, Math.max(0, workerAnalysis.utilizationPercent))}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.requiredHours)} jam</span>
                <span>Dibutuhkan</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.committedHours)} jam</span>
                <span>Terjadwal</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.freeHours)} jam</span>
                <span>Tersedia</span>
              </div>
            </div>
          </div>

          {/* Machine Utilization */}
          <div className="p-4 rounded-xl border bg-background/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Kapasitas Mesin &amp; Oven
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-bold px-2 py-0.5 rounded",
                  machineAnalysis.utilizationPercent > 100
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400"
                    : machineAnalysis.utilizationPercent > 85
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400",
                )}
              >
                {machineAnalysis.utilizationPercent}% Terpakai
              </span>
            </div>
            <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  machineAnalysis.utilizationPercent > 100
                    ? "bg-rose-500"
                    : machineAnalysis.utilizationPercent > 85
                    ? "bg-amber-500"
                    : "bg-emerald-500",
                )}
                style={{ width: `${Math.min(100, Math.max(0, machineAnalysis.utilizationPercent))}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.requiredHours)} jam</span>
                <span>Dibutuhkan</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.committedHours)} jam</span>
                <span>Terjadwal</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.freeHours)} jam</span>
                <span>Tersedia</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Materials Table ───────────────────────────────────── */}
        {materialAnalysis.length > 0 && (
          <div className="rounded-xl border bg-background/60 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ketersediaan Bahan Baku (BOM)
              </span>
              <span className="text-xs text-muted-foreground">
                {materialAnalysis.filter((m) => m.gap < 0).length > 0 ? (
                  <span className="text-rose-600 font-semibold">Defisit Bahan Baku</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Semua Bahan Aman</span>
                )}
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {materialAnalysis.map((mat) => {
                const isShort = mat.gap < 0;
                // Prefer materialName if available, fallback to materialId
                const displayName = (mat as MaterialRow).materialName || mat.materialId;
                return (
                  <div
                    key={mat.materialId}
                    className="px-4 py-3 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          isShort ? "bg-rose-500" : "bg-emerald-500",
                        )}
                        title={isShort ? "Defisit" : "Aman"}
                      />
                      <span className="text-xs font-medium text-foreground truncate">
                        {displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs flex-shrink-0">
                      <div>
                        <span className="text-muted-foreground">Butuh: </span>
                        <span className="font-medium font-mono text-foreground">
                          {round(mat.requiredQuantity)} {mat.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tersedia: </span>
                        <span
                          className={cn(
                            "font-medium font-mono",
                            isShort ? "text-rose-600 font-bold" : "text-foreground",
                          )}
                        >
                          {round(mat.effectiveAvailable)} {mat.unit}
                        </span>
                      </div>
                      <div>
                        {isShort ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Defisit: {round(Math.abs(mat.gap))} {mat.unit}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            +{round(mat.gap)} {mat.unit} aman
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottlenecks Section ───────────────────────────────── */}
        {bottlenecks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bottleneck Operasional Terdeteksi
            </h4>
            <div className="space-y-2">
              {bottlenecks.map((b, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border text-xs flex items-start gap-3",
                    b.severity === "CRITICAL"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
                  )}
                >
                  <span className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[10px] bg-background/80 shrink-0">
                    {b.severity}
                  </span>
                  <div className="flex-1 font-medium">{translateEngineText(b.description, materialNameMap)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reasoning Steps ───────────────────────────────────── */}
        {!isCompact && reasoning.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rincian Logika Analisis Engine
            </h4>
            <div className="bg-muted/30 border rounded-xl p-3 font-mono text-xs space-y-1.5 overflow-x-auto">
              {reasoning.map((step, idx) => (
                <div key={idx} className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground/40 mr-2">[{idx + 1}]</span>
                  <span>{translateEngineText(step, materialNameMap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            MODUL C — EXPLAIN WITH AI PANEL
            ════════════════════════════════════════════════════════ */}
        <div className="border-t border-border/40 pt-4 space-y-3">
          {/* Trigger Button */}
          {!showAiPanel && (
            <button
              type="button"
              onClick={() => handleAskAi("general")}
              disabled={isAiLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
                         bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                         text-white text-sm font-bold shadow-md shadow-indigo-500/20
                         transition-all duration-200 active:scale-[0.99] group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:animate-pulse">
                auto_awesome
              </span>
              <span>Jelaskan ke Saya — Explain with AI</span>
              <span className="text-[10px] font-normal bg-white/20 px-2 py-0.5 rounded-full">
                Gratis
              </span>
            </button>
          )}

          {/* AI Panel — expanded */}
          {showAiPanel && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 overflow-hidden shadow-sm">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-100 bg-white/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm text-sm">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Explain with AI</p>
                    <p className="text-[11px] text-slate-500">Penjelasan berbasis data kapasitas nyata</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAiLoading && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100/90 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                      <span>Menganalisis ({loadingSeconds}d)</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAiPanel(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Tutup panel AI"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Quick Questions */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pertanyaan Cepat
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleAskAi(q.id)}
                        disabled={isAiLoading}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                          activeQuestion === q.id && !isAiLoading
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50",
                          isAiLoading && "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <span className="material-symbols-outlined text-[14px]">{q.icon}</span>
                        <span>{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Loading State */}
                {isAiLoading && (() => {
                  const status = getLoadingStatus(loadingSeconds);
                  return (
                    <div className="space-y-4">
                      {/* Interactive Progress Box */}
                      <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-violet-50/70 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                              <span className="material-symbols-outlined text-[20px] animate-spin">
                                sync
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900">{status.title}</p>
                                {status.isFallback && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    Fallback Model
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{status.desc}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-xs font-mono font-bold text-indigo-700 shrink-0 shadow-2xs">
                            {loadingSeconds}s
                          </span>
                        </div>

                        {/* Progress Stepper Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>Tahap {status.step} dari 4</span>
                            <span>{status.step * 25}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-indigo-200/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${status.step * 25}%` }}
                            />
                          </div>
                        </div>

                        {/* Fallback Notice for long waits */}
                        {loadingSeconds >= 10 && (
                          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">
                              info
                            </span>
                            <span className="leading-relaxed">
                              Proses ini dapat memakan waktu hingga <strong>~30 detik</strong> jika model utama sibuk dan sistem berpindah ke model cadangan. Mohon tunggu sebentar...
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Skeleton Shimmer Preview */}
                      <div className="space-y-3.5 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs">
                        <div className="flex items-center justify-between gap-4">
                          <div className="h-4 bg-slate-200 rounded-md w-2/3 animate-pulse" />
                          <div className="h-5 bg-slate-200 rounded-full w-20 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                          <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                          <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Error State */}
                {aiError && !isAiLoading && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-500 text-[20px] flex-shrink-0">error</span>
                    <div>
                      <p className="text-sm font-semibold text-rose-800">Gagal mendapatkan penjelasan</p>
                      <p className="text-xs text-rose-600 mt-0.5">{aiError}</p>
                      <button
                        type="button"
                        onClick={() => handleAskAi(activeQuestion || "general")}
                        className="mt-2 text-xs font-bold text-rose-700 hover:underline"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Advice Result */}
                {aiAdvice && !isAiLoading && (
                  <div className="space-y-4">
                    {/* Risk + Headline */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-slate-800 flex-1">{aiAdvice.headline}</h4>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex-shrink-0",
                          riskBadgeStyle[aiAdvice.riskAssessment] || "bg-slate-50 text-slate-600 border-slate-200",
                        )}
                      >
                        Risiko: {aiAdvice.riskAssessment}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 leading-relaxed bg-white/80 rounded-xl p-4 border border-slate-100">
                      {aiAdvice.summary}
                    </p>

                    {/* Action Items */}
                    {aiAdvice.actionItems && aiAdvice.actionItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Rekomendasi Tindakan
                        </p>
                        <div className="space-y-2">
                          {aiAdvice.actionItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-indigo-600 text-[20px] flex-shrink-0 mt-0.5">
                                {categoryIcons[item.category] || "task_alt"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800">{item.action}</span>
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold uppercase flex-shrink-0",
                                      item.priority === "HIGH"   ? "text-rose-600"
                                      : item.priority === "MEDIUM" ? "text-amber-600"
                                      : "text-slate-400",
                                    )}
                                  >
                                    {item.priority === "HIGH" ? "🔴" : item.priority === "MEDIUM" ? "🟡" : "🟢"}{" "}
                                    {item.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Negotiation Tip */}
                    {aiAdvice.customerNegotiationTip && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 mb-1.5">
                          <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                          Tips Komunikasi ke Pelanggan
                        </div>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          {aiAdvice.customerNegotiationTip}
                        </p>
                      </div>
                    )}

                    {/* Fallback notice */}
                    {aiAdvice.isFallback && (
                      <p className="text-[11px] text-slate-400 text-center">
                        * Penjelasan ini dihasilkan dari aturan offline karena AI tidak tersedia saat ini.
                      </p>
                    )}
                  </div>
                )}

                {/* Initial state: not yet loaded */}
                {!isAiLoading && !aiAdvice && !aiError && (
                  <div className="text-center py-4 text-sm text-slate-400">
                    Pilih salah satu pertanyaan di atas untuk memulai.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* ═══ end AI Panel ═══ */}
      </div>
    </div>
  );
}
