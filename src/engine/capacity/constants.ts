// src/engine/capacity/constants.ts
//
// All capacity engine thresholds and configurable assumptions live here.
// Centralizing these values means business rules can be changed in one place
// without hunting through logic files.

export const CAPACITY_THRESHOLDS = {
  /**
   * Soft threshold: AT_RISK utilization (85%)
   * If the total utilization of any pooled resource (workers OR machines)
   * would exceed this percentage after accepting the new order, classify as AT_RISK.
   */
  RISK_UTILIZATION_PERCENT: 85,

  /**
   * Soft threshold: AT_RISK deadline buffer (1 day)
   * If the remaining working-day buffer between estimated completion and the
   * delivery deadline is at or below this many days, classify as AT_RISK.
   */
  RISK_BUFFER_DAYS: 1,
} as const;

export const WORKING_DAY_CONFIG = {
  /**
   * Working day indices (Monday to Friday: 1 to 5).
   * 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday.
   */
  WORKING_DAY_INDICES: [1, 2, 3, 4, 5] as const,

  /**
   * Simplification: Public holidays are NOT excluded from working days in demo.
   */
  HOLIDAY_AWARENESS: false,
} as const;

export const ORDER_STATUS_CONFIG = {
  /**
   * Only CONFIRMED and IN_PROGRESS orders consume capacity.
   */
  CAPACITY_CONSUMING_STATUSES: ["CONFIRMED", "IN_PROGRESS"] as const,
} as const;

export const MATERIAL_CONFIG = {
  STOCK_MODEL: "snapshot" as const,
  UNIT_CONVERSION: false,
} as const;
