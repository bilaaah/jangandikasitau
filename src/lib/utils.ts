// src/lib/utils.ts
//
// General-purpose utility functions shared across the project.
// Do NOT put domain-specific logic here — it belongs in src/engine, src/actions, or src/ai.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts correctly.
 * Required by shadcn/ui components.
 *
 * Usage: className={cn("base-class", conditionalClass && "other-class")}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object as a short locale string (e.g., "Jan 5, 2026").
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Rounds a number to a specified number of decimal places.
 */
export function round(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
