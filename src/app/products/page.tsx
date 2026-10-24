import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductsManagerView } from "@/components/products/ProductsManagerView";

export default function ProductsPage() {
  return (
    <DashboardShell>
      <ProductsManagerView />
    </DashboardShell>
  );
}
