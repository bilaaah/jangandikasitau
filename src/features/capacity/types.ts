// src/features/capacity/types.ts
//
// This file is the shared TypeScript contract for the Capacity Engine.
// ALL THREE TEAM MEMBERS depend on these types:
//   - Member B: implements engine.ts that produces CapacityEngineResult
//   - Member A: builds UI components that consume CapacityEngineResult
//   - Member C: builds simulation and AI modules that read CapacityEngineResult
//
// IMPORTANT: Any change to this file requires a PR reviewed by all three members.
// Changing these types will cause TypeScript build errors across the entire project,
// which is intentional — it surfaces all affected call sites immediately.

// ---------------------------------------------------------------------------
// Core status type
// ---------------------------------------------------------------------------

/**
 * The three possible feasibility outcomes.
 *
 * FEASIBLE     — All hard constraints satisfied, no soft thresholds exceeded.
 * AT_RISK      — Hard constraints satisfied, but at least one soft threshold exceeded.
 *                See CAPACITY_THRESHOLDS in constants.ts for the configurable values.
 * NOT_FEASIBLE — At least one hard constraint violated (material shortage,
 *                capacity exceeded, or delivery date impossible).
 */
export type FeasibilityStatus = "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE";

// ---------------------------------------------------------------------------
// Engine Input
// ---------------------------------------------------------------------------

/**
 * Everything the Capacity Engine needs to run a feasibility analysis.
 * This object is assembled by the Server Action in features/orders/actions.ts
 * by querying the database and combining resources with the new order details.
 *
 * The engine itself (engine.ts) performs NO database calls.
 * All I/O happens before this input is constructed.
 */
export interface CapacityEngineInput {
  /** The new order being evaluated. */
  newOrder: {
    quantity: number;
    productId: string;
    /** The date the analysis is run. Used as the start of the production window. */
    analysisDate: Date;
    /** The customer-requested delivery deadline. */
    requiredDeliveryDate: Date;
  };

  /** Product specifications for the item being ordered. */
  product: {
    /** Worker-hours required to produce one unit of this product. */
    workerHoursPerUnit: number;
    /** Machine-hours required to produce one unit. 0 if no machine needed. */
    machineHoursPerUnit: number;
    /** Materials consumed per unit of output. */
    materials: {
      materialId: string;
      /** Quantity of this material needed per unit produced. In the material's own unit. */
      quantityPerUnit: number;
    }[];
  };

  /** Current workforce available to this business. */
  workforce: {
    workers: {
      id: string;
      /** Total hours this worker is available per working day. */
      dailyAvailableHours: number;
    }[];
  };

  /** Current machinery available to this business. */
  machinery: {
    machines: {
      id: string;
      /** Total hours this machine is available per working day. */
      dailyAvailableHours: number;
    }[];
  };

  /** Current material stock levels. */
  inventory: {
    materials: {
      id: string;
      /** Current on-hand stock quantity, in the material's own unit. Manual snapshot. */
      currentStock: number;
      /** Display label only (e.g. "kg", "liter", "pcs"). No unit conversion is performed. */
      unit: string;
    }[];
  };

  /**
   * Capacity already consumed by active orders (CONFIRMED + IN_PROGRESS).
   * Assembled by the Server Action before calling the engine.
   *
   * Calculation model: All active orders are assumed to compete for capacity
   * during the same production window as the new order. This is a conservative
   * aggregate model — it may slightly underestimate available capacity for orders
   * with non-overlapping deadlines.
   */
  activeCommitments: {
    /** Total worker-hours already committed to all active orders. */
    workerHoursCommitted: number;
    /** Total machine-hours already committed to all active orders. */
    machineHoursCommitted: number;
    /** Material quantities already committed to all active orders. */
    materialCommitments: {
      materialId: string;
      quantityCommitted: number;
    }[];
  };
}

// ---------------------------------------------------------------------------
// Engine Output sub-types
// ---------------------------------------------------------------------------

/**
 * Analysis of a single pooled resource (workers or machines).
 */
export interface ResourceAnalysis {
  /** Total hours available across all workers/machines × available working days. */
  totalAvailableHours: number;
  /** Hours already committed to active orders. */
  committedHours: number;
  /** Hours required for the new order alone. */
  requiredHours: number;
  /** totalAvailableHours - committedHours (before adding the new order). */
  freeHours: number;
  /** freeHours - requiredHours. Negative means hard constraint violated. */
  gap: number;
  /**
   * (committedHours + requiredHours) / totalAvailableHours × 100.
   * Represents total utilization if the new order is accepted.
   * Values above 100 indicate infeasibility.
   */
  utilizationPercent: number;
}

/**
 * Analysis of a single material's availability.
 */
export interface MaterialAnalysis {
  materialId: string;
  unit: string;
  /** requiredQuantity = newOrder.quantity × product.quantityPerUnit for this material. */
  requiredQuantity: number;
  currentStock: number;
  /** Stock already reserved by active orders for this material. */
  committedQuantity: number;
  /** currentStock - committedQuantity */
  effectiveAvailable: number;
  /** effectiveAvailable - requiredQuantity. Negative means hard constraint violated. */
  gap: number;
}

/**
 * A specific constraint that is preventing or threatening feasibility.
 */
export interface Bottleneck {
  resourceType: "WORKER" | "MACHINE" | "MATERIAL" | "TIME";
  /** ID of the specific resource, if applicable (e.g. materialId). */
  resourceId?: string;
  /** Human-readable description suitable for display in the UI. */
  description: string;
  /**
   * CRITICAL — a hard constraint is violated; the order is NOT FEASIBLE.
   * WARNING  — a soft threshold is exceeded; the order is AT RISK.
   */
  severity: "CRITICAL" | "WARNING";
}

// ---------------------------------------------------------------------------
// Engine Output
// ---------------------------------------------------------------------------

/**
 * The complete result of a capacity engine run.
 * This type is stored in the CapacityAnalysis database table and
 * displayed in the feasibility result UI.
 */
export interface CapacityEngineResult {
  /** The overall feasibility classification. */
  status: FeasibilityStatus;

  /**
   * Number of working days (Mon–Fri) between analysisDate and requiredDeliveryDate.
   * Does not account for public holidays (simplifying assumption; see constants.ts).
   */
  availableWorkDays: number;

  /**
   * Estimated working days required to produce the new order quantity.
   * = CEILING(max(requiredWorkerHours / totalDailyWorkerHours,
   *              requiredMachineHours / totalDailyMachineHours))
   * Uses the binding (larger) constraint.
   */
  estimatedProductionDays: number;

  /** availableWorkDays - estimatedProductionDays. Negative means hard constraint violated. */
  bufferDays: number;

  workerAnalysis: ResourceAnalysis;
  machineAnalysis: ResourceAnalysis;
  materialAnalysis: MaterialAnalysis[];

  /**
   * List of identified constraints. Will be empty for a clean FEASIBLE result.
   * Ordered by severity (CRITICAL first).
   */
  bottlenecks: Bottleneck[];

  /**
   * Ordered list of human-readable reasoning steps.
   * Each step explains one aspect of the calculation.
   * This array is the primary input for the AI explanation module (Milestone 3).
   * The AI receives this array and formats it — it does not recalculate anything.
   *
   * Example entry: "Worker capacity: 48h required; 52h free (92% utilization if accepted)"
   */
  reasoning: string[];
}
