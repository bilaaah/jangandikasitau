import Link from "next/link";
import type { Metadata } from "next";
import { getBusinessId } from "@/lib/context";
import { getOrderById, getActiveOrdersCount } from "@/queries/orders.queries";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { formatDate } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Detail Pesanan — BizCapacity",
  description: "Rincian status dan evaluasi kapasitas pesanan.",
};

export const instant = false;

type OrderDetailSearchParams = { created?: string };

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<OrderDetailSearchParams>;
}

type OrderDetails = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams: OrderDetailSearchParams = searchParams
    ? await searchParams.catch(() => ({} as OrderDetailSearchParams))
    : {};
  const isNewlyCreated = resolvedSearchParams?.created === "draft";
  const businessId = await getBusinessId();
  
  let order: OrderDetails | null = null;
  let activeCount = 0;
  try {
    [order, activeCount] = await Promise.all([
      getOrderById(id, businessId),
      getActiveOrdersCount(businessId),
    ]);
  } catch (err) {
    console.warn(`[OrderDetail] DB getOrderById failed for ${id}:`, err);
  }
  if (!order) {
    notFound();
  }

  const shortPoId = order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order.id;
  const item = order.items?.[0];
  const latestAnalysis = order.capacityAnalyses?.[0];
  const isAtRisk = latestAnalysis?.status === "AT_RISK";
  const isNotFeasible = latestAnalysis?.status === "NOT_FEASIBLE";
  const isFeasible = latestAnalysis?.status === "FEASIBLE";

  return (
    <DashboardShell activeCount={activeCount}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Toast Notifikasi Berhasil Simpan Draf */}
        {isNewlyCreated && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[22px] shrink-0">
                check_circle
              </span>
              <div>
                <strong className="text-sm font-bold block text-emerald-900 dark:text-emerald-100">
                  Pesanan berhasil disimpan sebagai draf!
                </strong>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Data spesifikasi pesanan telah tersimpan. Silakan tinjau rincian kapasitas di bawah sebelum memulai produksi.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 shrink-0">
              Draf Tersimpan
            </span>
          </div>
        )}

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Pesanan
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {order.customerName}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            (PO #{shortPoId})
          </span>
        </div>

        {/* Dramatic Order Header Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 break-words">
                  {order.customerName}
                </span>
                <span
                  title={`ID Lengkap: ${order.id}`}
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-help"
                >
                  PO #{shortPoId}
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
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Dibuat: {formatDate(order.createdAt)} &bull; Target Kirim:{" "}
                <strong className="text-slate-900 dark:text-slate-100">{formatDate(order.requiredDeliveryDate)}</strong>
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
          {latestAnalysis ? (
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
                <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">
                  {isFeasible ? "verified" : "warning"}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">
                    {isFeasible
                      ? "Status Kapasitas: Layak"
                      : isAtRisk
                        ? "Status Kapasitas: Perlu Ditinjau"
                        : "Status Kapasitas: Tidak Layak"}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Analisis tersimpan pada {formatDate(latestAnalysis.analyzedAt)}.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs w-full sm:w-auto shrink-0 shadow-xs">
                <div className="text-center">
                  <span className="block font-mono font-bold text-sm text-slate-900 dark:text-slate-50">
                    {latestAnalysis.availableWorkDays}d
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Tersedia</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span className="block font-mono font-bold text-sm text-slate-900 dark:text-slate-50">
                    {latestAnalysis.estimatedProductionDays}d
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Estimasi</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span
                    className={`block font-mono font-bold text-sm ${
                      latestAnalysis.bufferDays < 0
                        ? "text-rose-600"
                        : latestAnalysis.bufferDays <= 1
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {latestAnalysis.bufferDays > 0
                      ? `+${latestAnalysis.bufferDays}d`
                      : `${latestAnalysis.bufferDays}d`}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Buffer</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Belum ada hasil analisis kapasitas untuk pesanan ini.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Line Items & Bill of Materials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Spesifikasi Produk &amp; Kebutuhan
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">BOM Breakdown</span>
              </div>

              {item ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.product?.name}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {item.product?.description}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-bold px-2.5 py-1 rounded bg-[#1D4ED8] text-white">
                        {item.quantity} units
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-600 text-xs grid grid-cols-2 gap-2 text-slate-500 dark:text-slate-400">
                      <div>
                        <span>Total Jam Kerja Operator:</span>
                        <strong className="block text-slate-900 dark:text-slate-100 font-mono text-sm mt-0.5">
                          {item.quantity * (item.product?.workerHoursPerUnit || 0)} jam
                        </strong>
                      </div>
                      <div>
                        <span>Total Jam Mesin / Oven:</span>
                        <strong className="block text-slate-900 dark:text-slate-100 font-mono text-sm mt-0.5">
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
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                      {(item.product?.materials || []).map((pm) => {
                        const requiredQty = item.quantity * pm.quantityPerUnit;
                        const isShortage = pm.material.currentStock < requiredQty;
                        return (
                          <div key={pm.id} className="p-3 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{pm.material.name}</span>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
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
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-semibold text-[#64748B]">Catatan Klien:</span>
                  <p className="text-xs italic text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {latestAnalysis ? (
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Alasan Analisis Kapasitas</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {Array.isArray(latestAnalysis.reasoning) &&
                  latestAnalysis.reasoning.every((reason: unknown): reason is string => typeof reason === "string") ? (
                    latestAnalysis.reasoning.map((reason: string, index: number) => (
                      <li key={`${index}-${reason}`} className="flex gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{reason}</span>
                      </li>
                    ))
                  ) : (
                    <li>Rincian alasan analisis tidak tersedia.</li>
                  )}
                </ul>
                {latestAnalysis.bottlenecks?.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
                      Kendala yang terdeteksi
                    </h4>
                    {latestAnalysis.bottlenecks.map((bottleneck) => (
                      <p key={bottleneck.id} className="text-sm text-rose-700">
                        {bottleneck.description}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#e2e8f0] p-6 text-sm text-[#64748B] shadow-xs">
                Hasil analisis belum tersedia.
              </div>
            )}

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Rekomendasi Tindakan DSS BizCapacity</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D4ED8]">Opsi 1: Tambah 1 Shift Lembur (+3 Jam)</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Kapasitas 82% (AMAN)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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

                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Opsi 2: Rekrut 1 Tenaga Lepas Harian (Freelance)</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Kapasitas 78% (LELUASA)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Opsi 3: Split Delivery (2 Termin Pengiriman)</span>
                    <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Zero Cost
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
