"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AnalyticsMetrics } from "@/queries/analytics.queries";

interface AnalyticsViewProps {
  initialData?: AnalyticsMetrics;
}

const DEFAULT_METRICS: AnalyticsMetrics = {
  totalAnalysesCount: 18,
  feasibilityRatePercent: 86.2,
  onTimeDeliveryPercent: 99.4,
  overtimeSavingsRupiah: "Rp 8.4jt",
  ovenUtilizationPercent: 78.5,
  bottlenecksBreakdown: [
    { name: "Packaging & Perakitan Hampers", pct: 42, color: "bg-rose-500", text: "text-rose-600", hours: "48.5 jam overload" },
    { name: "Oven Baking & Mesin Utama", pct: 31, color: "bg-amber-500", text: "text-amber-600", hours: "34.0 jam terpakai" },
    { name: "Dekorasi & Finishing Kue", pct: 17, color: "bg-purple-500", text: "text-purple-600", hours: "19.2 jam terpakai" },
    { name: "Mixing & Persiapan Adonan", pct: 10, color: "bg-blue-500", text: "text-blue-600", hours: "11.0 jam terpakai" },
  ],
  recentAnalyses: [],
};

export function AnalyticsView({ initialData = DEFAULT_METRICS }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "q4">("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setExportNotice("Membuka dialog cetak laporan / Simpan sebagai PDF...");
    setTimeout(() => {
      setIsExporting(false);
      window.print();
      setTimeout(() => setExportNotice(null), 3000);
    }, 600);
  };

  // Dinamis generate 6 hari terakhir dari hari ini
  const trendData = useMemo(() => {
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const baseUtils = period === "7d"
      ? [68, 74, 88, 92, 80, 65]
      : period === "30d"
        ? [72, 78, 92, 96, 84, 68]
        : [75, 82, 89, 94, 86, 70];

    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const util = baseUtils[5 - i] ?? 75;

      result.push({
        day: dayName,
        label: dateLabel,
        util,
        orders: Math.round(util / 12),
        safe: 85,
        alert: util > 85,
      });
    }
    return result;
  }, [period]);

  const metrics = initialData;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 print:hidden">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Laporan Utilisasi &amp; Efisiensi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            Analytics &amp; Kapasitas Historis
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Evaluasi akurasi janji pengiriman (On-Time Delivery), rasio utilisasi mesin, dan margin operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          {/* Period selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setPeriod("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "7d" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriod("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "30d" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              30 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriod("q4")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "q4" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Kuartal Ini
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExporting ? "sync" : "download"}
            </span>
            <span>{isExporting ? "Menyiapkan..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">On-Time Delivery (OTD)</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              {metrics.onTimeDeliveryPercent}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Pesanan tiba sesuai jadwal janji pengiriman.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Rata-rata Utilisasi Mesin</span>
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">precision_manufacturing</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-700 dark:text-blue-400 whitespace-nowrap">
              {metrics.ovenUtilizationPercent}%
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Batas aman 70% - 85% untuk cegah breakdown.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Penghematan Biaya Lembur</span>
            <span className="material-symbols-outlined text-[20px] text-amber-600">savings</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 dark:text-amber-400 whitespace-nowrap">
              {metrics.overtimeSavingsRupiah}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
              Hemat
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Efisiensi penjadwalan via DSS sebelum komitmen.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Order Feasibility Rate</span>
            <span className="material-symbols-outlined text-[20px] text-purple-600">fact_check</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-700 dark:text-purple-400 whitespace-nowrap">
              {metrics.feasibilityRatePercent}%
            </span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 shrink-0">
              Langsung Layak
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.totalAnalysesCount} pesanan dianalisis engine kapasitas.
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Utilization Trend */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
                  Tren Beban Kapasitas Harian (Shop-Floor Load)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visualisasi beban produksi aktual vs batas aman ambang batas (85%).
                </p>
              </div>
              <span className="text-xs bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-slate-500 dark:text-slate-400">
                {period === "7d" ? "7 Hari Terakhir" : period === "30d" ? "30 Hari Terakhir" : "Kuartal Ini"}
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-6 space-y-4">
              <div className="relative pt-6">
                {/* 85% Safe line indicator */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-rose-300 dark:border-rose-500 z-10 flex items-center justify-end"
                  style={{ top: "15%" }}
                >
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-700 -mt-3 mr-2">
                    Batas Kritis: 85%
                  </span>
                </div>

                {/* Bars */}
                <div className="grid grid-cols-6 gap-1 sm:gap-3 md:gap-6 items-end h-48 border-b border-slate-200 dark:border-slate-700 pb-2">
                  {trendData.map((d) => {
                    const isOver = d.util > d.safe;
                    return (
                      <div key={d.label} className="flex flex-col items-center h-full justify-end group">
                        <span className="hidden sm:block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:scale-110 transition-transform">
                          {d.util}%
                        </span>
                        <div className="w-full max-w-[48px] bg-blue-50 dark:bg-slate-700 rounded-t-xl overflow-hidden h-full flex items-end">
                          <div
                            style={{ height: `${d.util}%` }}
                            className={`w-full rounded-t-xl transition-all duration-500 ${
                              isOver
                                ? "bg-gradient-to-t from-rose-500 to-rose-400"
                                : "bg-gradient-to-t from-blue-600 to-blue-400"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">{d.day}</span>
                        <span className="hidden xs:block text-[9px] text-slate-400 dark:text-slate-500">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>Zona Normal (&lt;85%)</span>
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block ml-3" />
              <span>Zona Kritis Overcapacity (&ge;85%)</span>
            </div>
            <Link href="/simulations" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Buka What-If Sandbox →
            </Link>
          </div>
        </div>

        {/* Bottleneck Distribution by Station */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
                Distribusi Hambatan (Bottleneck Workstations)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stasiun dengan frekuensi batasan kapasitas tertinggi dari analisis historis.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {metrics.bottlenecksBreakdown.map((b) => (
                <div key={b.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{b.hours}</span>
                      <span className={`font-mono font-extrabold ${b.text}`}>{b.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strategic Insight Box */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 dark:text-blue-400">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              <span>Rekomendasi Kapasitas Strategis (DSS Advisor)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Stasiun dengan bottleneck tertinggi adalah bagian perakitan &amp; packing.
              Menggunakan opsi lembur terarah atau pekerja harian lepas saat periode puncak dapat
              menghindarkan penolakan pesanan bernilai tinggi.
            </p>
          </div>
        </div>
      </div>

      {/* Root Cause & Corrective Actions Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
              Riwayat Evaluasi Kapasitas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dokumentasi deteksi kendala kapasitas dan status kelayakan pesanan.
            </p>
          </div>
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-200 dark:border-blue-800">
            Sistem Terintegrasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="p-3">Order ID &amp; Pelanggan</th>
                <th className="p-3">Tanggal Analisis</th>
                <th className="p-3">Utilisasi Pekerja</th>
                <th className="p-3">Utilisasi Mesin</th>
                <th className="p-3">Buffer Hari</th>
                <th className="p-3 text-right">Status Kelayakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {metrics.recentAnalyses.length > 0 ? (
                metrics.recentAnalyses.map((a) => (
                  <tr key={a.orderId} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                      {a.orderId} • {a.customerName}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{a.dateText}</td>
                    <td className="p-3 font-mono">{a.workerUtil}%</td>
                    <td className="p-3 font-mono">{a.machineUtil}%</td>
                    <td className="p-3 font-mono">{a.bufferDays} hari</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                          a.status === "FEASIBLE"
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : a.status === "AT_RISK"
                              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-slate-400">
                    Belum ada riwayat analisis kapasitas. Buat pesanan baru untuk melihat data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
