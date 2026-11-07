// src/engine/simulation/types.ts
//
// Types for DSS What-If capacity simulation.
// Owned jointly by Engine (Member 2) & AI / Simulation (Member 3).

import type { CapacityEngineInput, CapacityEngineResult } from "@/engine/types";

export interface SplitDeliveryAdjustment {
  /** Persentase jumlah yang dikirim di termin 1 pada tenggat (10–90). */
  firstWavePercent: number;
  /** Termin 2 jatuh N hari KALENDER setelah tenggat termin 1 (hasil konversi hari kerja dilakukan di action). */
  secondWaveDelayDays: number;
}

export interface WhatIfAdjustments {
  /** Additional freelance / temporary worker hours per day */
  additionalWorkerDailyHours?: number;
  /** Shift deadline by N calendar days forward (positive) or backward (negative) */
  deadlineShiftDays?: number;
  /** Injected additional stock for materials (e.g. urgent material restock) */
  additionalMaterialStock?: Record<string, number>;
  /** Add overtime machine hours per day */
  additionalMachineDailyHours?: number;
  /**
   * Persentase jumlah pesanan yang dialihkan ke mitra maklon (0–100).
   * Asumsi: bahan baku unit yang di-maklon ditanggung mitra, jadi beban pekerja,
   * mesin, dan bahan internal berkurang proporsional.
   */
  outsourcePercent?: number;
  /** Kirim bertahap: termin 1 di tenggat, termin 2 menyusul. */
  splitDelivery?: SplitDeliveryAdjustment;
}

export interface WhatIfSimulationInput {
  baseInput: CapacityEngineInput;
  adjustments: WhatIfAdjustments;
}

/** Rincian per termin saat kirim bertahap aktif. */
export interface SplitDeliveryDetail {
  wave1Units: number;
  wave2Units: number;
  /** Termin 1: hanya wave1Units, sampai tenggat. */
  wave1Result: CapacityEngineResult;
  /** Termin 2: kumulatif seluruh unit internal, sampai tenggat + jeda. */
  wave2Result: CapacityEngineResult;
}

export interface WhatIfSimulationResult {
  baselineResult: CapacityEngineResult;
  /** Jika kirim bertahap aktif, ini adalah termin yang PALING ketat. */
  simulatedResult: CapacityEngineResult;
  statusImproved: boolean;
  deltaWorkerUtilization: number;
  deltaMachineUtilization: number;
  deltaBufferDays: number;
  resolvedBottlenecksCount: number;
  unresolvedBottlenecksCount: number;
  /** Unit yang dialihkan ke mitra maklon (0 jika outsource tidak aktif). */
  outsourcedUnits: number;
  /** Unit yang dikerjakan internal setelah outsource. */
  internalUnits: number;
  splitDelivery?: SplitDeliveryDetail;
}
