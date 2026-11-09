// src/schemas/resources.schema.ts
//
// Zod schemas for business resources operations.

import { z } from "zod";

export const ResourceIdSchema = z.object({
  id: z.string().cuid(),
});

const ResourceNameSchema = z.string().trim().min(1, "Nama wajib diisi.").max(120);
const DailyHoursSchema = z.number().finite().positive("Jam tersedia harus lebih dari 0.").max(24);

export const SaveWorkerSchema = z.object({
  id: z.string().cuid().optional(),
  name: ResourceNameSchema,
  dailyAvailableHours: DailyHoursSchema,
});

export const SaveMachineSchema = z.object({
  id: z.string().cuid().optional(),
  name: ResourceNameSchema,
  dailyAvailableHours: DailyHoursSchema,
});

export const SaveMaterialSchema = z.object({
  id: z.string().cuid().optional(),
  name: ResourceNameSchema,
  unit: z.string().trim().min(1, "Satuan wajib diisi.").max(32),
  currentStock: z.number().finite().min(0, "Stok tidak boleh negatif."),
  leadTimeDays: z
    .number()
    .int()
    .min(0, "Lead time harus berupa hari kerja non-negatif.")
    .default(0),
});

export const UpdateMaterialStockSchema = z.object({
  materialId: z.string().cuid(),
  mode: z.enum(["add", "set"]),
  quantity: z.number().finite().min(0, "Jumlah tidak boleh negatif."),
});

export const SaveProductSchema = z.object({
  id: z.string().cuid().optional(),
  name: ResourceNameSchema,
  description: z.string().trim().max(1000).optional(),
  workerHoursPerUnit: z.number().finite().positive("Jam kerja harus lebih dari 0."),
  machineHoursPerUnit: z.number().finite().min(0, "Jam mesin tidak boleh negatif."),
  materials: z
    .array(
      z.object({
        materialId: z.string().cuid(),
        quantityPerUnit: z.number().finite().positive("Kebutuhan bahan harus lebih dari 0."),
      }),
    )
    .min(1, "Tambahkan minimal satu bahan ke BOM.")
    .max(100, "BOM maksimal berisi 100 bahan.")
    .refine(
      (materials) =>
        new Set(materials.map((material) => material.materialId)).size === materials.length,
      "Bahan yang sama tidak boleh dimasukkan dua kali.",
    ),
});

export type UpdateMaterialStockInput = z.infer<typeof UpdateMaterialStockSchema>;
export type SaveWorkerInput = z.infer<typeof SaveWorkerSchema>;
export type SaveMachineInput = z.infer<typeof SaveMachineSchema>;
export type SaveMaterialInput = z.infer<typeof SaveMaterialSchema>;
export type SaveProductInput = z.infer<typeof SaveProductSchema>;
