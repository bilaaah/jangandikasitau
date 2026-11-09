"use client";

// src/components/orders/OrderDetailAiPanel.tsx
//
// Interactive AI Capacity Advisor Panel for Order Detail Page (/orders/[id]).
// Calls generateAdviceForOrderAction to get real-time DSS recommendations from Google Gemini.

import React, { useState } from "react";
import { generateAdviceForOrderAction } from "@/actions/ai.actions";
import type { AiOrderAdvice, OperationalActionItem } from "@/ai/types";

interface OrderDetailAiPanelProps {
  orderId: string;
  customerName: string;
  productName: string;
}

export function OrderDetailAiPanel({
  orderId,
  customerName,
  productName,
}: OrderDetailAiPanelProps) {
  const [advice, setAdvice] = useState<AiOrderAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>("general");
  const [copiedScript, setCopiedScript] = useState(false);

  const quickQuestions = [
    { id: "general", label: "💡 Analisis Lengkap" },
    { id: "why_risk", label: "⚠️ Evaluasi Risiko" },
    { id: "bottleneck", label: "🔍 Titik Macet (Bottleneck)" },
    { id: "how_fix", label: "🛠️ Solusi Kapasitas" },
    { id: "priority", label: "💬 Draf Naskah Pelanggan" },
  ];

  async function handleAskAi(questionId?: string) {
    const q = questionId ?? activeQuestion;
    setActiveQuestion(q);
    setIsLoading(true);
    setError(null);

    try {
      const res = await generateAdviceForOrderAction({
        orderId,
        question: q,
      });

      if (res.success && res.data) {
        setAdvice(res.data);
      } else {
        setError(res.error ?? "Gagal mendapatkan rekomendasi AI.");
      }
    } catch {
      setError("Tidak dapat terhubung ke layanan AI. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyScript(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  }

  const categoryIcons: Record<string, string> = {
    WORKFORCE: "groups",
    MACHINERY: "precision_manufacturing",
    MATERIAL: "inventory_2",
    DEADLINE: "schedule",
    STRATEGY: "lightbulb",
  };

  const riskBadgeStyles: Record<string, string> = {
    LOW: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    MODERATE: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    HIGH: "bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
    CRITICAL: "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  };

  const riskLabels: Record<string, string> = {
    LOW: "Risiko Rendah (Aman)",
    MODERATE: "Risiko Sedang",
    HIGH: "Risiko Tinggi",
    CRITICAL: "Risiko Kritis",
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30 dark:from-indigo-950/20 dark:via-slate-800 dark:to-violet-950/15 p-6 shadow-xs space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 dark:border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                AI Capacity Advisor
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Google Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekomendasi taktis untuk pesanan {productName} ({customerName})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleAskAi()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>
            {isLoading ? "sync" : "auto_awesome"}
          </span>
          <span>{isLoading ? "Menganalisis..." : advice ? "Minta Saran Ulang" : "Minta Saran AI"}</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Pilih Fokus Pertanyaan:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => handleAskAi(q.id)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeQuestion === q.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleAskAi()}
            className="font-bold underline hover:text-rose-900 dark:hover:text-rose-100 shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 rounded-xl border border-indigo-100 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Menganalisis kapasitas, beban pekerja, jam mesin &amp; lead time bahan baku...
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Model Google Gemini memproses skenario terbaik untuk pesanan ini.
          </p>
        </div>
      )}

      {/* Result State */}
      {advice && !isLoading && (
        <div className="space-y-4 pt-1">
          {/* Headline & Risk */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 p-4 rounded-xl shadow-xs">
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">
                {advice.headline}
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {advice.summary}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                riskBadgeStyles[advice.riskAssessment] || "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {riskLabels[advice.riskAssessment] || advice.riskAssessment}
            </span>
          </div>

          {/* Action Items */}
          {advice.actionItems && advice.actionItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rekomendasi Tindakan Operasional:
              </p>
              <div className="grid gap-2.5">
                {advice.actionItems.map((item: OperationalActionItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {categoryIcons[item.category] || "lightbulb"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.action}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            item.priority === "HIGH"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                              : item.priority === "MEDIUM"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          Prioritas {item.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Negotiation Script */}
          {advice.customerNegotiationTip && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  <span>Draf Naskah Negosiasi Pelanggan:</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyScript(advice.customerNegotiationTip || "")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedScript ? "check" : "content_copy"}
                  </span>
                  <span>{copiedScript ? "Tersalin!" : "Salin Naskah"}</span>
                </button>
              </div>
              <p className="text-xs italic text-indigo-950 dark:text-indigo-100 leading-relaxed bg-white/70 dark:bg-slate-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                &ldquo;{advice.customerNegotiationTip}&rdquo;
              </p>
            </div>
          )}

          {/* Fallback Notice */}
          {advice.isFallback && (
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
              * Rekomendasi di atas dibuat menggunakan aturan deterministik offline karena layanan AI tidak tersedia saat ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

