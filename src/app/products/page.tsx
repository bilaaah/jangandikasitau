import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProductManagementView } from "@/components/products/ProductManagementView";
import { getBusinessId } from "@/lib/context";
import { getManagedProducts, getManagedResources } from "@/queries/resources.queries";

export default async function ProductsPage() {
  const businessId = await getBusinessId();
  const [products, resources] = await Promise.all([
    getManagedProducts(businessId),
    getManagedResources(businessId),
  ]);

  return (
    <DashboardShell>
      <ProductManagementView
        products={products}
        materials={resources.materials.map(({ id, name, unit }) => ({ id, name, unit }))}
      />
    </DashboardShell>
  );
}
