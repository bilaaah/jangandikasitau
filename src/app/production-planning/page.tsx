// src/app/production-planning/page.tsx
//
// Production Planning Gantt View (Server Component).
// Supplies real orders from the database to visual Gantt scheduling.

import type { Metadata } from "next";
import { getBusinessId } from "@/lib/context";
import { getOrders, getActiveOrdersCount } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductionPlanningView } from "@/components/planning/ProductionPlanningView";

export const metadata: Metadata = {
  title: "Jadwal Produksi — BizCapacity",
  description: "Visualisasi jadwal antrean produksi per stasiun kerja.",
};

export const instant = false;

export default async function ProductionPlanningPage() {
  const businessId = await getBusinessId();
  let orders: any[] = [];
  let activeCount = 0;
  try {
    [orders, activeCount] = await Promise.all([
      getOrders(businessId),
      getActiveOrdersCount(businessId),
    ]);
  } catch (err) {
    console.warn("[ProductionPlanningPage] DB query fallback:", err);
    orders = [];
    activeCount = 0;
  }

  return (
    <DashboardShell activeCount={activeCount}>
      <ProductionPlanningView initialDbOrders={orders} />
    </DashboardShell>
  );
}
