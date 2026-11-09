import { describe, it, expect, vi } from "vitest";
import { generateAdviceForOrderAction } from "@/actions/ai.actions";

// Mock dependencies
vi.mock("@/lib/context", () => ({
  getBusinessId: vi.fn().mockResolvedValue("biz_123"),
}));

vi.mock("@/queries/orders.queries", () => ({
  getOrderById: vi.fn().mockImplementation((id: string) => {
    if (id === "order_not_found") return Promise.resolve(null);
    return Promise.resolve({
      id,
      customerName: "PT Pelanggan Setia",
      requiredDeliveryDate: new Date("2026-11-20T00:00:00Z"),
      items: [
        {
          quantity: 10,
          productId: "prod_1",
          product: {
            name: "Sourdough Loaf",
            workerHoursPerUnit: 2,
            machineHoursPerUnit: 1,
            materials: [
              { materialId: "mat_flour", quantityPerUnit: 0.5 },
            ],
          },
        },
      ],
    });
  }),
  getActiveCommitments: vi.fn().mockResolvedValue({
    workerHoursCommitted: 0,
    machineHoursCommitted: 0,
    materialCommitments: [],
  }),
}));

vi.mock("@/queries/resources.queries", () => ({
  getBusinessResources: vi.fn().mockResolvedValue({
    workers: [{ id: "w1", dailyAvailableHours: 8 }],
    machines: [{ id: "m1", dailyAvailableHours: 8 }],
    materials: [
      { id: "mat_flour", name: "Flour", unit: "kg", currentStock: 100, leadTimeDays: 2 },
    ],
  }),
}));

describe("generateAdviceForOrderAction", () => {
  it("rejects empty orderId", async () => {
    const res = await generateAdviceForOrderAction({ orderId: "" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("ID pesanan tidak valid");
  });

  it("handles order not found gracefully", async () => {
    const res = await generateAdviceForOrderAction({ orderId: "order_not_found" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("Pesanan tidak ditemukan");
  });

  it("successfully generates advice for existing order using fallback or engine", async () => {
    const res = await generateAdviceForOrderAction({ orderId: "order_valid" });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.headline).toBeDefined();
    expect(res.data?.riskAssessment).toBeDefined();
    expect(Array.isArray(res.data?.actionItems)).toBe(true);
  });
});

