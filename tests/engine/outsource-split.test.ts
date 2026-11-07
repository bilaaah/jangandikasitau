import { describe, it, expect } from "vitest";
import {
  simulateScenario,
  subtractOwnCommitment,
  workingDaysToCalendarDays,
} from "@/engine/simulation/scenario";
import type { CapacityEngineInput } from "@/engine/types";

// Senin 2 Nov 2026 → Selasa 10 Nov 2026 = 6 hari kerja; 3 pekerja × 8 jam = 144 jam tersedia.
// 20 unit × 8 jam = 160 jam → baseline NOT_FEASIBLE.
function makeInput(): CapacityEngineInput {
  return {
    newOrder: {
      quantity: 20,
      productId: "p1",
      analysisDate: new Date("2026-11-02T00:00:00"),
      requiredDeliveryDate: new Date("2026-11-10T00:00:00"),
    },
    product: {
      workerHoursPerUnit: 8,
      machineHoursPerUnit: 2,
      materials: [{ materialId: "flour", quantityPerUnit: 2 }],
    },
    workforce: {
      workers: [
        { id: "w1", dailyAvailableHours: 8 },
        { id: "w2", dailyAvailableHours: 8 },
        { id: "w3", dailyAvailableHours: 8 },
      ],
    },
    machinery: {
      machines: [
        { id: "m1", dailyAvailableHours: 8 },
        { id: "m2", dailyAvailableHours: 8 },
      ],
    },
    inventory: { materials: [{ id: "flour", currentStock: 1000, unit: "kg" }] },
    activeCommitments: { workerHoursCommitted: 0, machineHoursCommitted: 0, materialCommitments: [] },
  };
}

describe("outsource", () => {
  it("baseline tidak layak, outsource 40% membuat layak", () => {
    const r = simulateScenario(makeInput(), { outsourcePercent: 40 });
    expect(r.baselineResult.status).toBe("NOT_FEASIBLE");
    expect(r.outsourcedUnits).toBe(8);
    expect(r.internalUnits).toBe(12);
    expect(r.simulatedResult.workerAnalysis.requiredHours).toBe(96);
    expect(r.simulatedResult.status).toBe("FEASIBLE");
    expect(r.statusImproved).toBe(true);
  });

  it("outsource kecil (20%) hanya membawa ke AT_RISK", () => {
    const r = simulateScenario(makeInput(), { outsourcePercent: 20 });
    expect(r.outsourcedUnits).toBe(4);
    expect(r.simulatedResult.status).toBe("AT_RISK");
  });

  it("outsource 100% tidak menyisakan beban internal", () => {
    const r = simulateScenario(makeInput(), { outsourcePercent: 100 });
    expect(r.internalUnits).toBe(0);
    expect(r.simulatedResult.workerAnalysis.requiredHours).toBe(0);
  });

  it("persentase di luar rentang dijepit 0–100", () => {
    expect(simulateScenario(makeInput(), { outsourcePercent: -5 }).outsourcedUnits).toBe(0);
    expect(simulateScenario(makeInput(), { outsourcePercent: 500 }).outsourcedUnits).toBe(20);
  });
});

describe("split delivery", () => {
  it("termin 2 menyusul 7 hari kalender membuat kedua termin layak", () => {
    const r = simulateScenario(makeInput(), {
      splitDelivery: { firstWavePercent: 50, secondWaveDelayDays: 7 },
    });
    expect(r.splitDelivery?.wave1Units).toBe(10);
    expect(r.splitDelivery?.wave2Units).toBe(10);
    expect(r.splitDelivery?.wave1Result.status).toBe("FEASIBLE");
    expect(r.splitDelivery?.wave2Result.status).toBe("FEASIBLE");
    expect(r.simulatedResult.status).toBe("FEASIBLE");
    expect(r.statusImproved).toBe(true);
  });

  it("tanpa jeda untuk termin 2, split tidak menolong (termin 2 tetap tidak layak)", () => {
    const r = simulateScenario(makeInput(), {
      splitDelivery: { firstWavePercent: 50, secondWaveDelayDays: 0 },
    });
    expect(r.splitDelivery?.wave2Result.status).toBe("NOT_FEASIBLE");
    expect(r.simulatedResult.status).toBe("NOT_FEASIBLE");
    expect(r.statusImproved).toBe(false);
  });

  it("dapat digabung dengan outsource", () => {
    const r = simulateScenario(makeInput(), {
      outsourcePercent: 20,
      splitDelivery: { firstWavePercent: 50, secondWaveDelayDays: 7 },
    });
    expect(r.internalUnits).toBe(16);
    expect(r.splitDelivery?.wave1Units).toBe(8);
    expect(r.splitDelivery?.wave2Units).toBe(8);
  });
});

describe("hitungan bottleneck", () => {
  it("bottleneck yang masih ada (angka berubah) tidak dihitung terselesaikan", () => {
    const r = simulateScenario(makeInput(), { additionalWorkerDailyHours: 1 });
    expect(r.simulatedResult.bottlenecks.length).toBeGreaterThan(0);
    expect(r.resolvedBottlenecksCount).toBe(0);
  });

  it("bottleneck hilang dihitung terselesaikan", () => {
    const r = simulateScenario(makeInput(), { additionalWorkerDailyHours: 16 });
    expect(r.simulatedResult.bottlenecks).toHaveLength(0);
    expect(r.resolvedBottlenecksCount).toBe(r.baselineResult.bottlenecks.length);
  });
});

describe("helper", () => {
  it("workingDaysToCalendarDays melewati akhir pekan", () => {
    const friday = new Date("2026-11-06T00:00:00");
    expect(workingDaysToCalendarDays(friday, 1)).toBe(3); // Jumat → Senin
    expect(workingDaysToCalendarDays(friday, 5)).toBe(7); // Jumat → Jumat berikutnya
    expect(workingDaysToCalendarDays(friday, 0)).toBe(0);
  });

  it("subtractOwnCommitment mengeluarkan pesanan sendiri dari komitmen aktif", () => {
    const product = {
      workerHoursPerUnit: 8,
      machineHoursPerUnit: 2,
      materials: [{ materialId: "flour", quantityPerUnit: 2 }],
    };
    const result = subtractOwnCommitment(
      {
        workerHoursCommitted: 240,
        machineHoursCommitted: 60,
        materialCommitments: [{ materialId: "flour", quantityCommitted: 70 }],
      },
      { quantity: 20, product },
    );
    expect(result.workerHoursCommitted).toBe(80);
    expect(result.machineHoursCommitted).toBe(20);
    expect(result.materialCommitments[0].quantityCommitted).toBe(30);
  });

  it("subtractOwnCommitment tidak pernah negatif", () => {
    const product = { workerHoursPerUnit: 8, machineHoursPerUnit: 2, materials: [] };
    const result = subtractOwnCommitment(
      { workerHoursCommitted: 10, machineHoursCommitted: 0, materialCommitments: [] },
      { quantity: 20, product },
    );
    expect(result.workerHoursCommitted).toBe(0);
    expect(result.machineHoursCommitted).toBe(0);
  });
});
