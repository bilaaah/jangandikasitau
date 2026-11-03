"use client";

// src/app/simulations/page.tsx
//
// What-If Simulator â€” Modul B
// Uji berbagai skenario solusi (lembur, pekerja tambahan, perpanjangan deadline,
// outsource, split delivery) secara interaktif dengan loading simulation & output diagnosis.

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// â”€â”€ Demo order catalogue lengkap untuk simulasi UMKM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_ORDERS = [
  {
    id: "bc-1024",
    label: "BC-1024 â€¢ PT Nusantara Sentosa",
    desc: "300 Box Hampers Lebaran",
    statusLabel: "âš ï¸ Perlu Solusi",
    baseUtilization: 93,
    baseStatus: "AT_RISK" as const,
    orderValue: 18_500_000,
    baseBottleneck: "Kurang 8 jam kerja di stasiun packaging & pita",
    baseBufferDays: 0,
  },
  {
    id: "bc-1023",
    label: "BC-1023 â€¢ Ibu Ratna Catering",
    desc: "120 Box Brownies Fudgy",
    statusLabel: "âœ… Bisa Dikerjakan",
    baseUtilization: 68,
    baseStatus: "FEASIBLE" as const,
    orderValue: 7_200_000,
    baseBottleneck: "Semua stasiun aman (tersedia buffer oven 12 jam)",
    baseBufferDays: 1.5,
  },
  {
    id: "bc-1022",
    label: "BC-1022 â€¢ Kopi Selaras Cafe",
    desc: "500 Pcs Artisan Croissants",
    statusLabel: "âœ… Bisa Dikerjakan",
    baseUtilization: 74,
    baseStatus: "FEASIBLE" as const,
    orderValue: 10_000_000,
    baseBottleneck: "Proses cold fermentasi butuh 24 jam",
    baseBufferDays: 2,
  },
  {
    id: "bc-1021",
    label: "BC-1021 â€¢ Wedding Organizer Lestari",
    desc: "1 Tier Wedding Cake Fondant",
    statusLabel: "ðŸ”´ Tidak Sanggup",
    baseUtilization: 112,
    baseStatus: "NOT_FEASIBLE" as const,
    orderValue: 12_000_000,
    baseBottleneck: "Defisit 7 kg tepung gandum khusus & kurang 6.5 jam dekorasi",
    baseBufferDays: -1.5,
  },
] as const;

// â”€â”€ Scenario slider config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OVERTIME_MAX = 4; // jam/hari
const WORKERS_MAX = 3; // orang
const DEADLINE_MAX = 7; // hari kerja
const SPLIT_TERMIN = 2; // termin default

function SimulationContent() {
  const searchParams = useSearchParams();
  const rawOrderParam = searchParams.get("order")?.toLowerCase() || "bc-1024";
  const solutionFromUrl = searchParams.get("solution") || null;

  // â”€â”€ Scenario state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedOrderId, setSelectedOrderId] = useState(rawOrderParam);
  const [overtimeHours, setOvertimeHours] = useState(() => {
    if (solutionFromUrl === "overtime") return 3;
    if (solutionFromUrl === "workers" || solutionFromUrl === "split") return 0;
    return 2;
  });
  const [extraWorkers, setExtraWorkers] = useState(() => {
    if (solutionFromUrl === "workers") return 1;
    return 0;
  });
  const [extendedDays, setExtendedDays] = useState(() => {
    if (solutionFromUrl === "split") return 3;
    return 0;
  });
  const [enableOutsource, setEnableOutsource] = useState(false);
  const [enableSplitDelivery, setEnableSplitDelivery] = useState(solutionFromUrl === "split");

  // â”€â”€ Simulation loading & feedback states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepText, setSimStepText] = useState("");
  const [hasSimulated, setHasSimulated] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Sync when URL query param changes
  useEffect(() => {
    if (rawOrderParam) {
      setSelectedOrderId(rawOrderParam);
    }
  }, [rawOrderParam]);

  // â”€â”€ Active order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const order =
    DEMO_ORDERS.find((o) => o.id === selectedOrderId.toLowerCase()) ?? DEMO_ORDERS[0];

  // â”€â”€ Dynamic simulation calculations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addedCapacityHours =
    overtimeHours * 12 +
    extraWorkers * 40 +
    extendedDays * 16 +
    (enableOutsource ? 60 : 0) +
    (enableSplitDelivery ? 24 : 0);

  const calculatedReduction = Math.min(50, Math.round(addedCapacityHours * 0.38));
  const newUtilization = Math.max(48, order.baseUtilization - calculatedReduction);

  const newStatus: "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" =
    newUtilization > 100
      ? "NOT_FEASIBLE"
      : newUtilization > 85
      ? "AT_RISK"
      : "FEASIBLE";

  // â”€â”€ Cost calculations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const overtimeCostPerHour = 30_000;
  const workerDailyRate = 140_000;
  const outsourceCost = 450_000;
  const splitDeliveryCost = 200_000;

  const totalCost =
    overtimeHours * 4 * 3 * overtimeCostPerHour +
    extraWorkers * 5 * workerDailyRate +
    (enableOutsource ? outsourceCost : 0) +
    (enableSplitDelivery ? splitDeliveryCost : 0);

  const netProtectedRevenue = order.orderValue - totalCost;
  const costRatio = ((totalCost / order.orderValue) * 100).toFixed(1);

  // â”€â”€ Status color helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const statusColor = {
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
      badge: "bg-amber-200 text-amber-900",
    },
    NOT_FEASIBLE: {
      border: "border-rose-300",
      bg: "bg-rose-50/50",
      text: "text-rose-900",
      badge: "bg-rose-200 text-rose-900",
    },
  };
  const newColors = statusColor[newStatus];
  const baseColors = statusColor[order.baseStatus];

  const statusLabel = {
    FEASIBLE: "âœ… Bisa Dikerjakan",
    AT_RISK: "âš ï¸ Masih Perlu Perhatian",
    NOT_FEASIBLE: "ðŸ”´ Belum Sanggup",
  };

  function triggerInteractiveSimulation() {
    setIsSimulating(true);
    setSimStepText("Mengkalkulasi jam kerja lembur & beban mesin...");
    setHasSimulated(false);

    setTimeout(() => {
      setSimStepText("Menguji toleransi bottleneck & ketersediaan stok...");
    }, 350);

    setTimeout(() => {
      setSimStepText("Menghitung proyeksi margin laba & buffer hari...");
    }, 700);

    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 1050);
  }

  function resetAll() {
    setOvertimeHours(0);
    setExtraWorkers(0);
    setExtendedDays(0);
    setEnableOutsource(false);
    setEnableSplitDelivery(false);
    setAppliedSuccess(false);
    triggerInteractiveSimulation();
  }

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* â”€â”€ Header Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-700 dark:text-blue-400 transition-colors">
                Dasbor
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-50 font-semibold">Simulasi Pesanan (What-If)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
              Uji Solusi Kapasitas Sebelum Mengiyakan Pesanan
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Uji perubahan shift lembur, penambahan pekerja freelance, atau negosiasi deadline secara
              deterministik sebelum deal dengan pelanggan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:bg-slate-700/50 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Daftar Pesanan</span>
            </Link>
            <Link
              href="/production-planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Jadwal Produksi</span>
            </Link>
          </div>
        </div>

        {/* â”€â”€ 2-Column Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* â”€â”€ Controls Column (5 cols) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Variabel Intervensi Skenario</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Geser parameter untuk melihat respon kapasitas</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:text-blue-400 border border-blue-200">
                âœ¨ What-If Sandbox
              </span>
            </div>

            {/* Order Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-700 dark:text-blue-400">receipt_long</span>
                Pilih pesanan sasaran simulasi:
              </label>
              <select
                value={selectedOrderId.toLowerCase()}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setAppliedSuccess(false);
                  triggerInteractiveSimulation();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {DEMO_ORDERS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({o.desc} â€” {o.statusLabel})
                  </option>
                ))}
              </select>

              {/* Current bottleneck hint */}
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="material-symbols-outlined text-[15px] text-amber-600 flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  <strong>Bottleneck Awal:</strong> {order.baseBottleneck}
                </span>
              </div>
            </div>

            {/* â”€â”€ Slider: Overtime â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <SliderControl
              icon="more_time"
              label="Jam Lembur Staf Produksi"
              sublabel="per hari kerja"
              value={overtimeHours}
              min={0}
              max={OVERTIME_MAX}
              step={1}
              unit="Jam/Hari"
              prefix="+"
              ticks={["0 jam", "+1", "+2", "+3", "+4 (maks)"]}
              onChange={(val) => {
                setOvertimeHours(val);
                setAppliedSuccess(false);
              }}
              costNote={
                overtimeHours > 0
                  ? `+Rp ${(overtimeHours * 4 * 3 * 30000).toLocaleString("id-ID")} estimasi upah lembur`
                  : undefined
              }
            />

            {/* â”€â”€ Slider: Extra Workers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <SliderControl
              icon="group_add"
              label="Tenaga Kerja Lepas Harian"
              sublabel="rekrut freelance perakitan/kemasan"
              value={extraWorkers}
              min={0}
              max={WORKERS_MAX}
              step={1}
              unit="Orang"
              prefix="+"
              ticks={["0 orang", "+1 orang", "+2 orang", "+3 orang"]}
              onChange={(val) => {
                setExtraWorkers(val);
                setAppliedSuccess(false);
              }}
              costNote={
                extraWorkers > 0
                  ? `+Rp ${(extraWorkers * 5 * 140000).toLocaleString("id-ID")} upah harian (5 hari)`
                  : undefined
              }
            />

            {/* â”€â”€ Slider: Deadline Extension â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <SliderControl
              icon="event_repeat"
              label="Negosiasi Perpanjangan Deadline"
              sublabel="minta toleransi tambahan waktu ke klien"
              value={extendedDays}
              min={0}
              max={DEADLINE_MAX}
              step={1}
              unit="Hari Kerja"
              prefix="+"
              ticks={["0 hari", "+1", "+2", "+3", "+4", "+5", "+6", "+7 hari"]}
              onChange={(val) => {
                setExtendedDays(val);
                setAppliedSuccess(false);
              }}
              costNote={extendedDays > 0 ? "Tanpa biaya upah langsung (zero-cost)" : undefined}
              costNoteColor="text-emerald-600"
            />

            {/* â”€â”€ Toggle: Outsource â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <ToggleControl
              icon="handshake"
              label="Outsource ke Mitra Workshop"
              sublabel="Kirim komponen/pola potong ke rekanan"
              cost="Rp 450.000"
              checked={enableOutsource}
              onChange={(val) => {
                setEnableOutsource(val);
                setAppliedSuccess(false);
              }}
            />

            {/* â”€â”€ Toggle: Split Delivery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <ToggleControl
              icon="local_shipping"
              label="Pengiriman Bertahap (Split 2 Termin)"
              sublabel="Kirim 50% lebih awal, sisa menyusul agar stasiun kerja tidak menumpuk"
              cost="Rp 200.000"
              checked={enableSplitDelivery}
              onChange={(val) => {
                setEnableSplitDelivery(val);
                setAppliedSuccess(false);
              }}
              badgeLabel="Pilihan Utama Hampers B2B"
            />

            {/* Action Buttons: Run Simulation & Reset */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={triggerInteractiveSimulation}
                disabled={isSimulating}
                className="w-full py-3 px-4 rounded-xl bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSimulating ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Menghitung Ulang Skenario...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>Uji Ulang Simulasi Sekarang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetAll}
                className="w-full py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Reset ke Kondisi Tanpa Solusi
              </button>
            </div>
          </div>

          {/* â”€â”€ Result & Comparison Column (7 cols) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Simulation Loading Banner */}
            {isSimulating && (
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-950">Engine Simulasi Aktif</h4>
                    <p className="text-xs text-blue-800 mt-0.5">{simStepText}</p>
                  </div>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: "80%" }} />
                </div>
              </div>
            )}

            {/* Before vs After Comparison Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Hasil Evaluasi Perbandingan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status kelayakan sebelum vs sesudah intervensi skenario
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Simulasi Deterministik</span>
                </span>
              </div>

              {/* Side-by-side Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Box */}
                <div className={`p-5 rounded-2xl border space-y-3 ${baseColors.border} ${baseColors.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${baseColors.text}`}>
                      Sebelum Intervensi
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
                    <div>â€¢ {order.baseBottleneck}</div>
                    <div>â€¢ Risiko terlambat memenuhi janji kirim</div>
                  </div>
                </div>

                {/* After Box */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 transition-all duration-300 ${newColors.border} ${newColors.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${newColors.text}`}>
                      Hasil Skenario Simulasi
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
                    <div>â€¢ Tambahan kapasitas total: +{addedCapacityHours} jam kerja</div>
                    <div>
                      â€¢ Status:{" "}
                      {newStatus === "FEASIBLE"
                        ? "âœ… Aman, memiliki buffer waktu aman"
                        : newStatus === "AT_RISK"
                        ? "âš ï¸ Lebih baik, pantau ketersediaan bahan"
                        : "ðŸ”´ Masih perlu tambahan solusi pekerja"}
                    </div>
                    {enableSplitDelivery && (
                      <div>â€¢ ðŸšš Pengiriman dibagi 2 termin â€” beban batch lebih merata</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-50">Perbandingan Beban Kapasitas:</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">Ambang Batas Aman UMKM â‰¤ 85%</span>
                </div>
                <div className="space-y-2">
                  {/* Baseline bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Sebelum Solusi</span>
                      <span className="font-mono">{order.baseUtilization}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: "85%" }}
                      />
                      <div
                        className={`h-full rounded-full ${
                          order.baseUtilization > 100
                            ? "bg-rose-500"
                            : order.baseUtilization > 85
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(order.baseUtilization, 100)}%`, opacity: 0.4 }}
                      />
                    </div>
                  </div>
                  {/* After bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Setelah Solusi Diterapkan</span>
                      <span className="font-mono font-bold">{newUtilization}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                        style={{ left: "85%" }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          newUtilization > 100
                            ? "bg-rose-500"
                            : newUtilization > 85
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(newUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>0% (Kosong)</span>
                  <span className="text-red-500 font-bold">85% (Batas Aman)</span>
                  <span>100% (Overload)</span>
                </div>
              </div>
            </div>

            {/* â”€â”€ Financial Impact Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">payments</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">Kalkulasi Dampak Finansial &amp; Margin</h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Kalkulator Deterministik</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                  <span className="block text-slate-500 dark:text-slate-400 text-[11px]">Nilai Kontrak Pesanan:</span>
                  <strong className="block text-sm font-mono text-slate-900 dark:text-slate-50 mt-1">
                    Rp {order.orderValue.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="block text-rose-800 text-[11px]">Biaya Solusi Tambahan:</span>
                  <strong className="block text-sm font-mono text-rose-700 mt-1">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block text-emerald-800 text-[11px]">Pendapatan Terlindungi:</span>
                  <strong
                    className={`block text-sm font-mono mt-1 ${
                      netProtectedRevenue >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    Rp {netProtectedRevenue.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Cost ratio insight */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">lightbulb</span>
                <p className="leading-relaxed">
                  <strong>Rekomendasi Keputusan:</strong>{" "}
                  {totalCost === 0 ? (
                    "Belum ada biaya intervensi. Sesuaikan slider lembur atau pekerja di sebelah kiri."
                  ) : (
                    <>
                      Biaya skenario ini hanya <strong>{costRatio}%</strong> dari total nilai pesanan.{" "}
                      {parseFloat(costRatio) < 20
                        ? "Sangat menguntungkan untuk mengamankan pesanan tanpa risiko keterlambatan."
                        : "Pertimbangkan margin produk sebelum menyetujui biaya lembur/pekerja ekstra."}
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
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 self-center">Solusi aktif:</span>
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
                      ðŸšš Split delivery
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Pesanan sasaran:{" "}
                  <strong className="font-mono text-slate-900 dark:text-slate-50 uppercase">{selectedOrderId}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsApplying(true);
                    setTimeout(() => {
                      setIsApplying(false);
                      setAppliedSuccess(true);
                    }, 600);
                  }}
                  disabled={isApplying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-70 cursor-pointer"
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
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">
                      verified
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-blue-900">
                        Catatan Skenario Berhasil Disimpan â€” Pesanan {selectedOrderId.toUpperCase()}
                      </h5>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Skenario tersimpan:{" "}
                        {[
                          overtimeHours > 0 && `+${overtimeHours}j lembur`,
                          extraWorkers > 0 && `+${extraWorkers} pekerja`,
                          extendedDays > 0 && `+${extendedDays} hari deadline`,
                          enableOutsource && "outsource mitra",
                          enableSplitDelivery && "split delivery 2 termin",
                        ]
                          .filter(Boolean)
                          .join(", ") || "Kondisi reguler"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/orders/${selectedOrderId.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
                  >
                    <span>Buka Detail PO</span>
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

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-blue-700 dark:text-blue-400">{icon}</span>
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-slate-50 block">{label}</label>
            {sublabel && <span className="text-[10px] text-slate-500 dark:text-slate-400">{sublabel}</span>}
          </div>
        </div>
        <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 flex-shrink-0">
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
        className="w-full accent-blue-700 dark:accent-blue-400 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      {costNote && <p className={`text-[11px] font-medium ${costNoteColor}`}>{costNote}</p>}
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
        checked ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm" : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span
            className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${
              checked ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold ${checked ? "text-slate-900 dark:text-slate-50" : "text-slate-900 dark:text-slate-50"}`}>
                {label}
              </span>
              {badgeLabel && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                  {badgeLabel}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{sublabel}</span>
            <span
              className={`text-[11px] font-bold mt-1 block ${
                checked ? "text-rose-600" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {checked ? `+ ${cost} biaya tambahan` : `Biaya: ${cost}`}
            </span>
          </div>
        </div>
        {/* Toggle switch visual */}
        <div
          className={`w-11 h-6 rounded-full flex items-center transition-colors duration-200 flex-shrink-0 mt-0.5 ${
            checked ? "bg-blue-700 dark:bg-blue-600" : "bg-slate-200"
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
          <p className="text-sm text-slate-500 dark:text-slate-400">Memuat simulator kapasitas...</p>
        </div>
      }
    >
      <SimulationContent />
    </Suspense>
  );
}


