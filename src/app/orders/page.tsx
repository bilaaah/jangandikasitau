// src/app/orders/page.tsx
//
// Orders listing page wrapped in BizCapacity Dashboard Operating System Shell.

import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OrdersDashboardView } from "@/components/orders/OrdersDashboardView";

export const instant = false;

export default async function OrdersPage() {
  const businessId = await getBusinessId();
  let orders: any[] = [];
  try {
    orders = await getOrders(businessId);
  } catch (err) {
    console.warn("[OrdersPage] DB query fallback:", err);
    orders = [];
  }

  return (
    <DashboardShell activeCount={orders.length > 0 ? orders.length : 18}>
      <OrdersDashboardView initialDbOrders={orders} />
    </DashboardShell>
  );
}
