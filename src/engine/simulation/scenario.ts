// src/engine/simulation/scenario.ts
//
// What-If Simulation Engine.
// Evaluates hypothetical capacity adjustments (e.g., adding temporary workers,
// overtime, or negotiating deadline extensions) completely in-memory.

import { runCapacityEngine } from "../capacity/calculator";
import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";
import type { WhatIfAdjustments, WhatIfSimulationResult } from "./types";

/**
 * Runs a comparative What-If simulation against a baseline order.
 */
export function simulateScenario(
  baseInput: CapacityEngineInput,
  adjustments: WhatIfAdjustments,
): WhatIfSimulationResult {
  // 1. Run baseline calculation
  const baselineResult = runCapacityEngine(baseInput);

  // 2. Clone and adjust input
  const simulatedInput: CapacityEngineInput = {
    ...baseInput,
    newOrder: {
      ...baseInput.newOrder,
      requiredDeliveryDate: adjustments.deadlineShiftDays
        ? addDays(baseInput.newOrder.requiredDeliveryDate, adjustments.deadlineShiftDays)
        : new Date(baseInput.newOrder.requiredDeliveryDate),
    },
    workforce: {
      workers: adjustments.additionalWorkerDailyHours
        ? [
            ...baseInput.workforce.workers,
            {
              id: "simulated-freelancer",
              dailyAvailableHours: adjustments.additionalWorkerDailyHours,
            },
          ]
        : baseInput.workforce.workers,
    },
    machinery: {
      machines: adjustments.additionalMachineDailyHours
        ? [
            ...baseInput.machinery.machines,
            {
              id: "simulated-overtime-machine",
              dailyAvailableHours: adjustments.additionalMachineDailyHours,
            },
          ]
        : baseInput.machinery.machines,
    },
    inventory: {
      materials: baseInput.inventory.materials.map((mat) => {
        const added = adjustments.additionalMaterialStock?.[mat.id] ?? 0;
        return added > 0 ? { ...mat, currentStock: mat.currentStock + added } : mat;
      }),
    },
  };

  // 3. Run simulated calculation
  const simulatedResult = runCapacityEngine(simulatedInput);

  // 4. Calculate comparative trade-offs
  const statusRanks = { FEASIBLE: 3, AT_RISK: 2, NOT_FEASIBLE: 1 };
  const baselineRank = statusRanks[baselineResult.status] ?? 0;
  const simulatedRank = statusRanks[simulatedResult.status] ?? 0;
  const statusImproved = simulatedRank > baselineRank;

  const deltaWorkerUtilization =
    Math.round((simulatedResult.workerAnalysis.utilizationPercent - baselineResult.workerAnalysis.utilizationPercent) * 10) / 10;
  const deltaMachineUtilization =
    Math.round((simulatedResult.machineAnalysis.utilizationPercent - baselineResult.machineAnalysis.utilizationPercent) * 10) / 10;
  const deltaBufferDays = simulatedResult.bufferDays - baselineResult.bufferDays;

  const baselineBottleneckDescriptions = new Set(baselineResult.bottlenecks.map((b) => b.description));
  const remainingBottlenecks = simulatedResult.bottlenecks.filter((b) =>
    baselineBottleneckDescriptions.has(b.description),
  );
  const resolvedBottlenecksCount = Math.max(0, baselineResult.bottlenecks.length - remainingBottlenecks.length);

  return {
    baselineResult,
    simulatedResult,
    statusImproved,
    deltaWorkerUtilization,
    deltaMachineUtilization,
    deltaBufferDays,
    resolvedBottlenecksCount,
    unresolvedBottlenecksCount: simulatedResult.bottlenecks.length,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
