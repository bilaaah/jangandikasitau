"use client";

// src/app/simulations/page.tsx
//
// What-If Simulator — Modul B
// Uji berbagai skenario solusi (lembur, pekerja tambahan, perpanjangan deadline,
// outsource, split delivery) sebelum memutuskan pesanan.
//
// Catatan frontend: kalkulasi biaya menggunakan data demo sementara backend
// belum terhubung. Engine nyata akan diintegrasikan oleh tim backend.

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ── Demo order catalogue (akan diganti data dari API) ─────────────
const DEMO_ORDERS = [
  {
    id: "bc-1024",
    label: "BC-1024 • PT Nusantara Sentosa",
    desc: "300 Box Hampers",
    statusLabel: "⚠️ Perlu Solusi",
    baseUtilization: 93,
    baseStatus: "AT_RISK" as const,
    orderValue: 18_500_000,
    baseBottleneck: "Kurang 8 jam di stasiun packaging",
  },
  {
    id: "bc-1021",
    label: "BC-1021 • Wedding Organizer Cilandak",
    desc: "Tier Cake 3 Susun",
    statusLabel: "🔴 Tidak Sanggup",
    baseUtilization: 107,
    baseStatus: "NOT_FEASIBLE" as const,
    orderValue: 12_000_000,
    baseBottleneck: "Defisit 15 kg terigu & jam oven kurang 6.5 jam",
  },
] as const;

// ── Scenario slider config ────────────────────────────────────────
const OVERTIME_MAX   = 4;  // jam/hari, spec: +1 s/d +4
const WORKERS_MAX    = 3;  // orang
const DEADLINE_MAX   = 7;  // hari kerja, spec: +1 s/d +7
const SPLIT_TERMIN   = 2;  // jumlah termin default

function SimulationContent() {
  const searchParams = useSearchParams();
  const orderFromUrl   = searchParams.get("order")    || "bc-1024";
  const solutionFromUrl = searchParams.get("solution") || null;

  // ── Scenario state ───────────────────────────────────────────────
  const [selectedOrderId, setSelectedOrderId] = useState(orderFromUrl);
  const [overtimeHours,   setOvertimeHours]   = useState(() => {
    if (solutionFromUrl === "overtime") return 3;
    if (solutionFromUrl === "workers" || solutionFromUrl === "split") return 0;
    return 2;
  });
  const [extraWorkers,  setExtraWorkers]  = useState(() => {
    if (solutionFromUrl === "workers") return 1;
    return 0;
  });
  const [extendedDays,  setExtendedDays]  = useState(() => {
    if (solutionFromUrl === "split") return 3;
    return 0;
  });
  const [enableOutsource,     setEnableOutsource]     = useState(false);
  const [enableSplitDelivery, setEnableSplitDelivery] = useState(
    solutionFromUrl === "split",
  );

  // ── UI state ─────────────────────────────────────────────────────
  const [isApplying,     setIsApplying]     = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // ── Active order ─────────────────────────────────────────────────
  const order = DEMO_ORDERS.find((o) => o.id === selectedOrderId) ?? DEMO_ORDERS[0];

  // ── Dynamic simulation calculations ──────────────────────────────
  // Added capacity from each lever (jam total):
  //   Overtime:       overtimeHours * 4 pekerja * 3 hari window
  //   Extra workers:  extraWorkers * 8 jam/hari * 5 hari
  //   Extended days:  extendedDays * 16 jam/hari produksi
  //   Outsource:      membebaskan ~60 jam kapasitas internal
  //   Split delivery: memecah beban — efek buffer +20%
  const addedCapacityHours =
    overtimeHours * 12 +
    extraWorkers * 40 +
    extendedDays * 16 +
    (enableOutsource ? 60 : 0) +
    (enableSplitDelivery ? 24 : 0);

  const calculatedReduction = Math.min(50, Math.round(addedCapacityHours * 0.38));
  const newUtilization      = Math.max(50, order.baseUtilization - calculatedReduction);

  const newStatus: "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" =
    newUtilization > 100 ? "NOT_FEASIBLE"
    : newUtilization > 85 ? "AT_RISK"
    : "FEASIBLE";

  // ── Cost calculations (tarif demo — backend akan konfirmasi) ──────
  const overtimeCostPerHour = 30_000;
  const workerDailyRate     = 140_000;
  const outsourceCost       = 450_000;
  const splitDeliveryCost   = 200_000; // ongkir 2 kali pengiriman

  const totalCost =
    overtimeHours * 4 * 3 * overtimeCostPerHour +
    extraWorkers * 5 * workerDailyRate +
    (enableOutsource     ? outsourceCost    : 0) +
    (enableSplitDelivery ? splitDeliveryCost : 0);

  const netProtectedRevenue = order.orderValue - totalCost;
  const costRatio = ((totalCost / order.orderValue) * 100).toFixed(1);

  // ── Status color helpers ──────────────────────────────────────────
  const statusColor = {
    FEASIBLE:     { border: "border-emerald-300", bg: "bg-emerald-50/60",  text: "text-emerald-900", badge: "bg-emerald-200 text-emerald-900" },
    AT_RISK:      { border: "border-amber-300",   bg: "bg-amber-50/50",    text: "text-amber-900",   badge: "bg-amber-200   text-amber-900"   },
    NOT_FEASIBLE: { border: "border-rose-300",    bg: "bg-rose-50/50",     text: "text-rose-900",    badge: "bg-rose-200    text-rose-900"    },
  };
  const newColors  = statusColor[newStatus];
  const baseColors = statusColor[order.baseStatus];

  const statusLabel = {
    FEASIBLE:     "✅ Bisa Dikerjakan",
    AT_RISK:      "⚠️ Masih Perlu Perhatian",
    NOT_FEASIBLE: "🔴 Belum Sanggup",
  };

  function resetAll() {
    setOvertimeHours(0);
    setExtraWorkers(0);
    setExtendedDays(0);
    setEnableOutsource(false);
    setEnableSplitDelivery(false);
    setAppliedSuccess(false);
  }

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* ── Header Bar ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link href="/dashboard" className="hover:text-[#1D4ED8] transition-colors">Dasbor</Link>
              <span>/</span>
              <span className="text-[#0F172A] font-semibold">Simulasi Pesanan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] mt-1">
              Tes Pesanan Sebelum Bilang Iya
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Geser slider di bawah untuk coba berbagai solusi — sistem menghitung dampaknya sebelum kamu putuskan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-xs sm:text-sm font-semibold text-[#0F172A] hover:bg-[#f8fafc] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Kembali ke Pesanan</span>
            </Link>
            <Link
              href="/production-planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Jadwal Produksi</span>
            </Link>
          </div>
        </div>

        {/* ── 2-Column Layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Controls Column (5 cols) ─────────────────────────── */}
          <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Coba Berbagai Solusi</h3>
                <p className="text-xs text-[#64748B]">Geser slider untuk lihat dampaknya secara langsung</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200">
                ✨ Coba-coba Dulu
              </span>
            </div>

            {/* Order Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#1D4ED8]">receipt_long</span>
                Pilih pesanan yang ingin dicari solusinya:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => { setSelectedOrderId(e.target.value); resetAll(); }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-medium"
              >
                {DEMO_ORDERS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({o.desc} — {o.statusLabel})
                  </option>
                ))}
              </select>
              {/* Current bottleneck hint */}
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="material-symbols-outlined text-[15px] text-amber-600 flex-shrink-0 mt-0.5">warning</span>
                <span><strong>Bottleneck:</strong> {order.baseBottleneck}</span>
              </div>
            </div>

            {/* ── Slider: Overtime ─────────────────────────────── */}
            <SliderControl
              icon="more_time"
              label="Jam Lembur Staf"
              sublabel="per hari kerja"
              value={overtimeHours}
              min={0}
              max={OVERTIME_MAX}
              step={1}
              unit="Jam/Hari"
              prefix="+"
              ticks={["0 jam", "+1", "+2", "+3", "+4 (maks)"]}
              onChange={setOvertimeHours}
              costNote={overtimeHours > 0
                ? `+Rp ${(overtimeHours * 4 * 3 * 30000).toLocaleString("id-ID")} biaya lembur`
                : undefined}
            />

            {/* ── Slider: Extra Workers ─────────────────────────── */}
            <SliderControl
              icon="group_add"
              label="Tenaga Kerja Lepas"
              sublabel="tambahan freelance"
              value={extraWorkers}
              min={0}
              max={WORKERS_MAX}
              step={1}
              unit="Orang"
              prefix="+"
              ticks={["0 orang", "+1 orang", "+2 orang", "+3 orang"]}
              onChange={setExtraWorkers}
              costNote={extraWorkers > 0
                ? `+Rp ${(extraWorkers * 5 * 140000).toLocaleString("id-ID")} upah harian (5 hari)`
                : undefined}
            />

            {/* ── Slider: Deadline Extension ────────────────────── */}
            <SliderControl
              icon="event_repeat"
              label="Negosiasi Perpanjangan Deadline"
              sublabel="minta toleransi ke pelanggan"
              value={extendedDays}
              min={0}
              max={DEADLINE_MAX}
              step={1}
              unit="Hari Kerja"
              prefix="+"
              ticks={["0 hari", "+1", "+2", "+3", "+4", "+5", "+6", "+7 hari"]}
              onChange={setExtendedDays}
              costNote={extendedDays > 0 ? "Tanpa biaya tambahan langsung" : undefined}
              costNoteColor="text-emerald-600"
            />

            {/* ── Toggle: Outsource ─────────────────────────────── */}
            <ToggleControl
              icon="handshake"
              label="Outsource ke Mitra Produksi"
              sublabel="Kirim pola/komponen ke workshop rekanan"
              cost="Rp 450.000"
              checked={enableOutsource}
              onChange={setEnableOutsource}
            />

            {/* ── Toggle: Split Delivery ────────────────────────── */}
            <ToggleControl
              icon="local_shipping"
              label="Pengiriman Bertahap (2 Termin)"
              sublabel={`Kirim 50% lebih awal, sisa ${SPLIT_TERMIN === 2 ? "50%" : ""} menyusul — meringankan beban produksi satu periode`}
              cost="Rp 200.000"
              checked={enableSplitDelivery}
              onChange={setEnableSplitDelivery}
              badgeLabel="Populer untuk pesanan besar"
            />

            {/* Reset button */}
            <button
              type="button"
              onClick={resetAll}
              className="w-full py-2 px-3 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              Reset ke Kondisi Saat Ini (Tanpa Solusi)
            </button>
          </div>

          {/* ── Result & Comparison Column (7 cols) ──────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Before vs After Comparison Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Hasil Evaluasi Perbandingan</h3>
                  <p className="text-xs text-[#64748B]">
                    Status kelayakan sebelum vs sesudah intervensi skenario
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Simulasi Real-time
                </span>
              </div>

              {/* Side-by-side Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Box */}
                <div className={`p-5 rounded-2xl border space-y-3 ${baseColors.border} ${baseColors.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${baseColors.text}`}>
                      Sekarang (Tanpa Solusi)
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${baseColors.badge}`}>
                      {order.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black font-mono ${baseColors.text}`}>
                      {order.baseUtilization}%
                    </span>
                    <span className={`text-xs ${baseColors.text}`}>Kapasitas Terpakai</span>
                  </div>
                  <div className={`space-y-1 text-xs ${baseColors.text}`}>
                    <div>• {order.baseBottleneck}</div>
                    <div>• Risiko terlambat memenuhi janji kirim</div>
                  </div>
                </div>

                {/* After Box */}
                <div className={`p-5 rounded-2xl border space-y-3 transition-all duration-300 ${newColors.border} ${newColors.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${newColors.text}`}>
                      Setelah Solusi Diterapkan
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${newColors.badge}`}>
                      {statusLabel[newStatus]}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black font-mono ${newColors.text}`}>
                      {newUtilization}%
                    </span>
                    <span className={`text-xs ${newColors.text}`}>
                      Kapasitas terpakai
                      {newUtilization < order.baseUtilization
                        ? ` (turun ${order.baseUtilization - newUtilization}%)`
                        : " (belum berubah)"}
                    </span>
                  </div>
                  <div className={`space-y-1 text-xs ${newColors.text}`}>
                    <div>• Tambahan kapasitas: +{addedCapacityHours} jam</div>
                    <div>
                      • Status:{" "}
                      {newStatus === "FEASIBLE"
                        ? "✅ Aman, ada buffer waktu"
                        : newStatus === "AT_RISK"
                        ? "⚠️ Lebih baik, tapi masih perlu pantau"
                        : "🔴 Masih perlu tambahan solusi"}
                    </div>
                    {enableSplitDelivery && (
                      <div>• 🚚 Pengiriman dibagi 2 termin — beban produksi lebih ringan</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A]">Perbandingan Beban Kapasitas:</span>
                  <span className="font-mono text-[#64748B]">Zona Aman UMKM ≤ 85%</span>
                </div>
                <div className="space-y-2">
                  {/* Baseline bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-[#64748B]">
                      <span>Sebelum</span>
                      <span className="font-mono">{order.baseUtilization}%</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-3 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" style={{ left: "85%" }} />
                      <div
                        className={`h-full rounded-full ${order.baseUtilization > 100 ? "bg-rose-500" : order.baseUtilization > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(order.baseUtilization, 100)}%`, opacity: 0.4 }}
                      />
                    </div>
                  </div>
                  {/* After bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-[#64748B]">
                      <span>Setelah Solusi</span>
                      <span className="font-mono font-bold">{newUtilization}%</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-3 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" style={{ left: "85%" }} />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${newUtilization > 100 ? "bg-rose-500" : newUtilization > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(newUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#64748B]">
                  <span>0% (Kosong)</span>
                  <span className="text-red-500 font-bold">85% (Batas Aman)</span>
                  <span>100% (Overload)</span>
                </div>
              </div>
            </div>

            {/* ── Financial Impact Card ─────────────────────────── */}
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">payments</span>
                  <h4 className="text-sm font-bold text-[#0F172A]">Untung Rugi Pakai Solusi Ini</h4>
                </div>
                <span className="text-xs text-[#64748B]">Kalkulasi Otomatis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="block text-[#64748B] text-[11px]">Nilai Kontrak Order:</span>
                  <strong className="block text-sm font-mono text-[#0F172A] mt-1">
                    Rp {order.orderValue.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="block text-rose-800 text-[11px]">Tambahan Biaya Skenario:</span>
                  <strong className="block text-sm font-mono text-rose-700 mt-1">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block text-emerald-800 text-[11px]">Pendapatan Terlindungi:</span>
                  <strong className={`block text-sm font-mono mt-1 ${netProtectedRevenue >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    Rp {netProtectedRevenue.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Cost ratio insight */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-[#1D4ED8] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">lightbulb</span>
                <p className="leading-relaxed">
                  <strong>Saran Sistem:</strong>{" "}
                  {totalCost === 0
                    ? "Kamu belum menambahkan solusi apapun. Geser slider di kiri untuk melihat dampaknya."
                    : `Biaya solusi ini hanya `}
                  {totalCost > 0 && (
                    <>
                      <strong>{costRatio}%</strong> dari total nilai pesanan.{" "}
                      {parseFloat(costRatio) < 20
                        ? "Jauh lebih menguntungkan daripada tolak pesanan atau kena denda terlambat."
                        : "Pertimbangkan apakah nilai pesanan cukup menutup biaya tambahan ini."}
                    </>
                  )}
                </p>
              </div>

              {/* Active solutions summary chips */}
              {(overtimeHours > 0 || extraWorkers > 0 || extendedDays > 0 || enableOutsource || enableSplitDelivery) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-[#64748B] self-center">Solusi aktif:</span>
                  {overtimeHours > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      +{overtimeHours}j lembur/hari
                    </span>
                  )}
                  {extraWorkers > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                      +{extraWorkers} pekerja lepas
                    </span>
                  )}
                  {extendedDays > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      +{extendedDays} hari deadline
                    </span>
                  )}
                  {enableOutsource && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Outsource mitra
                    </span>
                  )}
                  {enableSplitDelivery && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                      🚚 Split delivery
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#64748B]">
                  Pesanan sasaran:{" "}
                  <strong className="font-mono text-[#0F172A] uppercase">{selectedOrderId}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsApplying(true);
                    setTimeout(() => {
                      setIsApplying(false);
                      setAppliedSuccess(true);
                    }, 700);
                  }}
                  disabled={isApplying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-70"
                >
                  {isApplying ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">bookmark_added</span>
                  )}
                  <span>Simpan Catatan Skenario</span>
                </button>
              </div>

              {/* Success feedback banner */}
              {appliedSuccess && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">info</span>
                    <div>
                      <h5 className="font-bold text-xs text-blue-900">
                        Catatan Skenario Disimpan — Pesanan {selectedOrderId.toUpperCase()}
                      </h5>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Skenario:{" "}
                        {[
                          overtimeHours > 0 && `+${overtimeHours}j lembur`,
                          extraWorkers > 0  && `+${extraWorkers} pekerja`,
                          extendedDays > 0  && `+${extendedDays} hari deadline`,
                          enableOutsource   && "outsource",
                          enableSplitDelivery && "split delivery",
                        ].filter(Boolean).join(", ") || "Tidak ada perubahan"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/orders/${selectedOrderId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
                  >
                    <span>Lihat Detail PO</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────

interface SliderControlProps {
  icon: string;
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  prefix?: string;
  ticks: string[];
  onChange: (v: number) => void;
  costNote?: string;
  costNoteColor?: string;
}

function SliderControl({
  icon, label, sublabel, value, min, max, step, unit, prefix = "",
  ticks, onChange, costNote, costNoteColor = "text-rose-600",
}: SliderControlProps) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#1D4ED8]">{icon}</span>
          <div>
            <label className="text-xs font-bold text-[#0F172A] block">{label}</label>
            {sublabel && <span className="text-[10px] text-[#64748B]">{sublabel}</span>}
          </div>
        </div>
        <span className="font-mono font-bold text-sm text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex-shrink-0">
          {prefix}{value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#1D4ED8] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      {costNote && (
        <p className={`text-[11px] font-medium ${costNoteColor}`}>{costNote}</p>
      )}
    </div>
  );
}

interface ToggleControlProps {
  icon: string;
  label: string;
  sublabel: string;
  cost: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badgeLabel?: string;
}

function ToggleControl({
  icon, label, sublabel, cost, checked, onChange, badgeLabel,
}: ToggleControlProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        checked
          ? "bg-blue-50 border-blue-300 shadow-sm"
          : "bg-[#f8fafc] border-[#e2e8f0]"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span
            className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${
              checked ? "text-[#1D4ED8]" : "text-[#64748B]"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold ${checked ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                {label}
              </span>
              {badgeLabel && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                  {badgeLabel}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#64748B] block mt-0.5">{sublabel}</span>
            <span className={`text-[11px] font-bold mt-1 block ${checked ? "text-rose-600" : "text-[#64748B]"}`}>
              {checked ? `+ ${cost} biaya tambahan` : `Biaya: ${cost}`}
            </span>
          </div>
        </div>
        {/* Toggle switch visual */}
        <div
          className={`w-11 h-6 rounded-full flex items-center transition-colors duration-200 flex-shrink-0 mt-0.5 ${
            checked ? "bg-[#1D4ED8]" : "bg-slate-200"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#64748B]">Memuat simulator kapasitas...</p>
        </div>
      }
    >
      <SimulationContent />
    </Suspense>
  );
}
