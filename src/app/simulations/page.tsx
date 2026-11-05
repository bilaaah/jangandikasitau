// src/app/simulations/page.tsx
//
// What-If Simulator: server component yang mengambil pesanan DRAFT dan jumlah pekerja,
// lalu menyerahkannya ke SimulationsView (client).

import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/queries/orders.queries";
import { getBusinessResources } from "@/queries/resources.queries";
import { SimulationsView, type SimOrder } from "@/components/simulation/SimulationsView";

export default async function SimulationsPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; solution?: string }>;
}) {
  const businessId = await getBusinessId();
  const [orders, resources, params] = await Promise.all([
    getOrders(businessId),
    getBusinessResources(businessId),
    searchParams,
  ]);

  const simOrders: SimOrder[] = orders
    .filter((o) => o.status === "DRAFT" && o.items.length > 0)
    .map((o) => ({
      id: o.id,
      customerName: o.customerName,
      productId: o.items[0].productId,
      productName: o.items[0].product.name,
      quantity: o.items[0].quantity,
      deliveryDateStr: o.requiredDeliveryDate.toISOString(),
    }));

  return (
    <SimulationsView
      orders={simOrders}
      initialOrderId={params.order}
      initialSolution={params.solution}
      workerCount={resources.workers.length}
    />
  );
}
