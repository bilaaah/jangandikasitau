import { DashboardShell } from "@/components/layout/DashboardShell";
import { ResourceManagementView } from "@/components/resources/ResourceManagementView";
import { getBusinessId } from "@/lib/context";
import { getManagedResources } from "@/queries/resources.queries";

interface ResourcesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const [{ tab }, businessId] = await Promise.all([searchParams, getBusinessId()]);
  const resources = await getManagedResources(businessId);
  const initialTab = tab === "machines" || tab === "materials" ? tab : "workers";

  return (
    <DashboardShell>
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
