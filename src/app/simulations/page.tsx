// src/app/simulations/page.tsx
//
// What-If Simulator: server component yang mengambil pesanan DRAFT, CONFIRMED, dan
// IN_PROGRESS (pesanan berjalan bisa tiba-tiba berisiko: pekerja sakit, mesin rusak),
// lalu menyerahkannya ke SimulationsView (client).

import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/queries/orders.queries";
import { getBusinessResources } from "@/queries/resources.queries";
import { SimulationsView, type SimOrder } from "@/components/simulation/SimulationsView";

const SIMULATABLE = new Set(["DRAFT", "CONFIRMED", "IN_PROGRESS"]);
const RISKY = new Set(["AT_RISK", "NOT_FEASIBLE"]);

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
    .filter((o) => SIMULATABLE.has(o.status) && o.items.length > 0)
    .map((o) => ({
      id: o.id,
      customerName: o.customerName,
      productId: o.items[0].productId,
      productName: o.items[0].product.name,
      quantity: o.items[0].quantity,
      deliveryDateStr: o.requiredDeliveryDate.toISOString(),
      status: o.status as SimOrder["status"],
      lastKnownRisk: RISKY.has(o.capacityAnalyses[0]?.status ?? ""),
    }))
    // Pesanan berisiko lebih dulu, lalu urutan terbaru (urutan asli dipertahankan oleh sort stabil)
    .sort((a, b) => Number(b.lastKnownRisk) - Number(a.lastKnownRisk));

  return (
    <SimulationsView
      orders={simOrders}
      initialOrderId={params.order}
      initialSolution={params.solution}
      workerCount={resources.workers.length}
    />
  );
}
