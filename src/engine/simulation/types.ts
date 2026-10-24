// src/engine/simulation/types.ts
//
// Types for DSS What-If capacity simulation.
// Owned jointly by Engine (Member 2) & AI / Simulation (Member 3).

import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";

export interface WhatIfAdjustments {
  /** Additional freelance / temporary worker hours per day */
  additionalWorkerDailyHours?: number;
  /** Shift deadline by N working days forward (positive) or backward (negative) */
  deadlineShiftDays?: number;
  /** Injected additional stock for materials (e.g. urgent material restock) */
  additionalMaterialStock?: Record<string, number>;
  /** Add overtime machine hours per day */
  additionalMachineDailyHours?: number;
}

export interface WhatIfSimulationInput {
  baseInput: CapacityEngineInput;
  adjustments: WhatIfAdjustments;
}

export interface WhatIfSimulationResult {
  baselineResult: CapacityEngineResult;
  simulatedResult: CapacityEngineResult;
  statusImproved: boolean;
  deltaWorkerUtilization: number;
  deltaMachineUtilization: number;
  deltaBufferDays: number;
  resolvedBottlenecksCount: number;
  unresolvedBottlenecksCount: number;
}
