"use server";

// src/actions/simulation.actions.ts
//
// What-if dari data usaha yang sedang login. Tidak menulis apa pun ke database.

import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getBusinessId } from "@/lib/context";
import {
  simulateScenario,
  subtractOwnCommitment,
  workingDaysToCalendarDays,
} from "@/engine/simulation/scenario";
import {
  MAX_ADDITIONAL_WORKER_DAILY_HOURS,
  type WhatIfAdjustments,
  type WhatIfSimulationResult,
} from "@/engine/simulation/types";
import type { CapacityEngineInput } from "@/engine/types";
import { getBusinessResources, getProductById } from "@/queries/resources.queries";
import { getActiveCommitments } from "@/queries/orders.queries";
import type { ActionResult } from "./feasibility.actions";

const OrderRefSchema = z.object({
  /** Jika diisi, produk/jumlah/tenggat dibaca dari database (bukan dari klien). */
  orderId: z.string().min(1).max(100).optional(),
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(1_000_000),
  deliveryDateStr: z.string().min(1).max(40),
});

const AdjustmentsSchema = z.object({
  additionalWorkerDailyHours: z.number().min(0).max(MAX_ADDITIONAL_WORKER_DAILY_HOURS).optional(),
  additionalMachineDailyHours: z.number().min(0).max(24).optional(),
  deadlineShiftDays: z.number().int().min(0).max(30).optional(),
  additionalMaterialStock: z.record(z.string(), z.number().min(0).max(1_000_000)).optional(),
  outsourcePercent: z.number().int().min(0).max(100).optional(),
  splitDelivery: z
    .object({
      firstWavePercent: z.number().int().min(10).max(90),
      /** Jeda termin 2 dalam HARI KERJA (dikonversi ke hari kalender di server). */
      secondWaveDelayWorkingDays: z.number().int().min(1).max(14),
    })
    .optional(),
});

const SIMULATABLE_STATUSES: OrderStatus[] = [
  OrderStatus.DRAFT,
  OrderStatus.CONFIRMED,
  OrderStatus.IN_PROGRESS,
];

export async function runWhatIfForOrderAction(
  orderRef: unknown,
  adjustments: unknown,
): Promise<ActionResult<WhatIfSimulationResult>> {
  const businessId = await getBusinessId();

  const ref = OrderRefSchema.safeParse(orderRef);
  const adj = AdjustmentsSchema.safeParse(adjustments);
  if (!ref.success || !adj.success) {
    return { success: false, error: "Parameter simulasi tidak valid." };
  }

  try {
    let productId = ref.data.productId;
    let quantity = ref.data.quantity;
    let deliveryDate = new Date(ref.data.deliveryDateStr);
    let isActiveOrder = false;

    // Pesanan nyata: ambil dari database agar konsisten dan tidak bisa dipalsukan klien.
    if (ref.data.orderId) {
      const order = await db.order.findFirst({
        where: { id: ref.data.orderId, businessId },
        include: { items: true },
      });
      if (!order || order.items.length === 0) {
        return { success: false, error: "Pesanan tidak ditemukan pada usaha ini." };
      }
      if (!SIMULATABLE_STATUSES.includes(order.status)) {
        return { success: false, error: "Pesanan ini sudah selesai atau dibatalkan." };
      }
      productId = order.items[0].productId;
      quantity = order.items[0].quantity;
      deliveryDate = order.requiredDeliveryDate;
      isActiveOrder = order.status !== OrderStatus.DRAFT;
    }

    if (Number.isNaN(deliveryDate.getTime())) {
      return { success: false, error: "Tanggal pengiriman tidak valid." };
    }

    const [resources, product, commitments] = await Promise.all([
      getBusinessResources(businessId),
      getProductById(productId, businessId),
      getActiveCommitments(businessId),
    ]);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan pada usaha ini." };
    }

    const engineProduct: CapacityEngineInput["product"] = {
      workerHoursPerUnit: product.workerHoursPerUnit,
      machineHoursPerUnit: product.machineHoursPerUnit,
      materials: product.materials.map((pm: { materialId: string; quantityPerUnit: number }) => ({
        materialId: pm.materialId,
        quantityPerUnit: pm.quantityPerUnit,
      })),
    };

    const baseInput: CapacityEngineInput = {
      newOrder: {
        quantity,
        productId,
        analysisDate: new Date(),
        requiredDeliveryDate: deliveryDate,
      },
      product: engineProduct,
      workforce: {
        workers: resources.workers.map((w) => ({ id: w.id, dailyAvailableHours: w.dailyAvailableHours })),
      },
      machinery: {
        machines: resources.machines.map((m) => ({ id: m.id, dailyAvailableHours: m.dailyAvailableHours })),
      },
      inventory: {
        materials: resources.materials.map((m) => ({ id: m.id, currentStock: m.currentStock, unit: m.unit })),
      },
      // Pesanan CONFIRMED/IN_PROGRESS sudah ada di komitmen aktif: keluarkan agar tidak terhitung ganda.
      activeCommitments: isActiveOrder
        ? subtractOwnCommitment(commitments, { quantity, product: engineProduct })
        : commitments,
    };

    const { splitDelivery, ...rest } = adj.data;
    const adjustmentsForEngine: WhatIfAdjustments = {
      ...rest,
      deadlineShiftDays: rest.deadlineShiftDays
        ? workingDaysToCalendarDays(deliveryDate, rest.deadlineShiftDays)
        : undefined,
      splitDelivery: splitDelivery
        ? {
            firstWavePercent: splitDelivery.firstWavePercent,
            secondWaveDelayDays: workingDaysToCalendarDays(
              deliveryDate,
              splitDelivery.secondWaveDelayWorkingDays,
            ),
          }
        : undefined,
    };

    return { success: true, data: simulateScenario(baseInput, adjustmentsForEngine) };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menjalankan simulasi what-if.",
    };
  }
}
