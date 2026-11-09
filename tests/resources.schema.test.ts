import { describe, expect, it } from "vitest";
import { SaveMaterialSchema } from "@/schemas/resources.schema";

describe("SaveMaterialSchema lead time", () => {
  const material = {
    name: "Flour",
    unit: "kg",
    currentStock: 20,
  };

  it("defaults supplier lead time to zero working days", () => {
    expect(SaveMaterialSchema.parse(material).leadTimeDays).toBe(0);
  });

  it("accepts non-negative whole working days", () => {
    expect(SaveMaterialSchema.parse({ ...material, leadTimeDays: 3 }).leadTimeDays).toBe(3);
  });

  it("rejects fractional and negative working days", () => {
    expect(SaveMaterialSchema.safeParse({ ...material, leadTimeDays: 1.5 }).success).toBe(false);
    expect(SaveMaterialSchema.safeParse({ ...material, leadTimeDays: -1 }).success).toBe(false);
  });
});
