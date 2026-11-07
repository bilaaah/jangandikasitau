"use client";

// src/components/simulation/SimulationsView.tsx
//
// What-If Simulator — Modul B.
// Data pesanan datang dari server (props). Hasil kelayakan dihitung engine
// lewat Server Action runWhatIfForOrderAction, bukan lagi data demo.
// Mendukung dual theme (Light & Dark Mode) dengan glassmorphism aesthetic.

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { runWhatIfForOrderAction } from "@/actions/simulation.actions";
import type {
  CapacityEngineResult,
  FeasibilityStatus,
  WhatIfSimulationResult,
} from "@/types";

export interface SimOrder {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  /** Tenggat pesanan dalam format ISO */
  deliveryDateStr: string;
  /** Status pesanan saat ini */
  status: "DRAFT" | "CONFIRMED" | "IN_PROGRESS";
  /** Analisis tersimpan terakhir berstatus AT_RISK / NOT_FEASIBLE */
  lastKnownRisk: boolean;
}

interface SimulationsViewProps {
  orders: SimOrder[];
  initialOrderId?: string;
  initialSolution?: string;
  /** Jumlah pekerja aktif, untuk mengubah "lembur N jam per orang" menjadi total jam */
  workerCount: number;
}

// ── Konfigurasi slider ────────────────────────────────────────────
const OVERTIME_MAX = 4; // jam/hari per pekerja
const WORKERS_MAX = 3; // orang
const DEADLINE_MAX = 7; // hari kerja
const OUTSOURCE_MAX_PERCENT = 80; // % unit yang boleh dialihkan ke mitra
const OUTSOURCE_STEP = 10;
const SPLIT_FIRST_WAVE_PERCENT = 50; // % unit di termin 1
const SPLIT_DELAY_WORKING_DAYS = 3; // termin 2 menyusul N hari kerja setelah tenggat
const FREELANCER_DAILY_HOURS = 8;

// ── Tarif contoh (belum ada di database) ──────────────────────────
const OVERTIME_COST_PER_HOUR = 30_000;
const WORKER_DAILY_RATE = 140_000;
const OUTSOURCE_COST_PER_UNIT = 35_000; // biaya maklon per unit (contoh)
const SPLIT_EXTRA_SHIPPING_COST = 150_000; // ongkir tambahan untuk termin ke-2 (contoh)

const ORDER_STATUS_TAG = {
  DRAFT: "Draf",
  CONFIRMED: "Terkonfirmasi",
  IN_PROGRESS: "Diproduksi",
} as const;

const STATUS_COLOR = {
  FEASIBLE: {
    border: "border-emerald-300 dark:border-emerald-500/30",
    bg: "bg-emerald-50/70 dark:bg-emerald-500/[0.08]",
    text: "text-emerald-900 dark:text-emerald-300",
    badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30",
  },
  AT_RISK: {
    border: "border-amber-300 dark:border-amber-500/30",
    bg: "bg-amber-50/70 dark:bg-amber-500/[0.08]",
    text: "text-amber-900 dark:text-amber-300",
    badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30",
  },
  NOT_FEASIBLE: {
    border: "border-rose-300 dark:border-rose-500/30",
    bg: "bg-rose-50/70 dark:bg-rose-500/[0.08]",
    text: "text-rose-900 dark:text-rose-300",
    badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30",
  },
};

const STATUS_LABEL = {
  FEASIBLE: "✅ Bisa Dikerjakan",
  AT_RISK: "⚠️ Masih Perlu Perhatian",
  NOT_FEASIBLE: "🔴 Belum Sanggup",
};

const BASE_STATUS_LABEL = {
  FEASIBLE: "✅ Aman",
  AT_RISK: "⚠️ Perlu Solusi",
  NOT_FEASIBLE: "🔴 Tidak Sanggup",
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Utilisasi yang paling membatasi (pekerja atau mesin, mana yang lebih tinggi). */
function bindingUtilization(r: CapacityEngineResult) {
  return round1(
    Math.max(
      r.workerAnalysis.utilizationPercent,
      r.machineAnalysis.utilizationPercent,
    ),
  );
}

export function SimulationsView({
  orders,
  initialOrderId,
  initialSolution,
  workerCount,
}: SimulationsViewProps) {
  // ── Scenario state ───────────────────────────────────────────────
  const [selectedOrderId, setSelectedOrderId] = useState(
    orders.find((o) => o.id === initialOrderId)?.id ?? orders[0]?.id ?? "",
  );
  const [overtimeHours, setOvertimeHours] = useState(() => {
    if (initialSolution === "overtime") return 3;
    if (initialSolution === "workers" || initialSolution === "split") return 0;
    return 2;
  });
  const [extraWorkers, setExtraWorkers] = useState(() =>
    initialSolution === "workers" ? 1 : 0,
  );
  const [extendedDays, setExtendedDays] = useState(0);
  const [outsourcePercent, setOutsourcePercent] = useState(0);
  const [splitEnabled, setSplitEnabled] = useState(initialSolution === "split");
  
  const initialSelected = orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null;
  const [orderValue, setOrderValue] = useState<number>(() =>
    initialSelected ? initialSelected.quantity * 60_000 : 0,
  );
  const [overtimeRate] = useState<number>(() => {
    if (typeof window === "undefined") return OVERTIME_COST_PER_HOUR;
    try {
      const stored = localStorage.getItem("biz_overtime_rate");
      return stored && Number(stored) > 0 ? Number(stored) : OVERTIME_COST_PER_HOUR;
    } catch {
      return OVERTIME_COST_PER_HOUR;
    }
  });
  const [freelanceRate] = useState<number>(() => {
    if (typeof window === "undefined") return WORKER_DAILY_RATE;
    try {
      const stored = localStorage.getItem("biz_freelance_rate");
      return stored && Number(stored) > 0 ? Number(stored) : WORKER_DAILY_RATE;
    } catch {
      return WORKER_DAILY_RATE;
    }
  });

  const selected = orders.find((o) => o.id === selectedOrderId) ?? null;

  // ── UI state ─────────────────────────────────────────────────────
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Hasil engine ─────────────────────────────────────────────────
  const [sim, setSim] = useState<WhatIfSimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const selProductId = selected?.productId;
  const selQuantity = selected?.quantity;
  const selDelivery = selected?.deliveryDateStr;

  // Lembur N jam untuk setiap pekerja + pekerja lepas (8 jam/hari) = total jam tambahan per hari
  const additionalWorkerDailyHours =
    overtimeHours * workerCount + extraWorkers * FREELANCER_DAILY_HOURS;

  useEffect(() => {
    if (!selProductId || !selQuantity || !selDelivery) return;
    let cancelled = false;
    // Jeda singkat agar server tidak dipanggil di setiap geseran slider
    const timer = setTimeout(async () => {
      const res = await runWhatIfForOrderAction(
        {
          orderId: selectedOrderId,
          productId: selProductId,
          quantity: selQuantity,
          deliveryDateStr: selDelivery,
        },
        {
          additionalWorkerDailyHours,
          deadlineShiftDays: extendedDays,
          outsourcePercent,
          splitDelivery: splitEnabled
            ? {
                firstWavePercent: SPLIT_FIRST_WAVE_PERCENT,
                secondWaveDelayWorkingDays: SPLIT_DELAY_WORKING_DAYS,
              }
            : undefined,
        },
      );
      if (cancelled) return;
      if (res.success && res.data) {
        setSim(res.data);
        setSimError(null);
      } else {
        setSimError(res.error ?? "Simulasi gagal dijalankan.");
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    selectedOrderId,
    selProductId,
    selQuantity,
    selDelivery,
    additionalWorkerDailyHours,
    extendedDays,
    outsourcePercent,
    splitEnabled,
  ]);

  function resetAll() {
    setOvertimeHours(0);
    setExtraWorkers(0);
    setExtendedDays(0);
    setOutsourcePercent(0);
    setSplitEnabled(false);
    setCopySuccess(false);
  }

  const enableOutsource = outsourcePercent > 0;
  const enableSplitDelivery = splitEnabled;

  // ── Keadaan khusus (semua hook sudah dipanggil di atas) ──────────
  if (!selected) {
    return (
      <DashboardShell>
        <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9]">
            Belum ada pesanan untuk disimulasikan
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
            Simulasi tersedia untuk pesanan berstatus DRAFT, terkonfirmasi,
            atau sedang diproduksi.
          </p>
          <Link
            href="/orders/new"
            className="inline-block px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            Buat Pesanan Baru
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!sim) {
    return (
      <DashboardShell>
        <div className="p-12 text-center">
          {simError ? (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{simError}</p>
          ) : (
            <>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
                Menghitung simulasi kapasitas...
              </p>
            </>
          )}
        </div>
      </DashboardShell>
    );
  }

  // ── Nilai turunan dari hasil engine ──────────────────────────────
  const base = sim.baselineResult;
  const after = sim.simulatedResult;
  const baseStatus: FeasibilityStatus = base.status;
  const newStatus: FeasibilityStatus = after.status;
  const baseUtilization = bindingUtilization(base);
  const newUtilization = bindingUtilization(after);
  const baseWorkerUtil = round1(base.workerAnalysis.utilizationPercent);
  const baseMachineUtil = round1(base.machineAnalysis.utilizationPercent);
  const newWorkerUtil = round1(after.workerAnalysis.utilizationPercent);
  const newMachineUtil = round1(after.machineAnalysis.utilizationPercent);
  const addedCapacityHours = Math.max(
    0,
    Math.round(
      after.workerAnalysis.totalAvailableHours -
        base.workerAnalysis.totalAvailableHours,
    ),
  );
  const workDays = base.availableWorkDays;

  const order = {
    id: selected.id,
    statusLabel: BASE_STATUS_LABEL[baseStatus],
    baseStatus,
    baseUtilization,
    baseBottleneck:
      base.bottlenecks[0]?.description ?? "Tidak ada kendala terdeteksi",
    orderValue,
  };

  // ── Biaya (tarif dari Pengaturan / Default) ──────────────────────
  const overtimeCost =
    overtimeHours * workerCount * workDays * overtimeRate;
  const workerCost = extraWorkers * workDays * freelanceRate;
  const outsourceCost = sim.outsourcedUnits * OUTSOURCE_COST_PER_UNIT;
  const splitCost = enableSplitDelivery ? SPLIT_EXTRA_SHIPPING_COST : 0;
  const totalCost = overtimeCost + workerCost + outsourceCost + splitCost;
  const netProtectedRevenue = orderValue - totalCost;
  const costRatio =
    orderValue > 0 ? ((totalCost / orderValue) * 100).toFixed(1) : "0.0";

  const newColors = STATUS_COLOR[newStatus];
  const baseColors = STATUS_COLOR[baseStatus];
  const statusLabel = STATUS_LABEL;

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ── Header Bar ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
              <Link
                href="/dashboard"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Dasbor
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-[#F1F5F9] font-semibold">
                Simulasi Pesanan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9] mt-1">
              Tes Pesanan Sebelum Bilang Iya
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#94A3B8]">
              Geser slider di bawah untuk coba berbagai solusi — sistem
              menghitung dampaknya sebelum kamu putuskan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.12] bg-white/80 dark:bg-white/[0.04] text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>Kembali ke Pesanan</span>
            </Link>
            <Link
              href="/production-planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                calendar_month
              </span>
              <span>Jadwal Produksi</span>
            </Link>
          </div>
        </div>

        {/* ── 2-Column Layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Controls Column (5 cols) ─────────────────────────── */}
          <div className="lg:col-span-5 bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 animate-slide-up stagger-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">
                  Coba Berbagai Solusi
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Geser slider untuk lihat dampaknya secara langsung
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                ✨ Coba-coba Dulu
              </span>
            </div>

            {/* Order Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                  receipt_long
                </span>
                Pilih pesanan yang ingin dicari solusinya:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedOrderId(newId);
                  const newSel = orders.find((o) => o.id === newId);
                  if (newSel) {
                    setOrderValue(newSel.quantity * 60_000);
                  }
                  setSim(null);
                  resetAll();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-slate-900/80 text-slate-900 dark:text-[#F1F5F9] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {o.customerName} ({o.quantity} × {o.productName}) ·{" "}
                    {ORDER_STATUS_TAG[o.status]}
                    {o.lastKnownRisk ? " ⚠️" : ""}
                  </option>
                ))}
              </select>
              {/* Current bottleneck hint */}
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/[0.10] border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  <strong>Bottleneck:</strong> {order.baseBottleneck}
                </span>
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
              costNote={
                overtimeHours > 0
                  ? `+Rp ${overtimeCost.toLocaleString("id-ID")} biaya lembur`
                  : undefined
              }
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
              costNote={
                extraWorkers > 0
                  ? `+Rp ${workerCost.toLocaleString("id-ID")} upah (${workDays} hari kerja)`
                  : undefined
              }
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
              costNote={
                extendedDays > 0 ? "Tanpa biaya tambahan langsung" : undefined
              }
              costNoteColor="text-emerald-600 dark:text-emerald-400"
            />

            {/* ── Slider: Outsource ─────────────────────────────── */}
            <SliderControl
              icon="handshake"
              label="Outsource ke Mitra Maklon"
              sublabel="alihkan sebagian unit ke workshop rekanan"
              value={outsourcePercent}
              min={0}
              max={OUTSOURCE_MAX_PERCENT}
              step={OUTSOURCE_STEP}
              unit="% unit"
              ticks={["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80% (maks)"]}
              onChange={setOutsourcePercent}
              costNote={
                outsourcePercent > 0
                  ? `${sim.outsourcedUnits} unit ke mitra · +Rp ${outsourceCost.toLocaleString("id-ID")} biaya maklon`
                  : undefined
              }
            />

            {/* ── Toggle: Split Delivery ────────────────────────── */}
            <ToggleControl
              icon="local_shipping"
              label="Pengiriman Bertahap (2 Termin)"
              sublabel={`Kirim ${SPLIT_FIRST_WAVE_PERCENT}% di tenggat, sisanya menyusul +${SPLIT_DELAY_WORKING_DAYS} hari kerja`}
              cost={`Rp ${SPLIT_EXTRA_SHIPPING_COST.toLocaleString("id-ID")} (ongkir termin 2)`}
              checked={splitEnabled}
              onChange={setSplitEnabled}
            />
            {sim.splitDelivery && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-500/[0.10] border border-orange-200 dark:border-orange-500/20 text-[11px] text-orange-900 dark:text-orange-200 space-y-1">
                <p>
                  <strong>Termin 1</strong> ({sim.splitDelivery.wave1Units} unit, tepat tenggat):{" "}
                  {STATUS_LABEL[sim.splitDelivery.wave1Result.status]}
                </p>
                <p>
                  <strong>Termin 2</strong> ({sim.splitDelivery.wave2Units} unit, +{SPLIT_DELAY_WORKING_DAYS} hari kerja):{" "}
                  {STATUS_LABEL[sim.splitDelivery.wave2Result.status]}
                </p>
                <p className="opacity-80">
                  Hasil perbandingan di kanan memakai termin yang paling ketat.
                </p>
              </div>
            )}

            {/* Reset button */}
            <button
              type="button"
              onClick={resetAll}
              className="w-full py-2 px-3 text-xs font-bold text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                restart_alt
              </span>
              Reset ke Kondisi Saat Ini (Tanpa Solusi)
            </button>
          </div>

          {/* ── Result & Comparison Column (7 cols) ──────────────── */}
          <div className="lg:col-span-7 space-y-6 animate-slide-up stagger-2">
            {/* Before vs After Comparison Card */}
            <div className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 hover-lift-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">
                    Hasil Evaluasi Perbandingan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                    Status kelayakan sebelum vs sesudah intervensi skenario
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                  Simulasi Real-time
                </span>
              </div>

              {/* Side-by-side Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Box */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${baseColors.border} ${baseColors.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${baseColors.text}`}
                    >
                      Sekarang (Tanpa Solusi)
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${baseColors.badge}`}
                    >
                      {order.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black font-mono ${baseColors.text}`}
                    >
                      {order.baseUtilization}%
                    </span>
                    <span className={`text-xs ${baseColors.text}`}>
                      Kapasitas Terpakai
                    </span>
                  </div>
                  <div className={`space-y-1 text-xs ${baseColors.text}`}>
                    <div>• {order.baseBottleneck}</div>
                    <div>
                      • Pekerja {baseWorkerUtil}% · Mesin {baseMachineUtil}%
                    </div>
                    <div>• Risiko terlambat memenuhi janji kirim</div>
                  </div>
                </div>

                {/* After Box */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-all duration-300 ${newColors.border} ${newColors.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${newColors.text}`}
                    >
                      Setelah Solusi Diterapkan
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded ${newColors.badge}`}
                    >
                      {statusLabel[newStatus]}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black font-mono ${newColors.text}`}
                    >
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
                      • Pekerja {newWorkerUtil}% · Mesin {newMachineUtil}%
                    </div>
                    <div>
                      • Status:{" "}
                      {newStatus === "FEASIBLE"
                        ? "✅ Aman, ada buffer waktu"
                        : newStatus === "AT_RISK"
                          ? "⚠️ Lebih baik, tapi masih perlu pantau"
                          : "🔴 Masih perlu tambahan solusi"}
                    </div>
                    {enableSplitDelivery && (
                      <div>
                        • 🚚 Pengiriman dibagi 2 termin — beban produksi lebih
                        ringan
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">
                    Perbandingan Beban Kapasitas:
                  </span>
                  <span className="font-mono text-slate-500 dark:text-[#94A3B8]">
                    Zona Aman UMKM ≤ 85%
                  </span>
                </div>
                <div className="space-y-2">
                  {/* Baseline bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                      <span>Sebelum</span>
                      <span className="font-mono">
                        {order.baseUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-3 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: "85%" }}
                      />
                      <div
                        className={`h-full rounded-full ${order.baseUtilization > 100 ? "bg-rose-500" : order.baseUtilization > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{
                          width: `${Math.min(order.baseUtilization, 100)}%`,
                          opacity: 0.4,
                        }}
                      />
                    </div>
                  </div>
                  {/* After bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                      <span>Setelah Solusi</span>
                      <span className="font-mono font-bold">
                        {newUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-3 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: "85%" }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${newUtilization > 100 ? "bg-rose-500" : newUtilization > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(newUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#94A3B8]">
                  <span>0% (Kosong)</span>
                  <span className="text-red-500 font-bold">
                    85% (Batas Aman)
                  </span>
                  <span>100% (Overload)</span>
                </div>
              </div>
            </div>

            {/* ── Financial Impact Card ─────────────────────────── */}
            <div className="p-6 rounded-2xl bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">
                    payments
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">
                    Untung Rugi Pakai Solusi Ini
                  </h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Kalkulasi Otomatis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                  <span className="block text-slate-500 dark:text-[#94A3B8] text-[11px]">
                    Nilai Kontrak Order:
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-mono text-slate-900 dark:text-[#F1F5F9]">Rp</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={orderValue || ""}
                      placeholder="isi nilai"
                      onChange={(e) =>
                        setOrderValue(Math.max(0, Number(e.target.value) || 0))
                      }
                      className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 dark:text-[#F1F5F9] border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-500/[0.08] border border-rose-200 dark:border-rose-500/20">
                  <span className="block text-rose-800 dark:text-rose-300 text-[11px]">
                    Tambahan Biaya Skenario:
                  </span>
                  <strong className="block text-sm font-mono text-rose-700 dark:text-rose-400 mt-1">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/[0.08] border border-emerald-200 dark:border-emerald-500/20">
                  <span className="block text-emerald-800 dark:text-emerald-300 text-[11px]">
                    Pendapatan Terlindungi:
                  </span>
                  <strong
                    className={`block text-sm font-mono mt-1 ${netProtectedRevenue >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                  >
                    Rp {netProtectedRevenue.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Cost ratio insight */}
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-500/[0.08] border border-blue-200 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                  lightbulb
                </span>
                <p className="leading-relaxed">
                  <strong>Saran Sistem:</strong>{" "}
                  {totalCost === 0
                    ? "Kamu belum menambahkan solusi apapun. Geser slider di kiri untuk melihat dampaknya."
                    : orderValue > 0
                      ? `Biaya solusi ini hanya `
                      : "Isi nilai kontrak order di atas untuk melihat rasio biayanya."}
                  {totalCost > 0 && orderValue > 0 && (
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
              {(overtimeHours > 0 ||
                extraWorkers > 0 ||
                extendedDays > 0 ||
                enableOutsource ||
                enableSplitDelivery) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] self-center">
                    Solusi aktif:
                  </span>
                  {overtimeHours > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      +{overtimeHours}j lembur/hari
                    </span>
                  )}
                  {extraWorkers > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                      +{extraWorkers} pekerja lepas
                    </span>
                  )}
                  {extendedDays > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      +{extendedDays} hari deadline
                    </span>
                  )}
                  {enableOutsource && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      Outsource mitra
                    </span>
                  )}
                  {enableSplitDelivery && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
                      🚚 Split delivery
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Pesanan sasaran:{" "}
                  <strong className="font-mono text-slate-900 dark:text-[#F1F5F9] uppercase">
                    {selectedOrderId}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={async () => {
                    if (!selected || !sim) return;
                    setIsCopying(true);

                    const activeSolutionsList = [
                      overtimeHours > 0 && `• Tambah lembur: +${overtimeHours} jam/hari/pekerja`,
                      extraWorkers > 0 && `• Tambah pekerja harian: +${extraWorkers} orang`,
                      extendedDays > 0 && `• Geser tenggat deadline: +${extendedDays} hari kerja`,
                      outsourcePercent > 0 && `• Alihkan ke mitra maklon: ${outsourcePercent}% (${sim.outsourcedUnits} unit)`,
                      splitEnabled && `• Pengiriman bertahap (2 termin): ${SPLIT_FIRST_WAVE_PERCENT}% di tenggat, ${100 - SPLIT_FIRST_WAVE_PERCENT}% +${SPLIT_DELAY_WORKING_DAYS} hari kerja`,
                    ].filter(Boolean);

                    const summaryText = `[RINGKASAN SKENARIO PRODUKSI BIZCAPACITY]
Pesanan: ${selected.customerName} (${selected.quantity} unit × ${selected.productName})
Tenggat: ${new Date(selected.deliveryDateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Status Awal: ${order.statusLabel} (${order.baseUtilization}% beban kapasitas)
Status Hasil Skenario: ${statusLabel[newStatus]} (${newUtilization}% beban kapasitas)

Intervensi Solusi yang Dipilih:
${activeSolutionsList.length > 0 ? activeSolutionsList.join("\n") : "• Tidak ada intervensi tambahan"}

Dampak Finansial:
• Nilai Pesanan: Rp ${orderValue.toLocaleString("id-ID")}
• Tambahan Biaya Solusi: Rp ${totalCost.toLocaleString("id-ID")}
• Estimasi Pendapatan Bersih: Rp ${netProtectedRevenue.toLocaleString("id-ID")}
${sim.splitDelivery ? `\nStatus Pembagian Termin:\n• Termin 1 (${sim.splitDelivery.wave1Units} unit): ${STATUS_LABEL[sim.splitDelivery.wave1Result.status]}\n• Termin 2 (${sim.splitDelivery.wave2Units} unit): ${STATUS_LABEL[sim.splitDelivery.wave2Result.status]}` : ""}

Dihasilkan otomatis oleh BizCapacity Decision Support System.`;

                    try {
                      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(summaryText);
                      }
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 5000);
                    } catch {
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 5000);
                    } finally {
                      setIsCopying(false);
                    }
                  }}
                  disabled={isCopying || !sim}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-70 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copySuccess ? "done_all" : "content_copy"}
                  </span>
                  <span>{copySuccess ? "Tersalin ke Clipboard!" : "Salin Ringkasan Skenario"}</span>
                </button>
              </div>

              {/* Success feedback banner */}
              {copySuccess && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-500/[0.12] text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[22px] shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        Ringkasan Skenario Berhasil Disalin ke Clipboard!
                      </h5>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Teks ringkasan skenario pesanan <strong>{selected.customerName}</strong> siap dibagikan ke WhatsApp tim produksi, mitra maklon, atau catatan manajemen.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/orders/${selectedOrderId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <span>Lihat Detail PO</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
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
  icon,
  label,
  sublabel,
  value,
  min,
  max,
  step,
  unit,
  prefix = "",
  ticks,
  onChange,
  costNote,
  costNoteColor = "text-rose-600 dark:text-rose-400",
}: SliderControlProps) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover-lift-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
            {icon}
          </span>
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] block">
              {label}
            </label>
            {sublabel && (
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">{sublabel}</span>
            )}
          </div>
        </div>
        <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/30 flex-shrink-0">
          {prefix}
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">
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
  icon,
  label,
  sublabel,
  cost,
  checked,
  onChange,
  badgeLabel,
}: ToggleControlProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover-lift-sm ${
        checked
          ? "bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40 shadow-xs"
          : "bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06]"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span
            className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${
              checked ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-[#64748B]"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold ${checked ? "text-slate-900 dark:text-[#F1F5F9]" : "text-slate-900 dark:text-[#F1F5F9]"}`}
              >
                {label}
              </span>
              {badgeLabel && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  {badgeLabel}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block mt-0.5">
              {sublabel}
            </span>
            <span
              className={`text-[11px] font-bold mt-1 block ${checked ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-[#94A3B8]"}`}
            >
              {checked ? `+ ${cost} biaya tambahan` : `Biaya: ${cost}`}
            </span>
          </div>
        </div>
        {/* Toggle switch visual */}
        <div
          className={`w-11 h-6 rounded-full flex items-center transition-colors duration-200 flex-shrink-0 mt-0.5 ${
            checked ? "bg-blue-600" : "bg-slate-200 dark:bg-white/[0.12]"
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
