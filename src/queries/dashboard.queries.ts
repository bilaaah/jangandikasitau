// src/queries/dashboard.queries.ts
//
// Read-only database queries and real aggregation metrics for the main Dashboard.
// Replaces hardcoded mock KPIs with deterministic database calculations.

import { db } from "@/lib/db";
import { getOrders, getActiveCommitments } from "@/queries/orders.queries";
import { getBusinessResources } from "@/queries/resources.queries";

export interface DashboardMetrics {
  businessName: string;
  totalOrdersCount: number;
  activeOrdersCount: number;
  attentionOrdersCount: number;
  overallUtilizationPercent: number;
  workerHoursCommitted: number;
  workerHoursTotalAvailable: number;
  workerUtilizationPercent: number;
  machineHoursCommitted: number;
  machineHoursTotalAvailable: number;
  machineUtilizationPercent: number;
  attentionStationText: string;
  criticalMaterials: {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
    committedStock: number;
    deficit: number;
  }[];
  activeOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    productName: string;
    quantity: number;
    status: string;
    capacityStatus: "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" | "DRAFT";
    deadlineText: string;
    statusNote: string;
  }[];
  stationsUtilization: {
    name: string;
    percent: number;
    statusLabel: string;
    statusBadgeClass: string;
    barColorClass: string;
    detail: string;
    note?: string;
  }[];
}

export async function getDashboardData(businessId: string): Promise<DashboardMetrics> {
  const [business, orders, resources, commitments] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
      select: { name: true },
    }),
    getOrders(businessId),
    getBusinessResources(businessId),
    getActiveCommitments(businessId),
  ]);

  const businessName = business?.name || "SweetCrumbs Artisan Bakery";

  // Hitung total kapasitas pekerja & mesin harian
  const totalDailyWorkerHours = resources.workers.reduce(
    (sum, w) => sum + (w.dailyAvailableHours || 0),
    0,
  );
  const totalDailyMachineHours = resources.machines.reduce(
    (sum, m) => sum + (m.dailyAvailableHours || 0),
    0,
  );

  // Standar window 5 hari kerja mingguan untuk kapasitas operasional
  const weeklyWorkerCapacity = Math.max(totalDailyWorkerHours * 5, 1);
  const weeklyMachineCapacity = Math.max(totalDailyMachineHours * 5, 1);

  const workerHoursCommitted = Math.round(commitments.workerHoursCommitted * 10) / 10;
  const machineHoursCommitted = Math.round(commitments.machineHoursCommitted * 10) / 10;

  const workerUtilizationPercent = Math.min(
    100,
    Math.round((workerHoursCommitted / weeklyWorkerCapacity) * 100),
  );
  const machineUtilizationPercent = Math.min(
    100,
    Math.round((machineHoursCommitted / weeklyMachineCapacity) * 100),
  );
  const overallUtilizationPercent = Math.max(
    workerUtilizationPercent,
    machineUtilizationPercent,
  );

  // Filter pesanan yang butuh perhatian (AT_RISK atau NOT_FEASIBLE)
  const attentionOrders = orders.filter((o) => {
    const status = o.capacityAnalyses?.[0]?.status;
    return (
      (status === "AT_RISK" || status === "NOT_FEASIBLE") &&
      o.status !== "COMPLETED" &&
      o.status !== "CANCELLED"
    );
  });

  const activeOrdersList = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  // Hitung material kritis (stok defisit atau menipis)
  const criticalMaterials: DashboardMetrics["criticalMaterials"] = [];
  for (const mat of resources.materials) {
    const committedItem = commitments.materialCommitments.find(
      (c) => c.materialId === mat.id,
    );
    const committedStock = committedItem ? committedItem.quantityCommitted : 0;
    const remainingStock = mat.currentStock - committedStock;

    if (remainingStock < 0 || mat.currentStock <= 0) {
      criticalMaterials.push({
        id: mat.id,
        name: mat.name,
        unit: mat.unit,
        currentStock: mat.currentStock,
        committedStock,
        deficit: remainingStock,
      });
    }
  }

  // Jika tidak ada defisit kritis, tampilkan material dengan stok paling sedikit sebagai monitoring
  if (criticalMaterials.length === 0 && resources.materials.length > 0) {
    const sorted = [...resources.materials].sort((a, b) => a.currentStock - b.currentStock);
    for (const mat of sorted.slice(0, 2)) {
      criticalMaterials.push({
        id: mat.id,
        name: mat.name,
        unit: mat.unit,
        currentStock: mat.currentStock,
        committedStock: 0,
        deficit: mat.currentStock,
      });
    }
  }

  // Format pesanan aktif untuk kartu dashboard (maksimal 3 kartu utama)
  const activeOrders: DashboardMetrics["activeOrders"] = (
    activeOrdersList.length > 0 ? activeOrdersList.slice(0, 3) : orders.slice(0, 3)
  ).map((o) => {
    const latestAnalysis = o.capacityAnalyses?.[0];
    const status = (latestAnalysis?.status || "DRAFT") as
      | "FEASIBLE"
      | "AT_RISK"
      | "NOT_FEASIBLE"
      | "DRAFT";

    let statusNote = "Kapasitas aman";
    const firstReason = Array.isArray(latestAnalysis?.reasoning)
      ? String(latestAnalysis.reasoning[0])
      : undefined;
    if (status === "AT_RISK") {
      statusNote = firstReason || "Perlu peninjauan alokasi jam kerja";
    } else if (status === "NOT_FEASIBLE") {
      statusNote = "Melebihi batas kapasitas/stok bahan baku";
    } else if (o.status === "CONFIRMED") {
      statusNote = "Kapasitas terkunci dan terjadwal";
    }

    return {
      id: o.id,
      orderNumber: `BC-${o.id.slice(0, 4).toUpperCase()}`,
      customerName: o.customerName || "Pelanggan",
      productName: o.items?.[0]?.product?.name || "Produk Make-to-Order",
      quantity: o.items?.[0]?.quantity || 1,
      status: o.status,
      capacityStatus: status,
      deadlineText: new Date(o.requiredDeliveryDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      statusNote,
    };
  });

  // Stasiun utilization breakdown
  const stationsUtilization: DashboardMetrics["stationsUtilization"] = [
    {
      name: "Tenaga Kerja & Operator Produksi",
      percent: workerUtilizationPercent,
      statusLabel:
        workerUtilizationPercent >= 90
          ? "🔴 PADAT"
          : workerUtilizationPercent >= 75
            ? "⚠️ PERHATIAN"
            : "✅ AMAN",
      statusBadgeClass:
        workerUtilizationPercent >= 90
          ? "bg-rose-100 dark:bg-rose-500/[0.15] text-rose-700 dark:text-rose-300"
          : workerUtilizationPercent >= 75
            ? "bg-amber-100 dark:bg-amber-500/[0.15] text-amber-700 dark:text-amber-300"
            : "bg-emerald-100 dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-300",
      barColorClass:
        workerUtilizationPercent >= 90
          ? "bg-rose-500"
          : workerUtilizationPercent >= 75
            ? "bg-amber-500"
            : "bg-emerald-500",
      detail: `${workerHoursCommitted} jam terpakai dari ${weeklyWorkerCapacity} jam/minggu`,
      note:
        workerUtilizationPercent >= 85
          ? "Kapasitas tenaga kerja mendekati batas aman."
          : "Tersedia jam kerja bebas untuk pesanan tambahan.",
    },
    {
      name: "Mesin, Oven & Peralatan Utama",
      percent: machineUtilizationPercent,
      statusLabel:
        machineUtilizationPercent >= 90
          ? "🔴 PADAT"
          : machineUtilizationPercent >= 75
            ? "⚠️ PERHATIAN"
            : "✅ AMAN",
      statusBadgeClass:
        machineUtilizationPercent >= 90
          ? "bg-rose-100 dark:bg-rose-500/[0.15] text-rose-700 dark:text-rose-300"
          : machineUtilizationPercent >= 75
            ? "bg-amber-100 dark:bg-amber-500/[0.15] text-amber-700 dark:text-amber-300"
            : "bg-blue-100 dark:bg-blue-500/[0.15] text-blue-700 dark:text-blue-300",
      barColorClass:
        machineUtilizationPercent >= 90
          ? "bg-rose-500"
          : machineUtilizationPercent >= 75
            ? "bg-amber-500"
            : "bg-blue-600",
      detail: `${machineHoursCommitted} jam terpakai dari ${weeklyMachineCapacity} jam/minggu`,
      note: "Kapasitas mesin siap dialokasikan.",
    },
  ];

  let attentionStationText = "Semua stasiun aman";
  if (workerUtilizationPercent >= 85 && machineUtilizationPercent >= 85) {
    attentionStationText = "Staf & Mesin mendekati batas";
  } else if (workerUtilizationPercent >= 85) {
    attentionStationText = "Staf Produksi mendekati batas";
  } else if (machineUtilizationPercent >= 85) {
    attentionStationText = "Mesin/Oven mendekati batas";
  } else if (attentionOrders.length > 0) {
    attentionStationText = `${attentionOrders.length} Pesanan Butuh Review`;
  }

  return {
    businessName,
    totalOrdersCount: orders.length,
    activeOrdersCount: activeOrdersList.length,
    attentionOrdersCount: attentionOrders.length,
    overallUtilizationPercent,
    workerHoursCommitted,
    workerHoursTotalAvailable: weeklyWorkerCapacity,
    workerUtilizationPercent,
    machineHoursCommitted,
    machineHoursTotalAvailable: weeklyMachineCapacity,
    machineUtilizationPercent,
    attentionStationText,
    criticalMaterials,
    activeOrders,
    stationsUtilization,
  };
}
