// src/app/orders/new/page.tsx
//
// Page for analyzing and creating a new customer order.

import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getProducts } from "@/queries/resources.queries";
import { NewOrderForm } from "./NewOrderForm";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const instant = false;

export default async function NewOrderPage() {
  const businessId = await getBusinessId();
  const products = await getProducts(businessId);

  return (
    <DashboardShell>
      <div className="container max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link href="/orders" className="hover:text-[#F1F5F9] transition-colors">
            Pesanan
          </Link>
          <span>/</span>
          <span className="text-[#F1F5F9] font-semibold">Evaluasi Pesanan Baru</span>
        </div>

        <div className="pb-4 border-b border-white/[0.08]">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
            Evaluasi Pesanan Baru &amp; Cek Kapasitas
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Simulasikan kelayakan beban kerja secara real-time, periksa kekurangan bahan baku, dan hitung delivery buffer sebelum menerima PO pelanggan.
          </p>
        </div>

        <NewOrderForm products={products} />
      </div>
    </DashboardShell>
  );
}
