import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsManagerView } from "@/components/settings/SettingsManagerView";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <SettingsManagerView />
    </DashboardShell>
  );
}
