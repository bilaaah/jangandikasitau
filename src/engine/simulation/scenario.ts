// src/engine/simulation/scenario.ts
//
// What-If Simulation Engine.
// Evaluates hypothetical capacity adjustments (extra workers, overtime, deadline
// negotiation, outsource, split delivery) completely in-memory. Tidak ada I/O.

import { runCapacityEngine } from "../capacity/calculator";
import { WORKING_DAY_CONFIG } from "../capacity/constants";
import type {
  Bottleneck,
  CapacityEngineInput,
  CapacityEngineResult,
} from "@/engine/types";
import type { WhatIfAdjustments, WhatIfSimulationResult } from "./types";

const STATUS_RANK = { FEASIBLE: 3, AT_RISK: 2, NOT_FEASIBLE: 1 } as const;

/**
 * Runs a comparative What-If simulation against a baseline order.
 */
export function simulateScenario(
  baseInput: CapacityEngineInput,
  adjustments: WhatIfAdjustments,
): WhatIfSimulationResult {
  // 1. Baseline
  const baselineResult = runCapacityEngine(baseInput);

  // 2. Outsource: kurangi unit yang dikerjakan internal
  const totalUnits = baseInput.newOrder.quantity;
  const outsourcePercent = clamp(adjustments.outsourcePercent ?? 0, 0, 100);
  const outsourcedUnits = Math.round((totalUnits * outsourcePercent) / 100);
  const internalUnits = totalUnits - outsourcedUnits;

  // 3. Clone & adjust input
  const shiftedDeadline = adjustments.deadlineShiftDays
    ? addDays(baseInput.newOrder.requiredDeliveryDate, adjustments.deadlineShiftDays)
    : new Date(baseInput.newOrder.requiredDeliveryDate);

  const simulatedInput: CapacityEngineInput = {
    ...baseInput,
    newOrder: {
      ...baseInput.newOrder,
      quantity: internalUnits,
      requiredDeliveryDate: shiftedDeadline,
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

  // 4. Simulated run (dengan atau tanpa kirim bertahap)
  let simulatedResult: CapacityEngineResult;
  let splitDelivery: WhatIfSimulationResult["splitDelivery"];

  if (adjustments.splitDelivery && internalUnits > 0) {
    const share = clamp(adjustments.splitDelivery.firstWavePercent, 1, 99) / 100;
    const delay = Math.max(0, adjustments.splitDelivery.secondWaveDelayDays);
    const wave1Units = Math.min(internalUnits, Math.max(1, Math.round(internalUnits * share)));
    const wave2Units = internalUnits - wave1Units;

    // Termin 1: hanya sebagian unit, harus selesai di tenggat.
    const wave1Result = runCapacityEngine({
      ...simulatedInput,
      newOrder: { ...simulatedInput.newOrder, quantity: wave1Units },
    });
    // Termin 2: kumulatif seluruh unit, selesai di tenggat + jeda.
    const wave2Result = runCapacityEngine({
      ...simulatedInput,
      newOrder: {
        ...simulatedInput.newOrder,
        quantity: internalUnits,
        requiredDeliveryDate: addDays(shiftedDeadline, delay),
      },
    });

    simulatedResult = tighterOf(wave1Result, wave2Result);
    splitDelivery = { wave1Units, wave2Units, wave1Result, wave2Result };
  } else {
    simulatedResult = runCapacityEngine(simulatedInput);
  }

  // 5. Comparative trade-offs
  const statusImproved =
    STATUS_RANK[simulatedResult.status] > STATUS_RANK[baselineResult.status];

  const deltaWorkerUtilization =
    Math.round(
      (simulatedResult.workerAnalysis.utilizationPercent -
        baselineResult.workerAnalysis.utilizationPercent) * 10,
    ) / 10;
  const deltaMachineUtilization =
    Math.round(
      (simulatedResult.machineAnalysis.utilizationPercent -
        baselineResult.machineAnalysis.utilizationPercent) * 10,
    ) / 10;
  const deltaBufferDays = simulatedResult.bufferDays - baselineResult.bufferDays;

  // Cocokkan bottleneck lewat jenis + id sumber daya (bukan teks deskripsi,
  // karena angka di deskripsi ikut berubah saat skenario diterapkan).
  const simulatedKeys = new Set(simulatedResult.bottlenecks.map(bottleneckKey));
  const resolvedBottlenecksCount = baselineResult.bottlenecks.filter(
    (b) => !simulatedKeys.has(bottleneckKey(b)),
  ).length;

  return {
    baselineResult,
    simulatedResult,
    statusImproved,
    deltaWorkerUtilization,
    deltaMachineUtilization,
    deltaBufferDays,
    resolvedBottlenecksCount,
    unresolvedBottlenecksCount: simulatedResult.bottlenecks.length,
    outsourcedUnits,
    internalUnits,
    splitDelivery,
  };
}

/**
 * Menghitung berapa hari kalender yang setara dengan N hari kerja (Senin–Jumat)
 * setelah tanggal `from`.
 */
export function workingDaysToCalendarDays(from: Date, workingDays: number): number {
  let added = 0;
  let calendar = 0;
  const cursor = new Date(from);
  while (added < workingDays) {
    cursor.setDate(cursor.getDate() + 1);
    calendar += 1;
    if ((WORKING_DAY_CONFIG.WORKING_DAY_INDICES as readonly number[]).includes(cursor.getDay())) {
      added += 1;
    }
  }
  return calendar;
}

/**
 * Untuk pesanan CONFIRMED/IN_PROGRESS: komitmen aktif sudah memuat pesanan itu sendiri,
 * sehingga harus dikurangi agar tidak terhitung dua kali saat disimulasikan.
 */
export function subtractOwnCommitment(
  commitments: CapacityEngineInput["activeCommitments"],
  own: { quantity: number; product: CapacityEngineInput["product"] },
): CapacityEngineInput["activeCommitments"] {
  const ownMaterial = new Map(
    own.product.materials.map((m) => [m.materialId, own.quantity * m.quantityPerUnit]),
  );
  return {
    workerHoursCommitted: Math.max(
      0,
      commitments.workerHoursCommitted - own.quantity * own.product.workerHoursPerUnit,
    ),
    machineHoursCommitted: Math.max(
      0,
      commitments.machineHoursCommitted - own.quantity * own.product.machineHoursPerUnit,
    ),
    materialCommitments: commitments.materialCommitments.map((c) => ({
      materialId: c.materialId,
      quantityCommitted: Math.max(0, c.quantityCommitted - (ownMaterial.get(c.materialId) ?? 0)),
    })),
  };
}

function bottleneckKey(b: Bottleneck): string {
  return `${b.resourceType}:${b.resourceId ?? ""}`;
}

/** Hasil yang lebih ketat: status lebih buruk, atau utilisasi pengikat lebih tinggi bila sama. */
function tighterOf(a: CapacityEngineResult, b: CapacityEngineResult): CapacityEngineResult {
  if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) {
    return STATUS_RANK[a.status] < STATUS_RANK[b.status] ? a : b;
  }
  return bindingUtilization(a) >= bindingUtilization(b) ? a : b;
}

function bindingUtilization(r: CapacityEngineResult): number {
  return Math.max(r.workerAnalysis.utilizationPercent, r.machineAnalysis.utilizationPercent);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
