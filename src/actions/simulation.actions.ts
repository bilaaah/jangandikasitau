"use server";

// src/actions/simulation.actions.ts
//
// Server Action for running in-memory What-If scenario simulations.
// Enables frontend users to adjust parameters (workers, overtime, deadline shift, materials)
// without altering the database.

import { simulateScenario } from "@/engine/simulation/scenario";
import type { WhatIfAdjustments, WhatIfSimulationResult } from "@/engine/simulation/types";
import type { CapacityEngineInput } from "@/engine/types";
import type { ActionResult } from "./feasibility.actions";

export async function runWhatIfSimulationAction(
  baseInput: CapacityEngineInput,
  adjustments: WhatIfAdjustments,
): Promise<ActionResult<WhatIfSimulationResult>> {
  try {
    const result = simulateScenario(baseInput, adjustments);
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to execute What-If simulation.",
    };
  }
}
