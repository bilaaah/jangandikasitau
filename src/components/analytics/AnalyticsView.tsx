"use client";

import { useState } from "react";
import Link from "next/link";

export function AnalyticsView() {
  const [period, setPeriod] = useState<"7d" | "30d" | "q4">("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice("Laporan Kapasitas & Evaluasi Bottleneck (PDF) berhasil diunduh.");
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  // Mock data based on period
  const trendData = [
    { day: "Sen", label: "22 Okt", util: 72, orders: 4, safe: 85 },
    { day: "Sel", label: "23 Okt", util: 78, orders: 6, safe: 85 },
    { day: "Rab", label: "24 Okt", util: 92, orders: 8, safe: 85, alert: true },
    { day: "Kam", label: "25 Okt", util: 96, orders: 9, safe: 85, alert: true },
    { day: "Jum", label: "26 Okt", util: 84, orders: 5, safe: 85 },
    { day: "Sab", label: "27 Okt", util: 68, orders: 3, safe: 85 },
  ];

  const bottlenecks = [
    { name: "Packaging & Wrapping", pct: 42, color: "bg-rose-500", text: "text-rose-600", hours: "48.5 jam overload" },
    { name: "Oven Baking (Deck A & B)", pct: 31, color: "bg-amber-500", text: "text-amber-600", hours: "34.0 jam terpakai" },
    { name: "Assembly & Dekorasi Kue", pct: 17, color: "bg-purple-500", text: "text-purple-600", hours: "19.2 jam terpakai" },
    { name: "Dough Prep & Mixing", pct: 10, color: "bg-blue-500", text: "text-blue-600", hours: "11.0 jam terpakai" },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
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

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setPeriod("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "7d" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "30d" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setPeriod("q4")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "q4" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Q4 2026
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExporting ? "sync" : "download"}
            </span>
            <span>{isExporting ? "Mengunduh..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">On-Time Delivery (OTD)</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">99.4%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              +4.2% MoM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">178 dari 179 PO tiba sesuai jadwal janji.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Rata-rata Utilisasi Oven</span>
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">oven_gen</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-700 dark:text-blue-400">78.5%</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
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
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-700 dark:text-amber-400">Rp 8.4jt</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Hemat
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Efisiensi penjadwalan via DSS sebelum deal.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Order Feasibility Rate</span>
            <span className="material-symbols-outlined text-[20px] text-purple-600">fact_check</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-purple-700 dark:text-purple-400">86.2%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Langsung Layak</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">13.8% diselamatkan lewat simulasi solusi.</p>
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
                Sen - Sab
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
                      <div key={d.day} className="flex flex-col items-center h-full justify-end group">
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
                        <span className="hidden xs:block text-[10px] text-slate-400 dark:text-slate-500">{d.orders} PO</span>
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
                Stasiun dengan frekuensi kelebihan kapasitas tertinggi dalam 30 hari.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {bottlenecks.map((b) => (
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
              Stasiun Packaging menyumbang 42% bottleneck akibat pita & packaging hampers manual.
              Menggunakan 1 operator freelance tambahan khusus hari Kamis-Jumat berpotensi menaikkan
              throughput sebesar <strong className="text-slate-900 dark:text-slate-100">35%</strong> dengan estimasi penambahan omzet <strong className="text-slate-900 dark:text-slate-100">Rp 14.200.000/bulan</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Root Cause & Corrective Actions Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
              Riwayat Penanganan Kapasitas &amp; Keputusan Tindakan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bagaimana sistem mendeteksi kendala dan solusi apa yang diambil pemilik UMKM.
            </p>
          </div>
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-200 dark:border-blue-800">
            100% Keputusan Terdokumentasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="p-3">Order ID &amp; Klien</th>
                <th className="p-3">Gejala Awal</th>
                <th className="p-3">Bottleneck Terdeteksi</th>
                <th className="p-3">Tindakan Diambil (Simulasi)</th>
                <th className="p-3 text-right">Hasil Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                  BC-1024 • PT Nusantara Sentosa
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Lead time 48 jam untuk 300 unit</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800">
                    Packaging Overload (95%)
                  </span>
                </td>
                <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                  +1 Shift Lembur Packaging &amp; Negosiasi +1 Hari
                </td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    Tepat Waktu (OTD 100%)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                  BC-1019 • Hotel Grand Sahid
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400">800 Croissants sarapan pagi</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
                    Oven Deck Maxed (92%)
                  </span>
                </td>
                <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                  Baking batch 1 dipercepat ke shift malam (20:00)
                </td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    Tepat Waktu (OTD 100%)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                  BC-1015 • Bank Mandiri Syariah
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400">150 Box Brownies Almond</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                    Bahan Baku Kacang Almond Kurang 12kg
                  </span>
                </td>
                <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                  PO Cepat ke Supplier Mitra Sukabumi (Express)
                </td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    Tepat Waktu (OTD 100%)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
