// src/app/settings/page.tsx
//
// Settings & Configuration Page (Server Component).

import { getBusinessSettings } from "@/actions/settings.actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsManagerView } from "@/components/settings/SettingsManagerView";
import { getBusinessId } from "@/lib/context";
import { getActiveOrdersCount } from "@/queries/orders.queries";

export const instant = false;

export default async function SettingsPage() {
  const businessId = await getBusinessId();
  const [biz, activeCount] = await Promise.all([
    getBusinessSettings(),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);

  return (
    <DashboardShell activeCount={activeCount}>
      <SettingsManagerView
        initialBusinessName={biz?.name || "SweetCrumbs Artisan Bakery"}
        initialLocation={biz?.type || "Kebayoran Baru, Jakarta Selatan"}
      />
    </DashboardShell>
  );
}
