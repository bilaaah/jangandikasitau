"use server";

// src/actions/settings.actions.ts
//
// Server Action to update business settings and operational profile in the database.

import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import { revalidatePath } from "next/cache";

export interface SettingsActionResult {
  success: boolean;
  error?: string;
  data?: {
    businessName: string;
    type?: string;
  };
}

export async function updateBusinessSettingsAction(formData: {
  shopName: string;
  location?: string;
  contactPhone?: string;
  shiftHours?: number;
  utilThreshold?: number;
  deliveryBufferDays?: number;
  overtimeHourlyRate?: number;
  freelanceDayRate?: number;
}): Promise<SettingsActionResult> {
  const businessId = await getBusinessId();

  if (!formData.shopName || formData.shopName.trim().length === 0) {
    return { success: false, error: "Nama usaha tidak boleh kosong." };
  }

  try {
    const updated = await db.business.update({
      where: { id: businessId },
      data: {
        name: formData.shopName.trim(),
        type: formData.location?.trim() || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        businessName: updated.name,
        type: updated.type || undefined,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan ke database.",
    };
  }
}

export async function getBusinessSettings() {
  const businessId = await getBusinessId();
  const biz = await db.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, type: true },
  });
  return biz;
}

