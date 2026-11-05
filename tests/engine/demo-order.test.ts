import { describe, expect, it } from "vitest";
import { runCapacityEngine } from "@/engine/capacity/calculator";

describe("300-unit seeded order", () => {
  it("is AT_RISK with a clear worker and deadline bottleneck", () => {
    const analysis = runCapacityEngine({
      newOrder: {
        quantity: 300,
        productId: "demo-rush-gift-box",
        analysisDate: new Date("2026-11-02T00:00:00"),
        requiredDeliveryDate: new Date("2026-11-09T17:00:00"),
      },
      product: {
        workerHoursPerUnit: 0.45,
        machineHoursPerUnit: 0.1,
        materials: [{ materialId: "demo-packaging", quantityPerUnit: 1 }],
      },
      workforce: {
        workers: [
          { id: "worker-1", dailyAvailableHours: 8 },
          { id: "worker-2", dailyAvailableHours: 8 },
          { id: "worker-3", dailyAvailableHours: 8 },
          { id: "worker-4", dailyAvailableHours: 6 },
        ],
      },
      machinery: {
        machines: [
          { id: "machine-1", dailyAvailableHours: 10 },
          { id: "machine-2", dailyAvailableHours: 8 },
        ],
      },
      inventory: {
        materials: [{ id: "demo-packaging", currentStock: 350, unit: "box" }],
      },
      activeCommitments: {
        workerHoursCommitted: 0,
        machineHoursCommitted: 0,
        materialCommitments: [],
      },
    });

    expect(analysis.status).toBe("AT_RISK");
    expect(analysis.workerAnalysis.utilizationPercent).toBe(90);
    expect(analysis.bufferDays).toBe(0);
    expect(analysis.bottlenecks.map((bottleneck) => bottleneck.resourceType)).toEqual([
      "WORKER",
      "TIME",
    ]);
  });
});
