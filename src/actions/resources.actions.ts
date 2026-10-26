"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import {
  ResourceIdSchema,
  SaveMachineSchema,
  SaveMaterialSchema,
  SaveWorkerSchema,
  UpdateMaterialStockSchema,
} from "@/schemas/resources.schema";
import { z } from "zod";

export type ResourceActionResult =
  | { success: true }
  | { success: false; error: string };

function validationError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Periksa kembali data yang dimasukkan.";
}

function revalidateResourcePages() {
  revalidatePath("/resources");
  revalidatePath("/products");
  revalidatePath("/orders");
  revalidatePath("/orders/new");
  revalidatePath("/simulations");
}

export async function saveWorkerAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = SaveWorkerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    if (parsed.data.id) {
      const updated = await db.worker.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: { name: parsed.data.name, dailyAvailableHours: parsed.data.dailyAvailableHours },
      });
      if (updated.count === 0) return { success: false, error: "Data pekerja tidak ditemukan." };
    } else {
      await db.worker.create({
        data: {
          businessId,
          name: parsed.data.name,
          dailyAvailableHours: parsed.data.dailyAvailableHours,
        },
      });
    }
    revalidateResourcePages();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan pekerja." };
  }
}

export async function saveMachineAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = SaveMachineSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    if (parsed.data.id) {
      const updated = await db.machine.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: { name: parsed.data.name, dailyAvailableHours: parsed.data.dailyAvailableHours },
      });
      if (updated.count === 0) return { success: false, error: "Data mesin tidak ditemukan." };
    } else {
      await db.machine.create({
        data: {
          businessId,
          name: parsed.data.name,
          dailyAvailableHours: parsed.data.dailyAvailableHours,
        },
      });
    }
    revalidateResourcePages();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan mesin." };
  }
}

export async function saveMaterialAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = SaveMaterialSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    if (parsed.data.id) {
      const updated = await db.material.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: {
          name: parsed.data.name,
          unit: parsed.data.unit,
          currentStock: parsed.data.currentStock,
          stockUpdatedAt: new Date(),
        },
      });
      if (updated.count === 0) return { success: false, error: "Bahan baku tidak ditemukan." };
    } else {
      await db.material.create({
        data: {
          businessId,
          name: parsed.data.name,
          unit: parsed.data.unit,
          currentStock: parsed.data.currentStock,
          stockUpdatedAt: new Date(),
        },
      });
    }
    revalidateResourcePages();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan bahan baku." };
  }
}

export async function updateMaterialStockAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = UpdateMaterialStockSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    const updated = await db.material.updateMany({
      where: { id: parsed.data.materialId, businessId, isActive: true },
      data: {
        currentStock:
          parsed.data.mode === "add"
            ? { increment: parsed.data.quantity }
            : parsed.data.quantity,
        stockUpdatedAt: new Date(),
      },
    });
    if (updated.count === 0) return { success: false, error: "Bahan baku tidak ditemukan." };
    revalidateResourcePages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui snapshot stok.",
    };
  }
}

export async function deactivateResourceAction(
  type: unknown,
  input: unknown,
): Promise<ResourceActionResult> {
  const parsedType = z.enum(["worker", "machine", "material"]).safeParse(type);
  if (!parsedType.success) return { success: false, error: "Jenis data tidak valid." };
  const parsed = ResourceIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    if (parsedType.data === "worker") {
      const result = await db.worker.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: { isActive: false },
      });
      if (result.count === 0) return { success: false, error: "Data pekerja tidak ditemukan." };
    } else if (parsedType.data === "machine") {
      const result = await db.machine.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: { isActive: false },
      });
      if (result.count === 0) return { success: false, error: "Data mesin tidak ditemukan." };
    } else {
      const activeProductUsage = await db.productMaterial.findFirst({
        where: {
          materialId: parsed.data.id,
          product: { businessId, isActive: true },
        },
        select: { id: true },
      });
      if (activeProductUsage) {
        return {
          success: false,
          error: "Bahan ini masih dipakai BOM produk aktif. Hapus dari BOM terlebih dahulu.",
        };
      }
      const result = await db.material.updateMany({
        where: { id: parsed.data.id, businessId, isActive: true },
        data: { isActive: false },
      });
      if (result.count === 0) return { success: false, error: "Bahan baku tidak ditemukan." };
    }

    revalidateResourcePages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menonaktifkan data.",
    };
  }
}
