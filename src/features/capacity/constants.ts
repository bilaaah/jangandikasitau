// src/features/capacity/constants.ts
//
// All capacity engine thresholds and configurable assumptions live here.
// Centralizing these values means business rules can be changed in one place
// without hunting through logic files.
//
// APPROVAL STATUS LEGEND:
//   ✅ ESTABLISHED   — This rule is a logical invariant or was explicitly approved.
//   ⚠️ APPROVED DEFAULT — Approved by the product owner with a specific value;
//                         change requires product-owner re-approval.
//   📋 ASSUMPTION    — A simplifying assumption documented for transparency.
//                      Review before adding a feature that conflicts with it.

export const CAPACITY_THRESHOLDS = {
  // -------------------------------------------------------------------------
  // Soft threshold: AT_RISK utilization
  // -------------------------------------------------------------------------
  /**
   * ⚠️ APPROVED DEFAULT (85%)
   *
   * If the total utilization of any pooled resource (workers OR machines)
   * would exceed this percentage after accepting the new order, classify as AT_RISK.
   *
   * Formula: (committedHours + requiredHours) / totalAvailableHours × 100
   *
   * Rationale: Orders running above 85% capacity have no buffer for unexpected
   * delays (worker absence, machine downtime, rework). The margin is intentionally
   * conservative for make-to-order SMEs where delays directly affect customer trust.
   *
   * To change: update this constant only. The feasibility.ts logic reads it here.
   */
  RISK_UTILIZATION_PERCENT: 85,

  // -------------------------------------------------------------------------
  // Soft threshold: AT_RISK deadline buffer
  // -------------------------------------------------------------------------
  /**
   * ⚠️ APPROVED DEFAULT (1 day)
   *
   * If the remaining working-day buffer between estimated completion and the
   * delivery deadline is at or below this many days, classify as AT_RISK.
   *
   * bufferDays = availableWorkDays - estimatedProductionDays
   * AT_RISK if: bufferDays <= RISK_BUFFER_DAYS (and bufferDays >= 0)
   * NOT_FEASIBLE if: bufferDays < 0
   *
   * Rationale: A single-day buffer accounts for handoff time, packaging, and
   * last-minute adjustments. Zero or negative buffer is already NOT_FEASIBLE.
   */
  RISK_BUFFER_DAYS: 1,
} as const;

export const WORKING_DAY_CONFIG = {
  // -------------------------------------------------------------------------
  // Working days definition
  // -------------------------------------------------------------------------
  /**
   * ✅ ESTABLISHED — Day indices considered working days.
   * 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday.
   *
   * Approved: Monday–Friday only. Weekends are excluded.
   */
  WORKING_DAY_INDICES: [1, 2, 3, 4, 5] as const,

  /**
   * 📋 ASSUMPTION — Public holidays are NOT excluded from working days.
   *
   * The system uses a simple Mon–Fri calendar without a holiday database.
   * If a business is closed on a public holiday, the calculation will
   * slightly overestimate available capacity.
   *
   * Impact: Minor. For a competition demo, this simplification is acceptable.
   * A future BusinessCalendar entity could replace this.
   */
  HOLIDAY_AWARENESS: false,
} as const;

export const ORDER_STATUS_CONFIG = {
  /**
   * ✅ ESTABLISHED — Which order statuses are treated as consuming capacity.
   *
   * Only CONFIRMED and IN_PROGRESS orders contribute to activeCommitments.
   * DRAFT orders do not reserve capacity.
   * COMPLETED and CANCELLED orders do not consume capacity.
   */
  CAPACITY_CONSUMING_STATUSES: ["CONFIRMED", "IN_PROGRESS"] as const,
} as const;

export const MATERIAL_CONFIG = {
  /**
   * 📋 ASSUMPTION — Material stock is a manually maintained snapshot.
   *
   * The system does not maintain a real-time inventory ledger.
   * Users are responsible for keeping currentStock up to date in the
   * Resource Management UI. Outdated stock data will cause inaccurate analyses.
   *
   * Future: A MaterialTransaction ledger could replace this.
   */
  STOCK_MODEL: "snapshot" as const,

  /**
   * 📋 ASSUMPTION — No unit conversion is performed.
   *
   * Material quantities are stored and compared in whatever unit the user
   * enters. The system treats "unit" as a display label only.
   * Users must enter consistent units across products and materials.
   */
  UNIT_CONVERSION: false,
} as const;
