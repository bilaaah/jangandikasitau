// src/app/analytics/page.tsx
//
// Analytics & Historical Capacity Intelligence (Server Component).

import { getBusinessId } from "@/lib/context";
import { getAnalyticsData } from "@/queries/analytics.queries";
import { getActiveOrdersCount } from "@/queries/orders.queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export const instant = false;

export default async function AnalyticsPage() {
  const businessId = await getBusinessId();
  const [data, activeCount] = await Promise.all([
    getAnalyticsData(businessId),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);

  return (
    <DashboardShell activeCount={activeCount}>
      <AnalyticsView initialData={data} />
    </DashboardShell>
  );
}
