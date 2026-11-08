"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { DashboardMetrics } from "@/queries/dashboard.queries";

interface DashboardViewProps {
  metrics: DashboardMetrics;
}

export function DashboardView({ metrics }: DashboardViewProps) {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("Selamat datang");
  const [currentDate, setCurrentDate] = useState("");
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 11
        ? "Selamat pagi"
        : hour < 15
          ? "Selamat siang"
          : "Selamat sore",
    );
    setCurrentDate(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    setOwnerName(session?.user?.name ?? "");
  }, [session?.user?.name]);

  const isStaff = session?.user?.role === "MEMBER" || session?.user?.role === "STAFF";

  const firstAttentionOrder = metrics.activeOrders.find(
    (o) => o.capacityStatus === "AT_RISK" || o.capacityStatus === "NOT_FEASIBLE",
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* ── Salam & Status Hari Ini ─── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {isStaff ? "Akses Staf — Pemantauan Jadwal & Kapasitas Dapur" : "Sistem aktif — data sinkron dengan database"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9]">
            {greeting}, {ownerName || (isStaff ? "Tim Produksi" : "Bilah")}! 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-[#94A3B8] max-w-xl">
            {isStaff ? (
              metrics.attentionOrdersCount > 0 ? (
                <>
                  Terdapat{" "}
                  <strong className="text-slate-900 dark:text-[#F1F5F9]">
                    {metrics.attentionOrdersCount} pesanan dengan beban kapasitas tinggi
                  </strong>{" "}
                  yang perlu diperhatikan di stasiun kerja hari ini.
                </>
              ) : (
                "Seluruh lini produksi berjalan sesuai jadwal. Cek alokasi bahan dan stasiun di bawah."
              )
            ) : metrics.attentionOrdersCount > 0 ? (
              <>
                Ada{" "}
                <strong className="text-slate-900 dark:text-[#F1F5F9]">
                  {metrics.attentionOrdersCount} pesanan yang butuh perhatianmu
                </strong>{" "}
                — cek rekomendasi di bawah ya.
              </>
            ) : (
              "Semua pesanan berjalan sesuai jadwal kapasitas. Usahamu dalam kondisi prima."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-xs font-medium text-slate-600 dark:text-[#94A3B8] bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] px-3.5 py-2 rounded-xl shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-[#94A3B8]">
            calendar_today
          </span>
          <span>{currentDate || "Hari ini"}</span>
        </div>
      </div>

      {/* ── Panduan Singkat (untuk user baru) ─── */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-500/[0.10] border border-blue-200/80 dark:border-blue-500/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-up stagger-1 hover-lift-sm">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">lightbulb</span>
          </span>
          <div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
              Sistem Kapasitas {metrics.businessName}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              Kelola pesanan, evaluasi kapasitas, dan optimalkan jadwal produksi
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {[
            { step: "1", label: "Kelola Staf & Bahan", href: "/resources", icon: "group" },
            { step: "2", label: "Evaluasi Pesanan", href: "/orders/new", icon: "receipt_long" },
            { step: "3", label: "Simulasi What-If", href: "/simulations", icon: "auto_awesome" },
          ].map((s) => (
            <Link
              key={s.step}
              href={s.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-blue-200/80 dark:border-blue-500/20 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-500/[0.15] transition-all shadow-xs"
            >
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                {s.step}
              </span>
              <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-500">
                {s.icon}
              </span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── 4 Kartu Status Utama ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
            Status Produksi &amp; Kapasitas
          </h2>
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Dihitung otomatis dari komitmen database
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kartu 1: Kapasitas Terpakai */}
          <Link
            href="/production-planning"
            title="Buka Jadwal & Beban Produksi"
            className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between hover-lift hover:border-blue-500/40 transition-all group animate-slide-up stagger-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Kapasitas Terpakai
              </span>
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono">
                  {metrics.overallUtilizationPercent}%
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    metrics.overallUtilizationPercent >= 85
                      ? "bg-rose-50 dark:bg-rose-500/[0.10] text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                      : metrics.overallUtilizationPercent >= 70
                        ? "bg-amber-50 dark:bg-amber-500/[0.10] text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                        : "bg-emerald-50 dark:bg-emerald-500/[0.10] text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                  }`}
                >
                  {metrics.overallUtilizationPercent >= 85
                    ? "🔴 Mendekati Batas"
                    : metrics.overallUtilizationPercent >= 70
                      ? "⚠️ Perlu Perhatian"
                      : "✅ Kapasitas Aman"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1.5">
                {metrics.overallUtilizationPercent >= 85
                  ? "Beban mendekati batas, pertimbangkan lembur untuk order baru."
                  : metrics.overallUtilizationPercent > 0
                    ? "Alokasi produksi terdistribusi stabil di minggu ini."
                    : "Belum ada pesanan yang mengunci kapasitas."}
              </p>
              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Buka Rencana Produksi</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Kartu 2: Jam Kerja Staf */}
          <Link
            href="/resources"
            title="Buka Data Staf & Jam Kerja"
            className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between hover-lift hover:border-blue-500/40 transition-all group animate-slide-up stagger-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Jam Kerja Staf
              </span>
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono">
                  {metrics.workerHoursCommitted}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  dari {metrics.workerHoursTotalAvailable} jam/minggu
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full animate-bar-fill"
                  style={{ width: `${Math.min(100, metrics.workerUtilizationPercent)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
                Utilisasi {metrics.workerUtilizationPercent}% • Sisa{" "}
                {Math.max(0, Math.round(metrics.workerHoursTotalAvailable - metrics.workerHoursCommitted))}{" "}
                jam bebas.
              </p>
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Kelola Tim Staf</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Kartu 3: Penggunaan Mesin & Oven */}
          <Link
            href="/resources"
            title="Buka Data Mesin & Peralatan"
            className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between hover-lift hover:border-blue-500/40 transition-all group animate-slide-up stagger-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Penggunaan Mesin
              </span>
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] font-mono">
                  {metrics.machineHoursCommitted}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  dari {metrics.machineHoursTotalAvailable} jam/minggu
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, metrics.machineUtilizationPercent)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
                Utilisasi {metrics.machineUtilizationPercent}% • Masin siap untuk batch berikutnya.
              </p>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Cek Mesin &amp; Alat</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Kartu 4: Status Perhatian / Bottleneck */}
          <Link
            href={
              firstAttentionOrder
                ? `/simulations?order=${firstAttentionOrder.id.toLowerCase()}`
                : "/orders"
            }
            title="Buka Evaluasi untuk Cari Solusi"
            className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xs flex flex-col justify-between hover-lift transition-all group animate-slide-up stagger-4 ${
              metrics.attentionOrdersCount > 0
                ? "bg-rose-50/80 dark:bg-rose-500/[0.08] border-rose-200 dark:border-rose-500/20 hover:border-rose-400"
                : "bg-emerald-50/80 dark:bg-emerald-500/[0.08] border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  metrics.attentionOrdersCount > 0
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {metrics.attentionOrdersCount > 0 ? "🔴 Butuh Review" : "✅ Status Lancar"}
              </span>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                  metrics.attentionOrdersCount > 0
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {metrics.attentionOrdersCount > 0 ? "warning" : "check_circle"}
                </span>
              </span>
            </div>
            <div className="mt-3">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  metrics.attentionOrdersCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {metrics.attentionOrdersCount > 0
                  ? `${metrics.attentionOrdersCount} Pesanan`
                  : `${metrics.activeOrdersCount} Pesanan Aktif`}
              </span>
              <p
                className={`text-xs font-medium mt-1.5 ${
                  metrics.attentionOrdersCount > 0
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {metrics.attentionOrdersCount > 0
                  ? "Terdapat pesanan dengan status AT_RISK / NOT_FEASIBLE yang butuh simulasi."
                  : "Kapasitas saat ini mencukupi seluruh target tenggat pengiriman."}
              </p>
              <div
                className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${
                  metrics.attentionOrdersCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span>
                  {metrics.attentionOrdersCount > 0 ? "Uji Solusi di Simulator →" : "Kelola Pesanan →"}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Panel Tengah: Beban Stasiun + Rekomendasi ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Beban per Bagian */}
        <div className="lg:col-span-7 bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">
                Kapasitas Bagian Produksi
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Kondisi pemakaian jam kerja tenaga kerja dan mesin saat ini
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/[0.10] px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
              Shift Reguler Mon–Fri
            </span>
          </div>

          <div className="space-y-5">
            {metrics.stationsUtilization.map((st) => (
              <div key={st.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        st.percent >= 85
                          ? "bg-rose-500"
                          : st.percent >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                    <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{st.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.statusBadgeClass}`}>
                      {st.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{st.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${st.barColorClass} h-full rounded-full animate-bar-fill`}
                    style={{ width: `${Math.min(100, st.percent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  {st.detail} {st.note ? `• ${st.note}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Kanan: Rekomendasi DSS + Stok Bahan */}
        <div className="lg:col-span-5 space-y-5">
          {/* Rekomendasi Sistem */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4 border border-slate-700 hover-lift animate-slide-up stagger-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-300 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Rekomendasi Sistem DSS</span>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                {metrics.attentionOrdersCount > 0
                  ? `⚠️ ${metrics.attentionOrdersCount} Pesanan Perlu Solusi`
                  : "✅ Kondisi Optimal"}
              </span>
            </div>

            <h4 className="text-base font-bold text-white">
              {firstAttentionOrder
                ? `Pesanan ${firstAttentionOrder.customerName} butuh tindakan`
                : "Semua pesanan memiliki kapasitas memadai"}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {firstAttentionOrder
                ? `${firstAttentionOrder.productName} (${firstAttentionOrder.quantity} unit): ${firstAttentionOrder.statusNote}. Uji penambahan jam lembur atau pekerja lepas di simulator.`
                : `Saat ini ada ${metrics.activeOrdersCount} pesanan aktif dalam sistem. Jadwal produksi siap dijalankan tanpa kendala waktu.`}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {firstAttentionOrder ? (
                <>
                  <Link
                    href={`/simulations?order=${firstAttentionOrder.id.toLowerCase()}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-center text-xs font-bold transition-all shadow-sm text-white"
                  >
                    Coba Simulasi Solusinya &rarr;
                  </Link>
                  <Link
                    href={`/orders/${firstAttentionOrder.id}`}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold transition-all text-slate-200"
                  >
                    Detail Pesanan
                  </Link>
                </>
              ) : (
                <Link
                  href="/orders/new"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-center text-xs font-bold transition-all shadow-sm text-white"
                >
                  + Masukkan Pesanan Baru
                </Link>
              )}
            </div>
          </div>

          {/* Widget Stok Bahan */}
          <div className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">
                    Monitoring Bahan Baku
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Kesiapan bahan baku untuk pesanan aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              {metrics.criticalMaterials.length > 0 ? (
                metrics.criticalMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-[#F1F5F9] block">
                        {mat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        Stok: {mat.currentStock} {mat.unit}{" "}
                        {mat.committedStock > 0 ? `• Terpakai: ${mat.committedStock} ${mat.unit}` : ""}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        mat.deficit < 0
                          ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/[0.08]"
                          : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.10]"
                      }`}
                    >
                      {mat.deficit < 0 ? `Kurang ${Math.abs(mat.deficit)} ${mat.unit}` : "Tersedia"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] py-2">
                  Belum ada data bahan baku terdaftar.
                </p>
              )}
            </div>

            <Link
              href="/resources"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-[#F1F5F9] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center pt-2"
            >
              <span>Kelola Stok &amp; Bahan Baku</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Daftar Pesanan yang Sedang Berjalan (dari DB) ─── */}
      <div className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">
              Pesanan Terkini
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Data real dari pesanan usaha Anda
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua ({metrics.totalOrdersCount} Pesanan)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {metrics.activeOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-white/[0.1] rounded-xl space-y-2">
            <span className="material-symbols-outlined text-[32px] text-slate-400">receipt_long</span>
            <p className="text-sm font-semibold">Belum ada pesanan aktif</p>
            <p className="text-xs">
              Buat pesanan pertama untuk mulai memonitor kapasitas dan jadwal produksi.
            </p>
            <Link
              href="/orders/new"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Buat Pesanan Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {metrics.activeOrders.map((order) => {
              const isAtRisk = order.capacityStatus === "AT_RISK";
              const isNotFeasible = order.capacityStatus === "NOT_FEASIBLE";
              const cardBg = isAtRisk
                ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/[0.06] hover:bg-amber-100/70"
                : isNotFeasible
                  ? "border-rose-200 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-500/[0.06] hover:bg-rose-100/70"
                  : "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-500/[0.06] hover:bg-emerald-100/70";

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  title={`Buka rincian pesanan ${order.orderNumber}`}
                  className={`p-4 rounded-xl border transition-all space-y-2 block group shadow-xs ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isAtRisk
                          ? "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/[0.15]"
                          : isNotFeasible
                            ? "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/[0.15]"
                            : "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/[0.15]"
                      }`}
                    >
                      {isAtRisk
                        ? "⚠️ Perlu Solusi"
                        : isNotFeasible
                          ? "🔴 Tidak Layak"
                          : "✅ Bisa Dikerjakan"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {order.orderNumber} &rarr;
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {order.customerName}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                    {order.quantity} unit • {order.productName}
                  </p>
                  <div className="text-[11px] font-medium pt-1 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between">
                    <span className="truncate pr-2">{order.statusNote}</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 underline opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Buka
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

