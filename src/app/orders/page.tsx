// src/app/orders/page.tsx
//
// Orders listing page wrapped in BizCapacity Dashboard Operating System Shell.

import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OrdersDashboardView } from "@/components/orders/OrdersDashboardView";

export default async function OrdersPage() {
  let orders: any[] = [];

  try {
    const businessId = await getBusinessId();
    if (businessId) {
      orders = await getOrders(businessId);
    }
  } catch (err) {
    // Fallback gracefully to demo mock dataset in view component
    console.log("Running in preview mode with demo datasets:", err);
  }

  return (
    <DashboardShell activeCount={orders.length > 0 ? orders.length : 18}>
      <OrdersDashboardView initialDbOrders={orders} />
    </DashboardShell>
  );
}
