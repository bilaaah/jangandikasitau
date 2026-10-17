// src/components/feasibility/FeasibilityBadge.tsx
//
// Status chip component displaying the feasibility outcome of an order.
// Supports "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" with tailored color palettes and icons.

import React from "react";
import { FeasibilityStatus } from "@/features/capacity/types";
import { cn } from "@/lib/utils";

interface FeasibilityBadgeProps {
  status: FeasibilityStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function FeasibilityBadge({
  status,
  className,
  showIcon = true,
}: FeasibilityBadgeProps) {
  switch (status) {
    case "FEASIBLE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
            "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800",
            className,
          )}
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span>FEASIBLE</span>
        </span>
      );

    case "AT_RISK":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
            "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800",
            className,
          )}
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          <span>AT RISK</span>
        </span>
      );

    case "NOT_FEASIBLE":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
            "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800",
            className,
          )}
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <span>NOT FEASIBLE</span>
        </span>
      );
  }
}
