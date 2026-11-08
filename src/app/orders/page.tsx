import type { Metadata } from "next";
import { getBusinessId } from "@/lib/context";
import { getOrders, getActiveOrdersCount } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OrdersDashboardView } from "@/components/orders/OrdersDashboardView";

export const metadata: Metadata = {
  title: "Daftar Pesanan — BizCapacity",
  description: "Kelola seluruh pesanan masuk, berjalan, dan selesai.",
};

export const instant = false;

export default async function OrdersPage() {
  const businessId = await getBusinessId();
  let orders: any[] = [];
  let activeCount = 0;
  try {
    [orders, activeCount] = await Promise.all([
      getOrders(businessId),
      getActiveOrdersCount(businessId),
    ]);
  } catch (err) {
    console.warn("[OrdersPage] DB query fallback:", err);
    orders = [];
    activeCount = 0;
  }

  return (
    <DashboardShell activeCount={activeCount}>
      <OrdersDashboardView initialDbOrders={orders} />
    </DashboardShell>
  );
}
