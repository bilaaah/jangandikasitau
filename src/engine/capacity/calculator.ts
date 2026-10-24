// src/engine/capacity/calculator.ts
//
// THE CAPACITY ENGINE — Pure deterministic calculation functions.
//
// RULES:
//   1. Pure functions only. Zero database calls, zero HTTP requests, zero side-effects.
//   2. Inputs strictly typed via CapacityEngineInput.
//   3. Completely deterministic — same input always yields identical output.
//   4. Can be unit-tested directly without mock DB or Next.js runtime.

import { CAPACITY_THRESHOLDS, WORKING_DAY_CONFIG } from "./constants";
import type {
  CapacityEngineInput,
  CapacityEngineResult,
  FeasibilityStatus,
  MaterialAnalysis,
  ResourceAnalysis,
  Bottleneck,
} from "@/engine/types";

/**
 * Runs a complete capacity feasibility analysis for a new order.
 */
export function runCapacityEngine(input: CapacityEngineInput): CapacityEngineResult {
  const reasoning: string[] = [];
  const bottlenecks: Bottleneck[] = [];

  // Step 1: Calculate available working days (Mon–Fri only)
  const availableWorkDays = countWorkingDays(
    input.newOrder.analysisDate,
    input.newOrder.requiredDeliveryDate,
  );
  reasoning.push(
    `Available working days (Mon–Fri): ${availableWorkDays} ` +
      `(from ${formatDate(input.newOrder.analysisDate)} to ${formatDate(input.newOrder.requiredDeliveryDate)})`,
  );

  // Step 2: Aggregate daily capacity
  const totalDailyWorkerHours = input.workforce.workers.reduce(
    (sum, w) => sum + w.dailyAvailableHours,
    0,
  );
  const totalDailyMachineHours = input.machinery.machines.reduce(
    (sum, m) => sum + m.dailyAvailableHours,
    0,
  );

  // Step 3: Total available hours over the production window
  const totalWorkerHours = totalDailyWorkerHours * availableWorkDays;
  const totalMachineHours = totalDailyMachineHours * availableWorkDays;

  // Step 4: Hours required for the new order
  const requiredWorkerHours = input.newOrder.quantity * input.product.workerHoursPerUnit;
  const requiredMachineHours = input.newOrder.quantity * input.product.machineHoursPerUnit;

  // Step 5: Worker analysis
  const workerAnalysis = buildResourceAnalysis({
    totalAvailableHours: totalWorkerHours,
    committedHours: input.activeCommitments.workerHoursCommitted,
    requiredHours: requiredWorkerHours,
    label: "Worker",
    reasoning,
    bottlenecks,
  });

  // Step 6: Machine analysis
  const machineAnalysis = buildResourceAnalysis({
    totalAvailableHours: totalMachineHours,
    committedHours: input.activeCommitments.machineHoursCommitted,
    requiredHours: requiredMachineHours,
    label: "Machine",
    reasoning,
    bottlenecks,
  });

  // Step 7: Material analysis
  const materialAnalysis = buildMaterialAnalysis(input, reasoning, bottlenecks);

  // Step 8: Delivery deadline analysis
  const bindingRequiredHours = Math.max(requiredWorkerHours, requiredMachineHours);
  const bindingDailyHours =
    requiredWorkerHours >= requiredMachineHours
      ? totalDailyWorkerHours
      : totalDailyMachineHours;

  const estimatedProductionDays =
    bindingDailyHours > 0 ? Math.ceil(bindingRequiredHours / bindingDailyHours) : Infinity;

  const bufferDays =
    estimatedProductionDays === Infinity ? -Infinity : availableWorkDays - estimatedProductionDays;

  addDeadlineReasoning({
    estimatedProductionDays,
    availableWorkDays,
    bufferDays,
    reasoning,
    bottlenecks,
  });

  // Step 9: Classify feasibility
  const status = classifyFeasibility({ workerAnalysis, machineAnalysis, materialAnalysis, bufferDays });

  return {
    status,
    availableWorkDays,
    estimatedProductionDays: estimatedProductionDays === Infinity ? -1 : estimatedProductionDays,
    bufferDays: bufferDays === -Infinity ? -1 : bufferDays,
    workerAnalysis,
    machineAnalysis,
    materialAnalysis,
    bottlenecks: bottlenecks.sort((a, b) =>
      a.severity === "CRITICAL" && b.severity !== "CRITICAL" ? -1 : 1,
    ),
    reasoning,
  };
}

/**
 * Counts the number of working days (Mon–Fri) between two dates.
 */
export function countWorkingDays(from: Date, to: Date): number {
  const start = startOfDay(from);
  const end = startOfDay(to);

  if (end <= start) return 0;

  let count = 0;
  const current = new Date(start);

  while (current < end) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if ((WORKING_DAY_CONFIG.WORKING_DAY_INDICES as readonly number[]).includes(dayOfWeek)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function buildResourceAnalysis(params: {
  totalAvailableHours: number;
  committedHours: number;
  requiredHours: number;
  label: string;
  reasoning: string[];
  bottlenecks: Bottleneck[];
}): ResourceAnalysis {
  const { totalAvailableHours, committedHours, requiredHours, label, reasoning, bottlenecks } =
    params;

  const freeHours = totalAvailableHours - committedHours;
  const gap = freeHours - requiredHours;
  const utilizationPercent =
    totalAvailableHours > 0
      ? Math.round(((committedHours + requiredHours) / totalAvailableHours) * 100 * 10) / 10
      : 100;

  const resourceType = label === "Worker" ? "WORKER" : "MACHINE";

  if (gap < 0) {
    const message = `${label} capacity: ${requiredHours}h required; only ${freeHours}h free (${committedHours}h committed of ${totalAvailableHours}h total). Shortfall: ${Math.abs(gap)}h.`;
    reasoning.push(`⛔ ${message}`);
    bottlenecks.push({
      resourceType,
      description: message,
      severity: "CRITICAL",
    });
  } else if (utilizationPercent > CAPACITY_THRESHOLDS.RISK_UTILIZATION_PERCENT) {
    const message = `${label} utilization: ${utilizationPercent}% if order accepted (above ${CAPACITY_THRESHOLDS.RISK_UTILIZATION_PERCENT}% risk threshold). ${requiredHours}h required; ${freeHours}h free.`;
    reasoning.push(`⚠️ ${message}`);
    bottlenecks.push({
      resourceType,
      description: message,
      severity: "WARNING",
    });
  } else {
    reasoning.push(
      `✅ ${label} capacity: ${requiredHours}h required; ${freeHours}h free (${utilizationPercent}% utilization if accepted).`,
    );
  }

  return { totalAvailableHours, committedHours, requiredHours, freeHours, gap, utilizationPercent };
}

function buildMaterialAnalysis(
  input: CapacityEngineInput,
  reasoning: string[],
  bottlenecks: Bottleneck[],
): MaterialAnalysis[] {
  return input.product.materials.map((productMaterial) => {
    const stockItem = input.inventory.materials.find((m) => m.id === productMaterial.materialId);
    const commitment = (input.activeCommitments?.materialCommitments || []).find(
      (c) => c.materialId === productMaterial.materialId,
    );

    const currentStock = stockItem?.currentStock ?? 0;
    const unit = stockItem?.unit ?? "units";
    const committedQuantity = commitment?.quantityCommitted ?? 0;
    const requiredQuantity = input.newOrder.quantity * productMaterial.quantityPerUnit;
    const effectiveAvailable = currentStock - committedQuantity;
    const gap = effectiveAvailable - requiredQuantity;

    if (gap < 0) {
      const message = `Material shortage: ${requiredQuantity}${unit} required; only ${effectiveAvailable}${unit} available (${currentStock}${unit} stock − ${committedQuantity}${unit} committed). Shortfall: ${Math.abs(gap)}${unit}.`;
      reasoning.push(`⛔ ${message}`);
      bottlenecks.push({
        resourceType: "MATERIAL",
        resourceId: productMaterial.materialId,
        description: message,
        severity: "CRITICAL",
      });
    } else {
      reasoning.push(
        `✅ Material (${productMaterial.materialId}): ${requiredQuantity}${unit} required; ${effectiveAvailable}${unit} available.`,
      );
    }

    return {
      materialId: productMaterial.materialId,
      unit,
      requiredQuantity,
      currentStock,
      committedQuantity,
      effectiveAvailable,
      gap,
    };
  });
}

function addDeadlineReasoning(params: {
  estimatedProductionDays: number;
  availableWorkDays: number;
  bufferDays: number;
  reasoning: string[];
  bottlenecks: Bottleneck[];
}): void {
  const { estimatedProductionDays, availableWorkDays, bufferDays, reasoning, bottlenecks } = params;

  if (estimatedProductionDays === Infinity || bufferDays === -Infinity) {
    const message =
      "Production time cannot be estimated: no workers or machines have available hours.";
    reasoning.push(`⛔ ${message}`);
    bottlenecks.push({ resourceType: "TIME", description: message, severity: "CRITICAL" });
    return;
  }

  if (bufferDays < 0) {
    const message = `Deadline impossible: ${estimatedProductionDays} working days needed; only ${availableWorkDays} available. Shortfall: ${Math.abs(bufferDays)} day(s).`;
    reasoning.push(`⛔ ${message}`);
    bottlenecks.push({ resourceType: "TIME", description: message, severity: "CRITICAL" });
  } else if (bufferDays <= CAPACITY_THRESHOLDS.RISK_BUFFER_DAYS) {
    const message = `Deadline at risk: ${estimatedProductionDays} days needed; ${availableWorkDays} available. Buffer: ${bufferDays} day(s) — at or below ${CAPACITY_THRESHOLDS.RISK_BUFFER_DAYS}-day threshold.`;
    reasoning.push(`⚠️ ${message}`);
    bottlenecks.push({ resourceType: "TIME", description: message, severity: "WARNING" });
  } else {
    reasoning.push(
      `✅ Deadline: ${estimatedProductionDays} days needed; ${availableWorkDays} available. Buffer: ${bufferDays} day(s).`,
    );
  }
}

function classifyFeasibility(params: {
  workerAnalysis: ResourceAnalysis;
  machineAnalysis: ResourceAnalysis;
  materialAnalysis: MaterialAnalysis[];
  bufferDays: number;
}): FeasibilityStatus {
  const { workerAnalysis, machineAnalysis, materialAnalysis, bufferDays } = params;

  // Hard constraints — NOT FEASIBLE
  const hasWorkerShortfall = workerAnalysis.gap < 0;
  const hasMachineShortfall = machineAnalysis.gap < 0;
  const hasMaterialShortfall = materialAnalysis.some((m) => m.gap < 0);
  const hasDeadlineViolation = bufferDays < 0;

  if (hasWorkerShortfall || hasMachineShortfall || hasMaterialShortfall || hasDeadlineViolation) {
    return "NOT_FEASIBLE";
  }

  // Soft constraints — AT_RISK
  const workerAtRisk = workerAnalysis.utilizationPercent > CAPACITY_THRESHOLDS.RISK_UTILIZATION_PERCENT;
  const machineAtRisk = machineAnalysis.utilizationPercent > CAPACITY_THRESHOLDS.RISK_UTILIZATION_PERCENT;
  const deadlineAtRisk = bufferDays <= CAPACITY_THRESHOLDS.RISK_BUFFER_DAYS;

  if (workerAtRisk || machineAtRisk || deadlineAtRisk) {
    return "AT_RISK";
  }

  return "FEASIBLE";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
