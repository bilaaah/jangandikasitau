// src/app/orders/new/page.tsx
//
// Page for analyzing and creating a new customer order.

import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getProducts } from "@/queries/resources.queries";
import { NewOrderForm } from "./NewOrderForm";
import { DashboardShell } from "@/components/layout/DashboardShell";

const DEMO_PRODUCTS = [
  {
    id: "prod-hampers-lebaran",
    name: "Custom Gift Boxes Lebaran (4 SKU Set)",
    workerHoursPerUnit: 1.5,
    machineHoursPerUnit: 0.8,
    materials: [
      { quantityPerUnit: 1, material: { name: "Hardbox Rigid Satin", unit: "box", currentStock: 250 } },
      { quantityPerUnit: 2, material: { name: "Pita Satin Emas", unit: "meter", currentStock: 600 } },
      { quantityPerUnit: 3, material: { name: "Jar Kaca 350ml", unit: "pcs", currentStock: 800 } },
    ],
  },
  {
    id: "prod-brownies-box",
    name: "Signature Fudgy Brownies Box (120 Box Batch)",
    workerHoursPerUnit: 0.4,
    machineHoursPerUnit: 0.7,
    materials: [
      { quantityPerUnit: 0.25, material: { name: "Dark Cocoa Powder", unit: "kg", currentStock: 80 } },
      { quantityPerUnit: 0.2, material: { name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60 } },
      { quantityPerUnit: 1, material: { name: "Brownie Packaging Box", unit: "box", currentStock: 500 } },
    ],
  },
  {
    id: "prod-sourdough-loaf",
    name: "Artisan Sourdough Loaf (Batch Harian)",
    workerHoursPerUnit: 0.6,
    machineHoursPerUnit: 1.2,
    materials: [
      { quantityPerUnit: 0.6, material: { name: "Premium Bread Flour", unit: "kg", currentStock: 120 } },
      { quantityPerUnit: 0.15, material: { name: "Wild Yeast Starter", unit: "kg", currentStock: 30 } },
    ],
  },
];

export default async function NewOrderPage() {
  let products: any[] = [];

  try {
    const businessId = await getBusinessId();
    if (businessId) {
      products = await getProducts(businessId);
    }
  } catch (err: any) {
    // Graceful fallback to rich demo catalog for DSS preview
    products = DEMO_PRODUCTS;
  }

  if (products.length === 0) {
    products = DEMO_PRODUCTS;
  }

  return (
    <DashboardShell>
      <div className="container max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-xs text-[#525e7d]">
          <Link href="/orders" className="hover:text-[#0b1c30] transition-colors">
            Pesanan
          </Link>
          <span>/</span>
          <span className="text-[#0b1c30] font-semibold">Evaluasi Pesanan Baru</span>
        </div>

        <div className="pb-4 border-b border-[#e5eeff]">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]">
            Evaluasi Pesanan Baru &amp; Cek Kapasitas
          </h1>
          <p className="mt-1 text-sm text-[#525e7d]">
            Simulasikan kelayakan beban kerja secara real-time, periksa kekurangan bahan baku, dan hitung delivery buffer sebelum menerima PO pelanggan.
          </p>
        </div>

        <NewOrderForm products={products} />
      </div>
    </DashboardShell>
  );
}
