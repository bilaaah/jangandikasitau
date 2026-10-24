import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductionPlanningView } from "@/components/planning/ProductionPlanningView";

export default function ProductionPlanningPage() {
  return (
    <DashboardShell>
      <ProductionPlanningView />
    </DashboardShell>
  );
}
