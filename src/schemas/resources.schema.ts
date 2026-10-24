// src/schemas/resources.schema.ts
//
// Zod schemas for business resources operations.

import { z } from "zod";

export const ResourceIdSchema = z.object({
  id: z.string().cuid(),
});

export const UpdateMaterialStockSchema = z.object({
  materialId: z.string().cuid(),
  currentStock: z.number().min(0, "Stock cannot be negative"),
});

export type UpdateMaterialStockInput = z.infer<typeof UpdateMaterialStockSchema>;
