import { describe, it, expect } from "vitest";
import { runCapacityEngine } from "@/engine/capacity/calculator";
import { simulateScenario } from "@/engine/simulation/scenario";
import type { CapacityEngineInput } from "@/engine/types";

/**
 * Fixture meniru prisma/seed.ts (SweetCrumbs Bakery), produk "Custom Gift Boxes Lebaran":
 * 4 pekerja (8+8+8+6 = 30 jam/hari), 2 mesin (10+8 = 18 jam/hari),
 * 1,5 jam kerja dan 0,8 jam mesin per unit. Analisis Senin 2 Nov 2026, tanpa pesanan aktif.
 */
function giftBoxInput(quantity: number, deadline: string): CapacityEngineInput {
  return {
    newOrder: {
      quantity,
      productId: "gift-box",
      analysisDate: new Date("2026-11-02T08:00:00"),
      requiredDeliveryDate: new Date(deadline),
    },
    product: {
      workerHoursPerUnit: 1.5,
      machineHoursPerUnit: 0.8,
      materials: [
        { materialId: "hardbox", quantityPerUnit: 1 },
        { materialId: "ribbon", quantityPerUnit: 2 },
        { materialId: "jar", quantityPerUnit: 3 },
      ],
    },
    workforce: { workers: [8, 8, 8, 6].map((h, i) => ({ id: `w${i}`, dailyAvailableHours: h })) },
    machinery: { machines: [10, 8].map((h, i) => ({ id: `m${i}`, dailyAvailableHours: h })) },
    inventory: {
      materials: [
        { id: "hardbox", currentStock: 250, unit: "box" },
        { id: "ribbon", currentStock: 600, unit: "meter" },
        { id: "jar", currentStock: 800, unit: "pcs" },
      ],
    },
    activeCommitments: { workerHoursCommitted: 0, machineHoursCommitted: 0, materialCommitments: [] },
  };
}

const DEADLINE_8_HARI_KERJA = "2026-11-12T12:00:00";

describe("skenario demo BizCapacity (data seed)", () => {
  it("pesanan layak: 100 box, 8 hari kerja", () => {
    const r = runCapacityEngine(giftBoxInput(100, DEADLINE_8_HARI_KERJA));
    expect(r.status).toBe("FEASIBLE");
    expect(r.availableWorkDays).toBe(8);
    expect(r.workerAnalysis.utilizationPercent).toBeCloseTo(62.5, 1);
    expect(r.bufferDays).toBe(3);
  });

  it("pesanan berisiko (alur demo utama): 150 box, 8 hari kerja", () => {
    const r = runCapacityEngine(giftBoxInput(150, DEADLINE_8_HARI_KERJA));
    expect(r.status).toBe("AT_RISK");
    expect(r.workerAnalysis.utilizationPercent).toBeCloseTo(93.8, 1);
    expect(r.machineAnalysis.utilizationPercent).toBeCloseTo(83.3, 1);
    expect(r.bufferDays).toBe(0);
    expect(r.bottlenecks.some((b) => b.resourceType === "WORKER" && b.severity === "WARNING")).toBe(true);
  });

  it("what-if tambah 1 pekerja (8 jam/hari) mengubah AT_RISK menjadi FEASIBLE", () => {
    const r = simulateScenario(giftBoxInput(150, DEADLINE_8_HARI_KERJA), { additionalWorkerDailyHours: 8 });
    expect(r.baselineResult.status).toBe("AT_RISK");
    expect(r.simulatedResult.status).toBe("FEASIBLE");
    expect(r.simulatedResult.workerAnalysis.utilizationPercent).toBeCloseTo(74, 1);
    expect(r.statusImproved).toBe(true);
  });

  it("what-if perpanjang tenggat 3 hari mengubah AT_RISK menjadi FEASIBLE", () => {
    const r = simulateScenario(giftBoxInput(150, DEADLINE_8_HARI_KERJA), { deadlineShiftDays: 3 });
    expect(r.simulatedResult.status).toBe("FEASIBLE");
    expect(r.simulatedResult.availableWorkDays).toBe(10);
  });

  it("lembur kecil (+2 jam/hari) belum cukup: tetap AT_RISK", () => {
    const r = simulateScenario(giftBoxInput(150, DEADLINE_8_HARI_KERJA), { additionalWorkerDailyHours: 2 });
    expect(r.simulatedResult.status).toBe("AT_RISK");
    expect(r.statusImproved).toBe(false);
  });

  it("defisit bahan baku: 260 box dengan stok hardbox 250", () => {
    const input = giftBoxInput(260, "2026-12-31T12:00:00");
    const r = runCapacityEngine(input);
    expect(r.status).toBe("NOT_FEASIBLE");
    expect(r.bottlenecks).toHaveLength(1);
    expect(r.bottlenecks[0].resourceType).toBe("MATERIAL");
    const fixed = simulateScenario(input, { additionalMaterialStock: { hardbox: 20 } });
    expect(fixed.simulatedResult.status).toBe("FEASIBLE");
  });
});