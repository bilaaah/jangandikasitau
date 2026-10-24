"use client";

// src/components/ai/AiRecommendationCard.tsx
//
// UI Component for displaying AI-driven Decision Support System (DSS) recommendations.
// Crafted for Anggota 1 (Frontend & UX Lead) with modern aesthetics and responsive layout.

import React from "react";
import type { AiOrderAdvice, OperationalActionItem } from "@/ai/types";

interface AiRecommendationCardProps {
  advice?: AiOrderAdvice | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AiRecommendationCard({ advice, isLoading, onRefresh }: AiRecommendationCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-700">Menganalisis kapasitas dengan AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!advice) return null;

  const riskBadgeStyles: Record<string, string> = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MODERATE: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const categoryIcons: Record<string, string> = {
    WORKFORCE: "👥",
    MACHINERY: "⚙️",
    MATERIAL: "📦",
    DEADLINE: "⏱️",
    STRATEGY: "💡",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/30 p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm shadow-indigo-200">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900">AI Operational Advisory</h3>
              {advice.isFallback && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Offline Rule Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Rekomendasi taktis berbasis analisis kapasitas riil</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              riskBadgeStyles[advice.riskAssessment] || "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            Risk: {advice.riskAssessment}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-600 hover:bg-slate-50 active:scale-95"
              title="Perbarui Rekomendasi"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {/* Main Headline & Summary */}
      <div className="mt-4">
        <h4 className="text-base font-semibold text-slate-800">{advice.headline}</h4>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{advice.summary}</p>
      </div>

      {/* Action Items */}
      {advice.actionItems && advice.actionItems.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rekomendasi Tindakan Operasional
          </p>
          <div className="grid gap-2 sm:grid-cols-1">
            {advice.actionItems.map((item: OperationalActionItem, idx: number) => (
              <div
                key={idx}
                className="flex items-start space-x-3 rounded-xl border border-slate-200/70 bg-white/90 p-3.5 shadow-sm transition-all hover:border-indigo-200 hover:bg-white"
              >
                <span className="text-lg">{categoryIcons[item.category] || "📌"}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{item.action}</span>
                    <span
                      className={`text-[10px] font-medium uppercase ${
                        item.priority === "HIGH"
                          ? "text-rose-600"
                          : item.priority === "MEDIUM"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                    >
                      Prioritas {item.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{item.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negotiation Tip */}
      {advice.customerNegotiationTip && (
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
            <span>💬</span>
            <span>Tips Komunikasi ke Pelanggan</span>
          </div>
          <p className="mt-1 text-xs text-indigo-800 leading-relaxed">
            {advice.customerNegotiationTip}
          </p>
        </div>
      )}
    </div>
  );
}
