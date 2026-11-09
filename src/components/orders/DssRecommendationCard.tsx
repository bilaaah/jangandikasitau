import React from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface DssRecommendationCardProps {
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  deliveryDate: Date;
  status: "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE";
  workerUtilizationPercent: number;
  machineUtilizationPercent: number;
  availableWorkDays: number;
  estimatedProductionDays: number;
  bufferDays: number;
  shortageMaterials?: { name: string; deficit: number; unit: string }[];
}

export function DssRecommendationCard({
  orderId,
  customerName,
  productName,
  quantity,
  deliveryDate,
  status,
  workerUtilizationPercent,
  machineUtilizationPercent,
  availableWorkDays,
  estimatedProductionDays,
  bufferDays,
  shortageMaterials = [],
}: DssRecommendationCardProps) {
  const shortOrderId = orderId.toLowerCase();

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          <span>Rekomendasi Tindakan DSS BizCapacity</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
          Skenario Dinamis
        </span>
      </div>

      <div className="space-y-3">
        {status === "FEASIBLE" && (
          <>
            {/* Opsi 1: Konfirmasi Pesanan */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Opsi 1: Konfirmasi Pesanan &amp; Kunci Kapasitas
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  Kapasitas Aman ({workerUtilizationPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kapasitas tenaga kerja ({workerUtilizationPercent}%) dan mesin ({machineUtilizationPercent}%) masih berada dalam batas aman untuk memproduksi {quantity} unit {productName}. Segera ubah status menjadi CONFIRMED agar slot kapasitas terkunci secara atomik dari pesanan baru.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  ✓ Buffer waktu: +{bufferDays} hari kerja
                </span>
              </div>
            </div>

            {/* Opsi 2: Integrasikan ke Jadwal Produksi */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  Opsi 2: Integrasikan ke Kalender Stasiun Produksi
                </span>
                <span className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                  Estimasi {estimatedProductionDays} Hari
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Estimasi pengerjaan memerlukan {estimatedProductionDays} hari kerja dari total {availableWorkDays} hari kerja yang tersedia sebelum {formatDate(deliveryDate)}. Pantau alokasi workstation untuk menghindari penumpukan dengan batch lain.
              </p>
              <Link
                href="/production-planning"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 pt-1 transition-colors"
              >
                <span>Buka Perencanaan Produksi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Opsi 3: Pengiriman Lebih Cepat */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Opsi 3: Opsi Pengiriman Lebih Awal (Early Dispatch)
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                  Buffer +{bufferDays} Hari
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dengan sisa buffer {bufferDays} hari kerja, Anda memiliki fleksibilitas untuk mempercepat pengiriman {productName} ke {customerName} jika produksi dimulai lebih awal.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 pt-1 transition-colors"
              >
                <span>Uji Jadwal di Simulator</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </>
        )}

        {status === "AT_RISK" && (
          <>
            {/* Opsi 1: Tambah Lembur */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Opsi 1: Tambah 1 Shift Lembur Terjadwal (+2 Jam/Hari)
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  Target Aman (&le;82%)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Utilisasi saat ini mencapai {workerUtilizationPercent}%. Menambah 2 jam lembur per hari untuk memproses {quantity} unit {productName} akan memperlebar buffer waktu penyelesaian ke zona aman tanpa perlu merekrut staf baru.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}&solution=overtime`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 pt-1 transition-colors"
              >
                <span>Uji Opsi Lembur di Simulasi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Opsi 2: Rekrut Pekerja Lepas */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Opsi 2: Rekrut 1 Tenaga Lepas Harian (Freelance)
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  Kapasitas Leluasa
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tugaskan 1 tenaga lepas harian khusus untuk menangani proses persiapan dan finishing {productName}. Ini menjaga jam operator inti tetap stabil dan mencegah keterlambatan pada pesanan lain.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}&solution=workers`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 pt-1 transition-colors"
              >
                <span>Uji Opsi Pekerja Lepas di Simulasi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Opsi 3: Split Delivery */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  Opsi 3: Split Delivery (Pengiriman Bertahap)
                </span>
                <span className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                  Bebas Biaya Lembur
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kirim gelombang pertama (50% atau {Math.ceil(quantity / 2)} unit) pada jadwal awal, dan sisa {Math.floor(quantity / 2)} unit beberapa hari kemudian dengan persetujuan {customerName}.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}&solution=split`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 pt-1 transition-colors"
              >
                <span>Uji Opsi Split Delivery di Simulasi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </>
        )}

        {status === "NOT_FEASIBLE" && (
          <>
            {/* Opsi 1: Defisit Bahan atau Waktu */}
            {shortageMaterials.length > 0 ? (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    Opsi 1: Pengadaan Cepat Bahan Baku Defisit
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
                    Defisit Stok
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Terdapat defisit bahan baku: {shortageMaterials.map((m) => `${m.name} (-${m.deficit} ${m.unit})`).join(", ")}. Segera lakukan restock ke supplier atau sesuaikan stok fisik di menu Bahan Baku.
                </p>
                <Link
                  href="/resources?tab=materials"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 pt-1 transition-colors"
                >
                  <span>Buka Kelola Stok Bahan</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    Opsi 1: Negosiasi Perpanjangan Tenggat
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
                    Defisit {Math.abs(bufferDays)} Hari
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Estimasi pengerjaan ({estimatedProductionDays} hari kerja) melampaui sisa waktu ({availableWorkDays} hari kerja). Tawarkan pengunduran tanggal kirim kepada {customerName} minimal {Math.abs(bufferDays) + 1} hari kerja ke depan.
                </p>
                <Link
                  href={`/simulations?order=${shortOrderId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 pt-1 transition-colors"
                >
                  <span>Uji Pergeseran Tenggat di Simulasi</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* Opsi 2: Subkontrak Sebagian */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Opsi 2: Subkontrak / Outsource Sebagian Kuantitas
                </span>
                <span className="text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                  Solusi Alternatif
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Alihkan 30%–50% pembuatan {productName} ke mitra rekanan terpercaya agar tenggat {formatDate(deliveryDate)} tetap terpenuhi dan pesanan dari {customerName} tidak hilang.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}&solution=outsource`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 pt-1 transition-colors"
              >
                <span>Uji Opsi Outsource di Simulasi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Opsi 3: Simulasi Kombinasi di What-If Simulator */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Opsi 3: Kombinasikan Solusi di Simulator DSS
                </span>
                <span className="text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                  Eksplorasi Solusi
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Gunakan tuas interaktif Simulator What-If untuk menguji kombinasi lembur, pekerja harian, dan geser tenggat guna menemukan titik impas yang paling menguntungkan.
              </p>
              <Link
                href={`/simulations?order=${shortOrderId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 pt-1 transition-colors"
              >
                <span>Buka Simulator What-If</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

