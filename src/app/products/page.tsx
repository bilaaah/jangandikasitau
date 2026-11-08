import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductManagementView } from "@/components/products/ProductManagementView";
import { getBusinessId } from "@/lib/context";
import { getManagedProducts, getManagedResources } from "@/queries/resources.queries";
import { getActiveOrdersCount } from "@/queries/orders.queries";

export const instant = false;

export default async function ProductsPage() {
  const businessId = await getBusinessId();
  const [products, resources, activeCount] = await Promise.all([
    getManagedProducts(businessId),
    getManagedResources(businessId),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);

  return (
    <DashboardShell activeCount={activeCount}>
      <ProductManagementView
        products={products}
        materials={resources.materials.map(({ id, name, unit }) => ({ id, name, unit }))}
      />
    </DashboardShell>
  );
}
