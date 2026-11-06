// src/app/production-planning/page.tsx
//
// Production Planning Gantt View (Server Component).
// Supplies real orders from the database to visual Gantt scheduling.

import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductionPlanningView } from "@/components/planning/ProductionPlanningView";

export const instant = false;

export default async function ProductionPlanningPage() {
  const businessId = await getBusinessId();
  let orders: any[] = [];
  try {
    orders = await getOrders(businessId);
  } catch (err) {
    console.warn("[ProductionPlanningPage] DB query fallback:", err);
    orders = [];
  }

  return (
    <DashboardShell activeCount={orders.length}>
      <ProductionPlanningView initialDbOrders={orders} />
    </DashboardShell>
  );
}
