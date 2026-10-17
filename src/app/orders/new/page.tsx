// src/app/orders/new/page.tsx
//
// Page for analyzing and creating a new customer order.

import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getProducts } from "@/features/resources/queries";
import { NewOrderForm } from "./NewOrderForm";


export default async function NewOrderPage() {
  let products: any[] = [];
  let errorMsg: string | null = null;

  try {
    const businessId = await getBusinessId();
    products = await getProducts(businessId);
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/orders" className="hover:text-foreground transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">New Capacity Analysis</span>
      </div>

      <div className="pb-4 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Evaluate New Customer Order
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulate workload feasibility in real time, inspect material shortages, and calculate delivery buffers.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm">
          <span className="font-bold">Setup Error: </span> {errorMsg}
          <div className="mt-2 text-xs font-mono bg-background/50 p-2 rounded">
            Please run <code>npm run db:seed</code> and populate <code>DEV_BUSINESS_ID</code> in <code>.env.local</code>.
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border bg-card space-y-3">
          <h3 className="font-semibold text-lg">No Products Configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You need at least one product configured with labor, machine, and material rates to analyze capacity.
          </p>
          <div className="text-xs font-mono bg-muted p-2 rounded max-w-sm mx-auto">
            Run <code>npm run db:seed</code> to populate sample demo products.
          </div>
        </div>
      ) : (
        <NewOrderForm products={products} />
      )}
    </div>
  );
}
