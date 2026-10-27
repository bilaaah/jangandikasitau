import { describe, it, expect } from "vitest";
import { simulateScenario } from "@/engine/simulation/scenario";
import type { CapacityEngineInput } from "@/engine/types";

function makeInput(flourStock = 100): CapacityEngineInput {
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
    inventory: { materials: [{ id: "flour", currentStock: flourStock, unit: "kg" }] },
    activeCommitments: {
      workerHoursCommitted: 0,
      machineHoursCommitted: 0,
      materialCommitments: [],
    },
  };
}

describe("simulateScenario", () => {
  it("tambah 1 pekerja menurunkan utilisasi dan memperbaiki status", () => {
    const r = simulateScenario(makeInput(), { additionalWorkerDailyHours: 8 });
    expect(r.simulatedResult.workerAnalysis.utilizationPercent).toBeLessThan(
      r.baselineResult.workerAnalysis.utilizationPercent,
    );
    expect(r.deltaWorkerUtilization).toBeLessThan(0);
    expect(r.statusImproved).toBe(true);
  });

  it("perpanjang tenggat menambah hari kerja dan buffer", () => {
    const r = simulateScenario(makeInput(), { deadlineShiftDays: 7 });
    expect(r.simulatedResult.availableWorkDays).toBeGreaterThan(
      r.baselineResult.availableWorkDays,
    );
    expect(r.deltaBufferDays).toBeGreaterThan(0);
  });

  it("tanpa penyesuaian, hasil sama dengan dasar", () => {
    const r = simulateScenario(makeInput(), {});
    expect(r.simulatedResult.status).toBe(r.baselineResult.status);
    expect(r.statusImproved).toBe(false);
    expect(r.deltaWorkerUtilization).toBeCloseTo(0);
    expect(r.deltaBufferDays).toBe(0);
  });

  it("tambah stok bahan menutup defisit material", () => {
    const r = simulateScenario(makeInput(10), { additionalMaterialStock: { flour: 100 } });
    expect(r.baselineResult.bottlenecks.some((b) => b.resourceType === "MATERIAL")).toBe(true);
    expect(r.simulatedResult.bottlenecks.some((b) => b.resourceType === "MATERIAL")).toBe(false);
  });

  it("tidak mengubah input asli (what-if tidak menyentuh data riil)", () => {
    const input = makeInput();
    const snapshot = structuredClone(input);
    simulateScenario(input, {
      additionalWorkerDailyHours: 8,
      deadlineShiftDays: 3,
      additionalMachineDailyHours: 4,
      additionalMaterialStock: { flour: 5 },
    });
    expect(input).toEqual(snapshot);
  });
  
});