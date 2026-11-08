import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ResourceManagementView } from "@/components/resources/ResourceManagementView";
import { getBusinessId } from "@/lib/context";
import { getManagedResources } from "@/queries/resources.queries";
import { getActiveOrdersCount } from "@/queries/orders.queries";

export const metadata: Metadata = {
  title: "Staf, Mesin & Bahan — BizCapacity",
  description: "Kelola kapasitas pekerja, mesin, dan stok bahan baku usaha.",
};

export const instant = false;

interface ResourcesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const [{ tab }, businessId] = await Promise.all([searchParams, getBusinessId()]);
  const [resources, activeCount] = await Promise.all([
    getManagedResources(businessId),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);
  const initialTab = tab === "machines" || tab === "materials" ? tab : "workers";

  return (
    <DashboardShell activeCount={activeCount}>
      <ResourceManagementView
        key={initialTab}
        initialWorkers={resources.workers}
        initialMachines={resources.machines}
        initialMaterials={resources.materials}
        initialTab={initialTab}
      />
    </DashboardShell>
  );
}
