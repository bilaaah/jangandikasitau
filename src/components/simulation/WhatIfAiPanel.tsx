"use client";

// src/components/simulation/WhatIfAiPanel.tsx
//
// Panel "Jelaskan dengan AI" untuk Simulasi What-If.
// Simulasi dijalankan ulang di server oleh generateWhatIfInsightAction; panel hanya
// mengirim referensi pesanan dan tuas skenario. Beri `key` yang berubah saat slider
// berubah agar penjelasan lama tidak tampil untuk skenario yang berbeda.

import { useState } from "react";
import { generateWhatIfInsightAction } from "@/actions/ai.actions";
import type { WhatIfAiInsight } from "@/ai/types";

interface WhatIfAiPanelProps {
  orderRef: {
    orderId: string;
    productId: string;
    quantity: number;
    deliveryDateStr: string;
  };
  adjustments: {
    additionalWorkerDailyHours: number;
    deadlineShiftDays: number;
    outsourcePercent: number;
    splitDelivery?: { firstWavePercent: number; secondWaveDelayWorkingDays: number };
  };
  productName: string;
  customerName: string;
}

export function WhatIfAiPanel({ orderRef, adjustments, productName, customerName }: WhatIfAiPanelProps) {
  const [insight, setInsight] = useState<WhatIfAiInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateWhatIfInsightAction({ orderRef, adjustments, productName, customerName });
      if (res.success && res.data) {
        setInsight(res.data);
      } else {
        setError(res.error ?? "Gagal mendapatkan penjelasan AI.");
      }
    } catch {
      setError("Tidak dapat terhubung ke layanan AI. Coba lagi sebentar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">Jelaskan Skenario Ini</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
            AI merangkum dampak skenario dari angka engine, tanpa menghitung ulang.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExplain}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>
            {isLoading ? "sync" : "auto_awesome"}
          </span>
          <span>{isLoading ? "Menganalisis..." : insight ? "Jelaskan Ulang" : "Jelaskan dengan AI"}</span>
        </button>
      </div>

      {error && !isLoading && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/90 dark:bg-rose-500/[0.12] text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {insight && !isLoading && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-[#CBD5E1] bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] rounded-xl p-4">
            {insight.feasibilityComparison}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/[0.08] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                Keuntungan
              </p>
              <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-100 list-disc pl-4">
                {insight.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/[0.08] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
                Risiko &amp; Konsekuensi
              </p>
              <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-100 list-disc pl-4">
                {insight.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-500/[0.08] p-4 space-y-2">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Kompromi yang disarankan</p>
            <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200/90">
              {insight.recommendedTradeoff}
            </p>
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 pt-1">Langkah selanjutnya</p>
            <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200/90">{insight.actionPlan}</p>
          </div>

          {insight.isFallback && (
            <p className="text-[11px] text-center text-slate-400 dark:text-[#64748B]">
              * Penjelasan ini dihasilkan dari aturan offline karena AI tidak tersedia saat ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
