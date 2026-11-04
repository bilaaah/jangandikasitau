"use client";

// src/components/simulation/SimulationsView.tsx
//
// What-If Simulator — Modul B.
// Data pesanan datang dari server (props). Hasil kelayakan dihitung engine
// lewat Server Action runWhatIfForOrderAction, bukan lagi data demo.

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
const SPLIT_TERMIN = 2;
const FREELANCER_DAILY_HOURS = 8;

// ── Tarif contoh (belum ada di database) ──────────────────────────
const OVERTIME_COST_PER_HOUR = 30_000;
const WORKER_DAILY_RATE = 140_000;

const STATUS_COLOR = {
  FEASIBLE: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/60",
    text: "text-emerald-900",
    badge: "bg-emerald-200 text-emerald-900",
  },
  AT_RISK: {
    border: "border-amber-300",
    bg: "bg-amber-50/50",
    text: "text-amber-900",
    badge: "bg-amber-200   text-amber-900",
  },
  NOT_FEASIBLE: {
    border: "border-rose-300",
    bg: "bg-rose-50/50",
    text: "text-rose-900",
    badge: "bg-rose-200    text-rose-900",
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
  const [extendedDays, setExtendedDays] = useState(() =>
    initialSolution === "split" ? 3 : 0,
  );
  const [orderValue, setOrderValue] = useState(0);

  // ── UI state ─────────────────────────────────────────────────────
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // ── Hasil engine ─────────────────────────────────────────────────
  const [sim, setSim] = useState<WhatIfSimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const selected = orders.find((o) => o.id === selectedOrderId) ?? null;
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
          productId: selProductId,
          quantity: selQuantity,
          deliveryDateStr: selDelivery,
        },
        { additionalWorkerDailyHours, deadlineShiftDays: extendedDays },
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
    selProductId,
    selQuantity,
    selDelivery,
    additionalWorkerDailyHours,
    extendedDays,
  ]);

  function resetAll() {
    setOvertimeHours(0);
    setExtraWorkers(0);
    setExtendedDays(0);
    setAppliedSuccess(false);
  }

  // Tuas yang belum didukung engine (kartunya ditandai "Segera hadir")
  const enableOutsource = false;
  const enableSplitDelivery = false;

  // ── Keadaan khusus (semua hook sudah dipanggil di atas) ──────────
  if (!selected) {
    return (
      <DashboardShell>
        <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Belum ada pesanan untuk disimulasikan
          </h2>
          <p className="text-sm text-[#64748B]">
            Simulasi dipakai sebelum pesanan diterima, jadi hanya pesanan
            berstatus DRAFT yang muncul di sini.
          </p>
          <Link
            href="/orders/new"
            className="inline-block px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-sm font-bold"
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
            <p className="text-sm text-rose-700">{simError}</p>
          ) : (
            <>
              <div className="w-8 h-8 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">
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

  // ── Biaya (tarif contoh) ─────────────────────────────────────────
  const overtimeCost =
    overtimeHours * workerCount * workDays * OVERTIME_COST_PER_HOUR;
  const workerCost = extraWorkers * workDays * WORKER_DAILY_RATE;
  const totalCost = overtimeCost + workerCost;
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link
                href="/dashboard"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Dasbor
              </Link>
              <span>/</span>
              <span className="text-[#0F172A] font-semibold">
                Simulasi Pesanan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] mt-1">
              Tes Pesanan Sebelum Bilang Iya
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Geser slider di bawah untuk coba berbagai solusi — sistem
              menghitung dampaknya sebelum kamu putuskan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-xs sm:text-sm font-semibold text-[#0F172A] hover:bg-[#f8fafc] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>Kembali ke Pesanan</span>
            </Link>
            <Link
              href="/production-planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
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
          <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Coba Berbagai Solusi
                </h3>
                <p className="text-xs text-[#64748B]">
                  Geser slider untuk lihat dampaknya secara langsung
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200">
                ✨ Coba-coba Dulu
              </span>
            </div>

            {/* Order Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#1D4ED8]">
                  receipt_long
                </span>
                Pilih pesanan yang ingin dicari solusinya:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSim(null);
                  resetAll();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-medium"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.customerName} ({o.quantity} × {o.productName})
                  </option>
                ))}
              </select>
              {/* Current bottleneck hint */}
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="material-symbols-outlined text-[15px] text-amber-600 flex-shrink-0 mt-0.5">
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
              costNoteColor="text-emerald-600"
            />

            {/* ── Toggle: Outsource ─────────────────────────────── */}
            <ToggleControl
              icon="handshake"
              label="Outsource ke Mitra Produksi"
              sublabel="Kirim pola/komponen ke workshop rekanan"
              cost="belum tersedia"
              checked={false}
              onChange={() => {}}
            />

            {/* ── Toggle: Split Delivery ────────────────────────── */}
            <ToggleControl
              icon="local_shipping"
              label="Pengiriman Bertahap (2 Termin)"
              sublabel={`Kirim 50% lebih awal, sisa ${SPLIT_TERMIN === 2 ? "50%" : ""} menyusul — meringankan beban produksi satu periode`}
              cost="belum tersedia"
              checked={false}
              onChange={() => {}}
              badgeLabel="Segera hadir"
            />

            {/* Reset button */}
            <button
              type="button"
              onClick={resetAll}
              className="w-full py-2 px-3 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">
                restart_alt
              </span>
              Reset ke Kondisi Saat Ini (Tanpa Solusi)
            </button>
          </div>

          {/* ── Result & Comparison Column (7 cols) ──────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Before vs After Comparison Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Hasil Evaluasi Perbandingan
                  </h3>
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
                  <span className="font-bold text-[#0F172A]">
                    Perbandingan Beban Kapasitas:
                  </span>
                  <span className="font-mono text-[#64748B]">
                    Zona Aman UMKM ≤ 85%
                  </span>
                </div>
                <div className="space-y-2">
                  {/* Baseline bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-[#64748B]">
                      <span>Sebelum</span>
                      <span className="font-mono">
                        {order.baseUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-3 rounded-full overflow-hidden relative">
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
                    <div className="flex items-center justify-between mb-1 text-[11px] text-[#64748B]">
                      <span>Setelah Solusi</span>
                      <span className="font-mono font-bold">
                        {newUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-3 rounded-full overflow-hidden relative">
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
                <div className="flex justify-between text-[10px] text-[#64748B]">
                  <span>0% (Kosong)</span>
                  <span className="text-red-500 font-bold">
                    85% (Batas Aman)
                  </span>
                  <span>100% (Overload)</span>
                </div>
              </div>
            </div>

            {/* ── Financial Impact Card ─────────────────────────── */}
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">
                    payments
                  </span>
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Untung Rugi Pakai Solusi Ini
                  </h4>
                </div>
                <span className="text-xs text-[#64748B]">
                  Kalkulasi Otomatis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="block text-[#64748B] text-[11px]">
                    Nilai Kontrak Order:
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-mono text-[#0F172A]">Rp</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={orderValue || ""}
                      placeholder="isi nilai"
                      onChange={(e) =>
                        setOrderValue(Math.max(0, Number(e.target.value) || 0))
                      }
                      className="w-full bg-transparent text-sm font-mono font-bold text-[#0F172A] border-b border-[#cbd5e1] focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="block text-rose-800 text-[11px]">
                    Tambahan Biaya Skenario:
                  </span>
                  <strong className="block text-sm font-mono text-rose-700 mt-1">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block text-emerald-800 text-[11px]">
                    Pendapatan Terlindungi:
                  </span>
                  <strong
                    className={`block text-sm font-mono mt-1 ${netProtectedRevenue >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    Rp {netProtectedRevenue.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Cost ratio insight */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-[#1D4ED8] flex items-start gap-2.5">
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
                  <span className="text-[11px] font-bold text-[#64748B] self-center">
                    Solusi aktif:
                  </span>
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
                  <strong className="font-mono text-[#0F172A] uppercase">
                    {selectedOrderId}
                  </strong>
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
                    <span className="material-symbols-outlined text-[18px]">
                      bookmark_added
                    </span>
                  )}
                  <span>Simpan Catatan Skenario</span>
                </button>
              </div>

              {/* Success feedback banner */}
              {appliedSuccess && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">
                      info
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-blue-900">
                        Catatan Skenario Disimpan — Pesanan{" "}
                        {selectedOrderId.toUpperCase()}
                      </h5>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Skenario:{" "}
                        {[
                          overtimeHours > 0 && `+${overtimeHours}j lembur`,
                          extraWorkers > 0 && `+${extraWorkers} pekerja`,
                          extendedDays > 0 && `+${extendedDays} hari deadline`,
                          enableOutsource && "outsource",
                          enableSplitDelivery && "split delivery",
                        ]
                          .filter(Boolean)
                          .join(", ") || "Tidak ada perubahan"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/orders/${selectedOrderId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
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
  costNoteColor = "text-rose-600",
}: SliderControlProps) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#1D4ED8]">
            {icon}
          </span>
          <div>
            <label className="text-xs font-bold text-[#0F172A] block">
              {label}
            </label>
            {sublabel && (
              <span className="text-[10px] text-[#64748B]">{sublabel}</span>
            )}
          </div>
        </div>
        <span className="font-mono font-bold text-sm text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex-shrink-0">
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
              <span
                className={`text-xs font-bold ${checked ? "text-[#0F172A]" : "text-[#0F172A]"}`}
              >
                {label}
              </span>
              {badgeLabel && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                  {badgeLabel}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              {sublabel}
            </span>
            <span
              className={`text-[11px] font-bold mt-1 block ${checked ? "text-rose-600" : "text-[#64748B]"}`}
            >
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
