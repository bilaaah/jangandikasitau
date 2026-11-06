// src/app/dashboard/page.tsx
//
// Main BizCapacity Operations Dashboard (Server Component).
// Fetches real database aggregation metrics and commitments per business.

import { getBusinessId } from "@/lib/context";
import { getDashboardData } from "@/queries/dashboard.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const instant = false;

export default async function DashboardPage() {
  const businessId = await getBusinessId();
  const metrics = await getDashboardData(businessId);

  return (
    <DashboardShell activeCount={metrics.activeOrdersCount}>
      <DashboardView metrics={metrics} />
    </DashboardShell>
  );
}
