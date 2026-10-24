import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getOrderById } from "@/queries/orders.queries";
import { FeasibilityCard } from "@/components/feasibility/FeasibilityCard";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { formatDate } from "@/lib/utils";
import type { CapacityEngineResult } from "@/types";
import { DashboardShell } from "@/components/layout/DashboardShell";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

const DEMO_ORDER_DETAILS: Record<string, any> = {
  "bc-1024": {
    id: "BC-1024",
    customerName: "PT Nusantara Sentosa",
    clientType: "Corporate B2B • Jakarta",
    poNumber: "PO-2026-881",
    status: "CONFIRMED",
    createdAt: new Date("2026-10-16T09:00:00Z"),
    requiredDeliveryDate: new Date("2026-10-24T17:00:00Z"),
    notes: "Prioritas pengiriman hampers seremonial kantor. Harap packing rapi dengan pita gold.",
    items: [
      {
        quantity: 300,
        product: {
          name: "Custom Gift Boxes (4 SKU Set)",
          description: "Paket hampers exclusive: 3 jar cookies, 1 greeting card, box hardboard laminasi satin.",
          workerHoursPerUnit: 1.5,
          machineHoursPerUnit: 0.8,
          materials: [
            { id: "m1", quantityPerUnit: 1, material: { name: "Hardbox Rigid Satin", unit: "box", currentStock: 250 } },
            { id: "m2", quantityPerUnit: 2, material: { name: "Pita Satin Emas", unit: "meter", currentStock: 600 } },
            { id: "m3", quantityPerUnit: 3, material: { name: "Jar Kaca 350ml", unit: "pcs", currentStock: 800 } },
          ],
        },
      },
    ],
    analysis: {
      status: "AT_RISK",
      availableWorkDays: 6,
      estimatedProductionDays: 7,
      bufferDays: -1,
      workerAnalysis: {
        totalAvailableHours: 192,
        committedHours: 80,
        requiredHours: 450,
        freeHours: 112,
        gap: -338,
        utilizationPercent: 93,
      },
      machineAnalysis: {
        totalAvailableHours: 144,
        committedHours: 40,
        requiredHours: 240,
        freeHours: 104,
        gap: -136,
        utilizationPercent: 88,
      },
      materialAnalysis: [
        {
          materialId: "Hardbox Rigid Satin",
          unit: "box",
          requiredQuantity: 300,
          currentStock: 250,
          committedQuantity: 50,
          effectiveAvailable: 200,
          gap: -100,
        },
        {
          materialId: "Pita Satin Emas",
          unit: "meter",
          requiredQuantity: 600,
          currentStock: 600,
          committedQuantity: 100,
          effectiveAvailable: 500,
          gap: -100,
        },
        {
          materialId: "Jar Kaca 350ml",
          unit: "pcs",
          requiredQuantity: 900,
          currentStock: 1200,
          committedQuantity: 200,
          effectiveAvailable: 1000,
          gap: 100,
        },
      ],
      bottlenecks: [
        {
          resourceType: "WORKER",
          description: "Stasiun Perakitan Box & Packaging mengalami defisit 8 jam kerja operator.",
          severity: "WARNING",
        },
        {
          resourceType: "MATERIAL",
          description: "Defisit stok Hardbox Rigid Satin sebesar 100 box untuk memenuhi volume 300 unit.",
          severity: "CRITICAL",
        },
      ],
      reasoning: [
        "Jadwal kerja tersedia: 6 hari kerja (Senin–Jumat) sebelum deadline 24 Okt 2026.",
        "Kapasitas lini packaging terpakai 93% — melampaui batas toleransi aman UMKM (85%).",
        "Rekomendasi DSS: Tambah 1 shift lembur (+3 jam) atau ajukan pergeseran deadline 24 jam kepada klien.",
      ],
    },
  },
  "bc-1021": {
    id: "BC-1021",
    customerName: "Wedding Organizer Lestari",
    clientType: "Custom Project • Tangerang",
    poNumber: "PO-2026-878",
    status: "CANCELLED",
    createdAt: new Date("2026-10-18T10:00:00Z"),
    requiredDeliveryDate: new Date("2026-10-21T09:00:00Z"),
    notes: "Kue pernikahan bertingkat dengan ornamen fondant rumit. Butuh pengerjaan detail tinggi.",
    items: [
      {
        quantity: 1,
        product: {
          name: "Royal Tier Wedding Cake",
          description: "Kue 3-tier dengan fondant custom, butuh 28 jam kerja artisan spesialis.",
          workerHoursPerUnit: 28,
          machineHoursPerUnit: 14,
          materials: [
            { id: "m7", quantityPerUnit: 12, material: { name: "Rolled Fondant Premium", unit: "kg", currentStock: 4 } },
            { id: "m8", quantityPerUnit: 8, material: { name: "Specialty Buttercream", unit: "kg", currentStock: 3 } },
          ],
        },
      },
    ],
    analysis: {
      status: "NOT_FEASIBLE",
      availableWorkDays: 2,
      estimatedProductionDays: 5,
      bufferDays: -3,
      workerAnalysis: {
        totalAvailableHours: 32,
        committedHours: 24,
        requiredHours: 28,
        freeHours: 8,
        gap: -20,
        utilizationPercent: 162,
      },
      machineAnalysis: {
        totalAvailableHours: 24,
        committedHours: 16,
        requiredHours: 14,
        freeHours: 8,
        gap: -6,
        utilizationPercent: 125,
      },
      materialAnalysis: [
        {
          materialId: "Rolled Fondant Premium",
          unit: "kg",
          requiredQuantity: 12,
          currentStock: 4,
          committedQuantity: 2,
          effectiveAvailable: 2,
          gap: -10,
        },
        {
          materialId: "Specialty Buttercream",
          unit: "kg",
          requiredQuantity: 8,
          currentStock: 3,
          committedQuantity: 1,
          effectiveAvailable: 2,
          gap: -6,
        },
      ],
      bottlenecks: [
        {
          resourceType: "WORKER",
          description: "Defisit 20 jam kerja artisan spesialis. Waktu produksi butuh 5 hari kerja, sisa waktu hanya 2 hari kerja.",
          severity: "CRITICAL",
        },
        {
          resourceType: "MATERIAL",
          description: "Defisit stok Rolled Fondant Premium sebesar 10 kg untuk pembuatan ornamen.",
          severity: "CRITICAL",
        },
        {
          resourceType: "TIME",
          description: "Buffer waktu negatif (-3 hari). Batas waktu pengiriman 21 Okt 2026 mustahil dicapai.",
          severity: "CRITICAL",
        },
      ],
      reasoning: [
        "Jadwal kerja tersedia: 2 hari kerja sebelum batas waktu pengiriman.",
        "Kapasitas artisan terlampaui hingga 162% dari total jam kerja yang tersedia.",
        "Stok bahan baku utama mengalami defisit kritis (Fondant & Buttercream).",
        "Rekomendasi DSS: Tolak pesanan atau tawarkan tanggal kirim alternatif (minimal +5 hari kerja).",
      ],
    },
  },
  "bc-1023": {
    id: "BC-1023",
    customerName: "Ibu Ratna Catering",
    clientType: "Repeat Regular • Depok",
    poNumber: "PO-2026-880",
    status: "IN_PROGRESS",
    createdAt: new Date("2026-10-17T08:00:00Z"),
    requiredDeliveryDate: new Date("2026-10-23T12:00:00Z"),
    notes: "Pengiriman pagi langsung ke lokasi hajatan Depok Timur.",
    items: [
      {
        quantity: 120,
        product: {
          name: "Signature Fudgy Brownies Box",
          description: "Brownies panggang premium tabur almond & choco chips ukuran 20x20cm.",
          workerHoursPerUnit: 0.4,
          machineHoursPerUnit: 0.7,
          materials: [
            { id: "m4", quantityPerUnit: 0.25, material: { name: "Dark Cocoa Powder", unit: "kg", currentStock: 80 } },
            { id: "m5", quantityPerUnit: 0.2, material: { name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60 } },
            { id: "m6", quantityPerUnit: 1, material: { name: "Brownie Packaging Box", unit: "box", currentStock: 500 } },
          ],
        },
      },
    ],
    analysis: {
      status: "FEASIBLE",
      availableWorkDays: 5,
      estimatedProductionDays: 3,
      bufferDays: 2,
      workerAnalysis: {
        totalAvailableHours: 160,
        committedHours: 48,
        requiredHours: 48,
        freeHours: 112,
        gap: 64,
        utilizationPercent: 60,
      },
      machineAnalysis: {
        totalAvailableHours: 120,
        committedHours: 35,
        requiredHours: 84,
        freeHours: 85,
        gap: 1,
        utilizationPercent: 70,
      },
      materialAnalysis: [
        {
          materialId: "Dark Cocoa Powder",
          unit: "kg",
          requiredQuantity: 30,
          currentStock: 80,
          committedQuantity: 10,
          effectiveAvailable: 70,
          gap: 40,
        },
      ],
      bottlenecks: [],
      reasoning: [
        "Seluruh stasiun kerja (Mixer, Deck Oven #2, Stasiun Packaging) dalam kondisi aman.",
        "Buffer pengiriman tersedia +2 hari kerja sebelum batas waktu pengiriman.",
      ],
    },
  },
  "bc-1025": {
    id: "BC-1025",
    customerName: "Kopi Kenangan Senopati",
    clientType: "B2B Contract • Jakarta",
    poNumber: "PO-2026-882",
    status: "CONFIRMED",
    createdAt: new Date("2026-10-22T08:00:00Z"),
    requiredDeliveryDate: new Date("2026-10-29T17:00:00Z"),
    notes: "Pesanan batch perdana croissants butter dan brownies untuk display outlet.",
    items: [
      {
        quantity: 150,
        product: {
          name: "Signature Fudgy Brownies Box",
          description: "Brownies fudgy premium 20x20cm kemasan display cafe.",
          workerHoursPerUnit: 0.4,
          machineHoursPerUnit: 0.7,
          materials: [
            { id: "m4", quantityPerUnit: 0.25, material: { name: "Dark Cocoa Powder", unit: "kg", currentStock: 80 } },
            { id: "m5", quantityPerUnit: 0.2, material: { name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60 } },
            { id: "m6", quantityPerUnit: 1, material: { name: "Brownie Packaging Box", unit: "box", currentStock: 500 } },
          ],
        },
      },
    ],
    analysis: {
      status: "FEASIBLE",
      availableWorkDays: 7,
      estimatedProductionDays: 4,
      bufferDays: 3,
      workerAnalysis: {
        totalAvailableHours: 180,
        committedHours: 90,
        requiredHours: 60,
        freeHours: 90,
        gap: 30,
        utilizationPercent: 83,
      },
      machineAnalysis: {
        totalAvailableHours: 120,
        committedHours: 50,
        requiredHours: 42,
        freeHours: 70,
        gap: 28,
        utilizationPercent: 77,
      },
      materialAnalysis: [
        {
          materialId: "Dark Cocoa Powder",
          unit: "kg",
          requiredQuantity: 37.5,
          currentStock: 80,
          committedQuantity: 20,
          effectiveAvailable: 60,
          gap: 22.5,
        },
      ],
      bottlenecks: [],
      reasoning: [
        "Kapasitas staf dan oven berada dalam batas aman UMKM (<85%).",
        "Tersedia buffer waktu 3 hari kerja sebelum target kirim 29 Okt 2026.",
      ],
    },
  },
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const normalizedId = id.toLowerCase();
  let order: any = null;

  try {
    const businessId = await getBusinessId();
    if (businessId) {
      order = await getOrderById(id, businessId);
    }
  } catch (err) {
    // Fallback to rich demo details below
  }

  // Graceful fallback to demo dataset if order not found in DB
  if (!order) {
    order = DEMO_ORDER_DETAILS[normalizedId] || DEMO_ORDER_DETAILS["bc-1024"];
  }

  const item = order.items?.[0];
  const analysisResult: CapacityEngineResult = order.analysis || {
    status: "AT_RISK",
    availableWorkDays: 5,
    estimatedProductionDays: 5,
    bufferDays: 0,
    workerAnalysis: {
      totalAvailableHours: 160,
      committedHours: 80,
      requiredHours: 60,
      freeHours: 80,
      gap: 20,
      utilizationPercent: 88,
    },
    machineAnalysis: {
      totalAvailableHours: 120,
      committedHours: 60,
      requiredHours: 40,
      freeHours: 60,
      gap: 20,
      utilizationPercent: 83,
    },
    materialAnalysis: [],
    bottlenecks: [
      {
        resourceType: "WORKER",
        description: "Jam kerja lini finishing mendekati batas toleransi aman.",
        severity: "WARNING",
      },
    ],
    reasoning: ["Kapasitas terpakai 88% — disarankan memantau progres harian."],
  };

  const isAtRisk = analysisResult.status === "AT_RISK";
  const isNotFeasible = analysisResult.status === "NOT_FEASIBLE";
  const isFeasible = analysisResult.status === "FEASIBLE";

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/orders" className="hover:text-[#0F172A] transition-colors">
            Orders
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">Pesanan #{order.id}</span>
        </div>

        {/* Dramatic Order Header Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                  {order.customerName}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#1D4ED8] border border-blue-200">
                  {order.id}
                </span>
                {isFeasible && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    FEASIBLE (AMAN)
                  </span>
                )}
                {isAtRisk && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    AT RISK (BUTUH REVIEW)
                  </span>
                )}
                {isNotFeasible && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    NOT FEASIBLE (OVERCAPACITY)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#64748B]">
                PO: <strong className="text-[#0F172A] font-mono">{order.poNumber || "PO-2026-X"}</strong> &bull; Dibuat: {formatDate(order.createdAt)} &bull; Target Kirim:{" "}
                <strong className="text-[#0F172A]">{formatDate(order.requiredDeliveryDate)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/simulations?order=${order.id.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#bc4800] hover:bg-[#943700] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>Uji Solusi di Simulasi</span>
              </Link>
              <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
            </div>
          </div>

          {/* Quick DSS Diagnosis Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isAtRisk
                ? "bg-amber-500/10 border-amber-500/30 text-amber-950"
                : isNotFeasible
                ? "bg-rose-500/10 border-rose-500/30 text-rose-950"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[24px] text-amber-700 shrink-0 mt-0.5">
                {isFeasible ? "verified" : "warning"}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">
                  {isFeasible
                    ? "Status Kapasitas: Seluruh Sumber Daya Memadai"
                    : isAtRisk
                    ? "Peringatan DSS: Bottleneck Terdeteksi di Stasiun Packaging"
                    : "Peringatan DSS: Kapasitas Defisit — Pesanan Tidak Mampu Selesai Tepat Waktu"}
                </h4>
                <p className="text-xs text-[#64748B]">
                  {isFeasible
                    ? "Tenaga kerja, oven, dan material aman dengan buffer waktu pengiriman yang cukup."
                    : "Estimasi keterlambatan 1 hari jika tidak dilakukan tindakan penyesuaian jam kerja atau suplai bahan."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/80 border rounded-xl px-4 py-2 text-xs shrink-0">
              <div className="text-center">
                <span className="block font-mono font-bold text-sm text-[#0F172A]">
                  {analysisResult.availableWorkDays}d
                </span>
                <span className="text-[#64748B] text-[10px] uppercase">Tersedia</span>
              </div>
              <div className="w-px h-6 bg-[#e2e8f0]" />
              <div className="text-center">
                <span className="block font-mono font-bold text-sm text-[#0F172A]">
                  {analysisResult.estimatedProductionDays}d
                </span>
                <span className="text-[#64748B] text-[10px] uppercase">Estimasi</span>
              </div>
              <div className="w-px h-6 bg-[#e2e8f0]" />
              <div className="text-center">
                <span
                  className={`block font-mono font-bold text-sm ${
                    analysisResult.bufferDays < 0
                      ? "text-rose-600"
                      : analysisResult.bufferDays <= 1
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {analysisResult.bufferDays > 0 ? `+${analysisResult.bufferDays}d` : `${analysisResult.bufferDays}d`}
                </span>
                <span className="text-[#64748B] text-[10px] uppercase">Buffer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Line Items & Bill of Materials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Spesifikasi Produk &amp; Kebutuhan
                </h3>
                <span className="text-[11px] font-mono text-[#64748B]">BOM Breakdown</span>
              </div>

              {item ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-base">{item.product?.name}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {item.product?.description}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-bold px-2.5 py-1 rounded bg-[#1D4ED8] text-white">
                        {item.quantity} units
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#e2e8f0] text-xs grid grid-cols-2 gap-2 text-[#64748B]">
                      <div>
                        <span>Total Jam Kerja Operator:</span>
                        <strong className="block text-[#0F172A] font-mono text-sm mt-0.5">
                          {item.quantity * (item.product?.workerHoursPerUnit || 0)} jam
                        </strong>
                      </div>
                      <div>
                        <span>Total Jam Mesin / Oven:</span>
                        <strong className="block text-[#0F172A] font-mono text-sm mt-0.5">
                          {item.quantity * (item.product?.machineHoursPerUnit || 0)} jam
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Materials required */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Kebutuhan Bahan Baku (Bill of Materials)
                    </h5>
                    <div className="divide-y divide-[#e2e8f0] rounded-xl border border-[#e2e8f0] bg-white text-xs">
                      {(item.product?.materials || []).map((pm: any) => {
                        const requiredQty = item.quantity * pm.quantityPerUnit;
                        const isShortage = pm.material.currentStock < requiredQty;
                        return (
                          <div key={pm.id} className="p-3 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-[#0F172A]">{pm.material.name}</span>
                              <span className="block text-[11px] text-[#64748B]">
                                Butuh: {requiredQty} {pm.material.unit} &bull; Stok Gudang: {pm.material.currentStock} {pm.material.unit}
                              </span>
                            </div>
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                isShortage ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isShortage ? `Defisit -${requiredQty - pm.material.currentStock}` : "Aman"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">Tidak ada rincian item pesanan.</p>
              )}

              {order.notes && (
                <div className="pt-3 border-t border-[#e2e8f0] space-y-1">
                  <span className="text-xs font-semibold text-[#64748B]">Catatan Klien:</span>
                  <p className="text-xs italic text-[#0F172A] bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Full DSS Feasibility Report */}
          <div className="lg:col-span-7 space-y-6">
            <FeasibilityCard analysis={analysisResult} />

            {/* AI Decision Explainability & Recommendation Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Rekomendasi Tindakan DSS BizCapacity</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D4ED8]">Opsi 1: Tambah 1 Shift Lembur (+3 Jam)</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Kapasitas 82% (AMAN)
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Memberikan tambahan 12 jam kerja total pada stasiun packaging. Estimasi upah lembur Rp 360.000 (jauh di bawah margin profit pesanan 300 box).
                  </p>
                  <Link
                    href={`/simulations?order=${order.id.toLowerCase()}&solution=overtime`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1"
                  >
                    <span>Uji Opsi Lembur di Simulasi</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">Opsi 2: Rekrut 1 Tenaga Lepas Harian (Freelance)</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Kapasitas 78% (LELUASA)
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Menugaskan 1 pekerja harian khusus untuk melipat rigid box dan menempel pita. Tidak mengganggu operator reguler.
                  </p>
                  <Link
                    href={`/simulations?order=${order.id.toLowerCase()}&solution=workers`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 pt-1"
                  >
                    <span>Uji Opsi Pekerja Lepas di Simulasi</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">Opsi 3: Split Delivery (2 Termin Pengiriman)</span>
                    <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Zero Cost
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Kirim 150 box pada 24 Okt, dan sisa 150 box pada 26 Okt dengan konfirmasi persetujuan pihak pemesan.
                  </p>
                  <Link
                    href={`/simulations?order=${order.id.toLowerCase()}&solution=split`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F172A] hover:text-blue-700 pt-1"
                  >
                    <span>Uji Opsi Split Delivery di Simulasi</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
