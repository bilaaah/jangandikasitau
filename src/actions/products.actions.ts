"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import { ResourceIdSchema, SaveProductSchema } from "@/schemas/resources.schema";
import type { ResourceActionResult } from "@/actions/resources.actions";

function validationError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Periksa kembali data yang dimasukkan.";
}

function revalidateProductPages() {
  revalidatePath("/products");
  revalidatePath("/resources");
  revalidatePath("/orders");
  revalidatePath("/orders/new");
  revalidatePath("/simulations");
}

export async function saveProductAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = SaveProductSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  const { id, materials, ...productData } = parsed.data;
  try {
    await db.$transaction(async (tx) => {
      const materialIds = materials.map((material) => material.materialId);
      const ownedMaterials = await tx.material.findMany({
        where: { id: { in: materialIds }, businessId, isActive: true },
        select: { id: true },
      });
      if (ownedMaterials.length !== materialIds.length) {
        throw new Error("Satu atau beberapa bahan tidak aktif atau bukan milik usaha ini.");
      }

      let productId: string;
      if (id) {
        const existingProduct = await tx.product.findFirst({
          where: { id, businessId, isActive: true },
          select: { id: true },
        });
        if (!existingProduct) throw new Error("Produk tidak ditemukan.");
        await tx.product.update({
          where: { id },
          data: productData,
        });
        productId = id;
      } else {
        const product = await tx.product.create({
          data: { businessId, ...productData },
          select: { id: true },
        });
        productId = product.id;
      }

      await tx.productMaterial.deleteMany({ where: { productId } });
      await tx.productMaterial.createMany({
        data: materials.map((material) => ({
          productId,
          materialId: material.materialId,
          quantityPerUnit: material.quantityPerUnit,
        })),
      });
    });

    revalidateProductPages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan produk.",
    };
  }
}

export async function deactivateProductAction(input: unknown): Promise<ResourceActionResult> {
  const parsed = ResourceIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: validationError(parsed.error) };

  const businessId = await getBusinessId();
  try {
    const result = await db.product.updateMany({
      where: { id: parsed.data.id, businessId, isActive: true },
      data: { isActive: false },
    });
    if (result.count === 0) return { success: false, error: "Produk tidak ditemukan." };

    revalidateProductPages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menonaktifkan produk.",
    };
  }
}
