// src/app/orders/new/page.tsx
//
// Page for analyzing and creating a new customer order.

import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getProducts } from "@/queries/resources.queries";
import { getActiveOrdersCount } from "@/queries/orders.queries";
import { NewOrderForm } from "./NewOrderForm";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const instant = false;

export default async function NewOrderPage() {
  const businessId = await getBusinessId();
  const [products, activeCount] = await Promise.all([
    getProducts(businessId),
    getActiveOrdersCount(businessId).catch(() => 0),
  ]);

  return (
    <DashboardShell activeCount={activeCount}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
          <Link href="/orders" className="hover:text-blue-600 dark:hover:text-[#F1F5F9] transition-colors">
            Pesanan
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-[#F1F5F9] font-semibold">Evaluasi Pesanan Baru</span>
        </div>

        <div className="pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9]">
            Evaluasi Pesanan Baru &amp; Cek Kapasitas
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#94A3B8]">
            Simulasikan kelayakan beban kerja secara real-time, periksa kekurangan bahan baku, dan hitung delivery buffer sebelum menerima PO pelanggan.
          </p>
        </div>

        <NewOrderForm products={products} />
      </div>
    </DashboardShell>
  );
}
