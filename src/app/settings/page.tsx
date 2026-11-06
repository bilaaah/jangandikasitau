// src/app/settings/page.tsx
//
// Settings & Configuration Page (Server Component).

import { getBusinessSettings } from "@/actions/settings.actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsManagerView } from "@/components/settings/SettingsManagerView";

export const instant = false;

export default async function SettingsPage() {
  const biz = await getBusinessSettings();

  return (
    <DashboardShell>
      <SettingsManagerView
        initialBusinessName={biz?.name || "SweetCrumbs Artisan Bakery"}
        initialLocation={biz?.type || "Kebayoran Baru, Jakarta Selatan"}
      />
    </DashboardShell>
  );
}
