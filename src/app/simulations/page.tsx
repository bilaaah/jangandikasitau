// src/app/simulations/page.tsx
//
// What-If Simulator: server component yang mengambil pesanan DRAFT, CONFIRMED, dan
// IN_PROGRESS (pesanan berjalan bisa tiba-tiba berisiko: pekerja sakit, mesin rusak),
// lalu menyerahkannya ke SimulationsView (client).

import type { Metadata } from "next";
import { getBusinessId } from "@/lib/context";
import { getOrders, getActiveOrdersCount } from "@/queries/orders.queries";
import { getBusinessResources } from "@/queries/resources.queries";
import { SimulationsView, type SimOrder } from "@/components/simulation/SimulationsView";

export const metadata: Metadata = {
  title: "Simulasi Pesanan What-If — BizCapacity",
  description: "Uji berbagai skenario kapasitas produksi sebelum menerima pesanan.",
};

const SIMULATABLE = new Set(["DRAFT", "CONFIRMED", "IN_PROGRESS"]);
const RISKY = new Set(["AT_RISK", "NOT_FEASIBLE"]);

type SimulationSearchParams = { order?: string; solution?: string };

export default async function SimulationsPage({
  searchParams,
}: {
  searchParams?: Promise<SimulationSearchParams>;
}) {
  const businessId = await getBusinessId();
  const [orders, resources, resolvedParams, activeCount] = await Promise.all([
    getOrders(businessId).catch(() => []),
    getBusinessResources(businessId).catch(() => ({ workers: [], machines: [], materials: [] })),
    searchParams ? searchParams.catch(() => ({} as SimulationSearchParams)) : Promise.resolve({} as SimulationSearchParams),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);

  const params: SimulationSearchParams = resolvedParams ?? {};
  const now = new Date();
  const simOrders: SimOrder[] = (orders ?? [])
    .filter((o) => SIMULATABLE.has(o.status) && o.items && o.items.length > 0)
    .map((o) => {
      const firstItem = o.items[0];
      const deliveryDate = o.requiredDeliveryDate ? new Date(o.requiredDeliveryDate) : new Date();
      return {
        id: o.id,
        customerName: o.customerName ?? "Pelanggan",
        productId: firstItem?.productId ?? "",
        productName: firstItem?.product?.name ?? "Produk",
        quantity: firstItem?.quantity ?? 1,
        deliveryDateStr: !isNaN(deliveryDate.getTime())
          ? deliveryDate.toISOString()
          : new Date().toISOString(),
        status: o.status as SimOrder["status"],
        lastKnownRisk: RISKY.has(o.capacityAnalyses?.[0]?.status ?? ""),
      };
    })
    // [Finding #3] Prioritaskan pesanan aktif:
    // 1. Pesanan belum lewat tenggat yang berisiko
    // 2. Pesanan belum lewat tenggat yang aman
    // 3. Pesanan yang tenggatnya sudah lewat (kadaluarsa) diturunkan ke paling bawah
    .sort((a, b) => {
      const aDate = new Date(a.deliveryDateStr);
      const bDate = new Date(b.deliveryDateStr);
      const aExpired = !isNaN(aDate.getTime()) && aDate < now;
      const bExpired = !isNaN(bDate.getTime()) && bDate < now;
      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1; // Kadaluarsa ditaruh paling bawah
      }
      return Number(b.lastKnownRisk) - Number(a.lastKnownRisk);
    });

  return (
    <SimulationsView
      orders={simOrders}
      initialOrderId={params?.order}
      initialSolution={params?.solution}
      workerCount={resources?.workers?.length ?? 0}
      activeOrdersCount={activeCount}
    />
  );
}
