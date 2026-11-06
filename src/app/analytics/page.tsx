// src/app/analytics/page.tsx
//
// Analytics & Historical Capacity Intelligence (Server Component).

import { getBusinessId } from "@/lib/context";
import { getAnalyticsData } from "@/queries/analytics.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export const instant = false;

export default async function AnalyticsPage() {
  const businessId = await getBusinessId();
  const data = await getAnalyticsData(businessId);

  return (
    <DashboardShell>
      <AnalyticsView initialData={data} />
    </DashboardShell>
  );
}
