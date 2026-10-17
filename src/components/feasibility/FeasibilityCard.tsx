// src/components/feasibility/FeasibilityCard.tsx
//
// Comprehensive Decision Support System result display card.
// Visualizes Capacity Engine calculations, resource bottlenecks, and reasoning steps.

import React from "react";
import type { CapacityEngineResult } from "@/features/capacity/types";
import { FeasibilityBadge } from "./FeasibilityBadge";
import { cn, round } from "@/lib/utils";

interface FeasibilityCardProps {
  analysis: CapacityEngineResult;
  className?: string;
  isCompact?: boolean;
}

export function FeasibilityCard({
  analysis,
  className,
  isCompact = false,
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

  const statusConfig = {
    FEASIBLE: {
      headline: "Order is Feasible",
      description:
        "All labor, machine, material, and deadline constraints are comfortably satisfied.",
      bannerClass: "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200",
      accentColor: "emerald",
    },
    AT_RISK: {
      headline: "Order is At Risk",
      description:
        "Capacity or deadline thresholds are operating near maximum limits (>85% utilization or ≤1 day buffer). Review contingencies before accepting.",
      bannerClass: "border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-200",
      accentColor: "amber",
    },
    NOT_FEASIBLE: {
      headline: "Order is Not Feasible",
      description:
        "One or more hard constraints are violated (material deficit, insufficient work hours, or unachievable delivery date).",
      bannerClass: "border-rose-500/30 bg-rose-500/5 text-rose-950 dark:text-rose-200",
      accentColor: "rose",
    },
  }[status];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200",
        statusConfig.bannerClass,
        className,
      )}
    >
      {/* Header Banner */}
      <div className="p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FeasibilityBadge status={status} className="text-sm px-3.5 py-1" />
            <h3 className="text-xl font-bold tracking-tight">{statusConfig.headline}</h3>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{statusConfig.description}</p>
        </div>

        {/* Timeline Summary Pill */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm border rounded-xl px-4 py-2.5 text-xs text-muted-foreground shrink-0">
          <div className="text-center">
            <span className="block font-medium text-foreground text-sm font-mono">
              {availableWorkDays}d
            </span>
            <span>Available</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-center">
            <span className="block font-medium text-foreground text-sm font-mono">
              {estimatedProductionDays >= 0 ? `${estimatedProductionDays}d` : "N/A"}
            </span>
            <span>Est. Prod</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-center">
            <span
              className={cn(
                "block font-medium text-sm font-mono",
                bufferDays < 0
                  ? "text-rose-600 font-bold"
                  : bufferDays <= 1
                  ? "text-amber-600 font-bold"
                  : "text-emerald-600",
              )}
            >
              {bufferDays >= 0 ? `+${bufferDays}d` : `${bufferDays}d`}
            </span>
            <span>Buffer</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Resource Utilization Cards */}
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
                Worker Capacity
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
                {workerAnalysis.utilizationPercent}% Utilized
              </span>
            </div>

            {/* Progress Bar */}
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
                style={{ width: `${Math.min(workerAnalysis.utilizationPercent, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.requiredHours)}h</span>
                <span>Required</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.committedHours)}h</span>
                <span>Committed</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(workerAnalysis.freeHours)}h</span>
                <span>Available</span>
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
                Machine Capacity
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
                {machineAnalysis.utilizationPercent}% Utilized
              </span>
            </div>

            {/* Progress Bar */}
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
                style={{ width: `${Math.min(machineAnalysis.utilizationPercent, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.requiredHours)}h</span>
                <span>Required</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.committedHours)}h</span>
                <span>Committed</span>
              </div>
              <div>
                <span className="block text-foreground font-mono">{round(machineAnalysis.freeHours)}h</span>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Materials Table */}
        {materialAnalysis.length > 0 && (
          <div className="rounded-xl border bg-background/60 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Material Requirements
              </span>
              <span className="text-xs text-muted-foreground">
                {materialAnalysis.filter((m) => m.gap < 0).length > 0 ? (
                  <span className="text-rose-600 font-semibold">Shortage Detected</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">All Materials Stocked</span>
                )}
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {materialAnalysis.map((mat) => {
                const isShort = mat.gap < 0;
                return (
                  <div
                    key={mat.materialId}
                    className="px-4 py-3 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isShort ? "bg-rose-500" : "bg-emerald-500",
                        )}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {mat.materialId}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-muted-foreground">Req: </span>
                        <span className="font-medium font-mono text-foreground">
                          {round(mat.requiredQuantity)} {mat.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available: </span>
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
                            Deficit: {round(Math.abs(mat.gap))} {mat.unit}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            +{round(mat.gap)} {mat.unit} surplus
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

        {/* Bottlenecks Section */}
        {bottlenecks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Identified Operational Bottlenecks
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
                  <div className="flex-1 font-medium">{b.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning Steps Accordion/Log */}
        {!isCompact && reasoning.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Capacity Engine Reasoning Steps
            </h4>
            <div className="bg-muted/30 border rounded-xl p-3 font-mono text-xs space-y-1.5 overflow-x-auto">
              {reasoning.map((step, idx) => (
                <div key={idx} className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground/40 mr-2">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
