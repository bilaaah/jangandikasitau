"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  qty: number;
  station: "mixing" | "baking" | "assembly" | "packaging";
  startDay: number; // 0=Senin, 1=Selasa, 2=Rabu, 3=Kamis, 4=Jumat, 5=Sabtu
  spanDays: number;
  status: "completed" | "in_progress" | "at_risk" | "scheduled";
  progress: number;
  operator: string;
  isCapacityLocked: boolean; // Sesuai aturan: hanya pesanan CONFIRMED & IN_PROGRESS yang mengunci kapasitas
}

interface ProductionPlanningViewProps {
  initialDbOrders?: any[];
}

function getDynamicDays() {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return dayNames.map((name, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return {
      index,
      name,
      date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
    };
  });
}

const STATIONS = [
  { id: "mixing", name: "1. Mixing & Dough Prep", totalHours: 40, usedHours: 26, color: "bg-blue-500", lightColor: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "baking", name: "2. Oven Baking & Proofing", totalHours: 48, usedHours: 42, color: "bg-amber-500", lightColor: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "assembly", name: "3. Assembly & Hias", totalHours: 40, usedHours: 28, color: "bg-purple-500", lightColor: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "packaging", name: "4. Packaging & Box Wrapping", totalHours: 36, usedHours: 34.5, color: "bg-rose-500", lightColor: "bg-rose-50 border-rose-200 text-rose-700" },
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: "SCH-01",
    orderId: "BC-1024",
    customer: "PT Nusantara Sentosa",
    product: "Hampers Lebaran Royale",
    qty: 300,
    station: "packaging",
    startDay: 2,
    spanDays: 3,
    status: "at_risk",
    progress: 40,
    operator: "Budi & Tim Packing (3 Org)",
    isCapacityLocked: true,
  },
  {
    id: "SCH-02",
    orderId: "BC-1023",
    customer: "Ibu Ratna Catering",
    product: "Signature Brownies Panggang",
    qty: 120,
    station: "baking",
    startDay: 0,
    spanDays: 2,
    status: "in_progress",
    progress: 75,
    operator: "Chef Aris (Oven Utama)",
    isCapacityLocked: true,
  },
  {
    id: "SCH-03",
    orderId: "BC-1022",
    customer: "Kopi Selaras Cafe",
    product: "Artisan Croissants (Laminasi)",
    qty: 500,
    station: "mixing",
    startDay: 1,
    spanDays: 2,
    status: "completed",
    progress: 100,
    operator: "Ahmad Fauzi (Sheeter)",
    isCapacityLocked: true,
  },
];

export function ProductionPlanningView({ initialDbOrders }: ProductionPlanningViewProps) {
  const DAYS = useMemo(() => getDynamicDays(), []);

  const initialSchedule = useMemo<ScheduleItem[]>(() => {
    if (initialDbOrders && initialDbOrders.length > 0) {
      return initialDbOrders.map((o, idx) => {
        const item = o.items?.[0];
        const analysis = o.capacityAnalyses?.[0];
        const prodName = item?.product?.name?.toLowerCase() || "";

        let station: "mixing" | "baking" | "assembly" | "packaging" = "baking";
        if (prodName.includes("box") || prodName.includes("hampers") || prodName.includes("packaging")) {
          station = "packaging";
        } else if (prodName.includes("croissant") || prodName.includes("dough") || prodName.includes("adonan")) {
          station = "mixing";
        } else if (prodName.includes("cake") || prodName.includes("tart") || prodName.includes("hias")) {
          station = "assembly";
        } else {
          station = (["packaging", "baking", "assembly", "mixing"] as const)[idx % 4];
        }

        const isLocked = o.status === "CONFIRMED" || o.status === "IN_PROGRESS";
        const isAtRisk = analysis?.status === "AT_RISK" || analysis?.status === "NOT_FEASIBLE";
        const status: "completed" | "in_progress" | "at_risk" | "scheduled" =
          o.status === "COMPLETED"
            ? "completed"
            : isAtRisk
              ? "at_risk"
              : o.status === "IN_PROGRESS"
                ? "in_progress"
                : "scheduled";

        const progress = o.status === "COMPLETED" ? 100 : o.status === "IN_PROGRESS" ? 65 : o.status === "CONFIRMED" ? 30 : 0;
        const operatorNames = [
          "Budi & Tim Packing",
          "Chef Aris (Oven Utama)",
          "Chef Maya (Dekorator)",
          "Ahmad Fauzi (Sheeter)",
        ];

        return {
          id: `SCH-${String(idx + 1).padStart(2, "0")}`,
          orderId: o.id,
          customer: o.customerName || "Pelanggan",
          product: item?.product?.name || "Produk Custom",
          qty: item?.quantity ?? 1,
          station,
          startDay: idx % 5,
          spanDays: Math.min(3, Math.max(1, analysis?.estimatedProductionDays ?? 2)),
          status,
          progress,
          operator: operatorNames[idx % operatorNames.length],
          isCapacityLocked: isLocked,
        };
      });
    }
    return DEFAULT_SCHEDULE;
  }, [initialDbOrders]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [onlyLockedCapacity, setOnlyLockedCapacity] = useState<boolean>(false);

  const filteredSchedule = schedule.filter((item) => {
    if (selectedStation !== "all" && item.station !== selectedStation) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (onlyLockedCapacity && !item.isCapacityLocked) return false;
    return true;
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Operasional</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Jadwal Gantt Multi-Stasiun</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            Jadwal Produksi Mingguan
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pantau alokasi mesin dan operator secara visual untuk mencegah bentrok jadwal sebelum PO dikonfirmasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Simulasi What-If</span>
          </Link>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Cek PO Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Kapasitas Terpakai</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {schedule.length > 0 ? Math.min(100, Math.round((schedule.filter(s => s.isCapacityLocked).length / Math.max(1, schedule.length)) * 85)) : 0}%
            </span>
            <span className={`text-xs font-bold ${
              schedule.some(s => s.status === "at_risk")
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {schedule.some(s => s.status === "at_risk") ? "Perlu Review" : "Optimal"}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                schedule.some(s => s.status === "at_risk") ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{
                width: `${schedule.length > 0 ? Math.min(100, Math.round((schedule.filter(s => s.isCapacityLocked).length / Math.max(1, schedule.length)) * 85)) : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Titik Macet Aktif</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {schedule.filter(s => s.status === "at_risk").length} Batch
            </span>
            <span className="text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold border border-rose-200 dark:border-rose-800">
              {schedule.some(s => s.status === "at_risk") ? "At-Risk" : "Nihil"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {schedule.some(s => s.status === "at_risk")
              ? "Perlu solusi lembur atau freelance"
              : "Semua batch dalam buffer aman"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pesanan Berjalan</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {schedule.length} PO
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Pekan Ini</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {schedule.filter(s => s.isCapacityLocked).length} Terkunci • {schedule.filter(s => !s.isCapacityLocked).length} Rencana
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Rasio Tepat Waktu (OTD)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">98.5%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Target &gt;95%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Akurasi janji kapasitas terjaga</p>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Workstation Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Filter Stasiun:</span>
          <button
            onClick={() => setSelectedStation("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStation === "all"
                ? "bg-blue-700 dark:bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-600"
            }`}
          >
            Semua Stasiun
          </button>
          {STATIONS.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStation === st.id
                  ? "bg-blue-700 dark:bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-600"
              }`}
            >
              {st.name.split(". ")[1]}
            </button>
          ))}
        </div>

        {/* Status Filter & Locked Capacity Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyLockedCapacity(!onlyLockedCapacity)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              onlyLockedCapacity
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {onlyLockedCapacity ? "lock" : "lock_open"}
            </span>
            <span>{onlyLockedCapacity ? "🔒 Hanya Kapasitas Terkunci (Aktif)" : "Semua (Terkunci & Draft)"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="at_risk">⚠️ Perlu Tindakan / At-Risk</option>
              <option value="in_progress">▶️ Sedang Diproduksi</option>
              <option value="scheduled">📅 Terjadwal</option>
              <option value="completed">✅ Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Banner: Rule Kapasitas Terkunci */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 shrink-0">info</span>
        <span>
          <strong>Aturan Kapasitas UMKM:</strong> Hanya pesanan berstatus <strong>CONFIRMED</strong> dan <strong>IN_PROGRESS</strong> yang mengunci slot mesin &amp; jam staf secara permanen. Pesanan baru berstatus simulasi/draft tidak memblokir kuota.
        </span>
      </div>

      {/* Visual Gantt Chart Table with Horizontal Scroll for Mobile */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {/* Gantt Header */}
            <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="col-span-4 p-3.5 border-r border-slate-200 dark:border-slate-700">
                Workstation / Antrean Batch
              </div>
              <div className="col-span-8 grid grid-cols-6 divide-x divide-slate-200 dark:divide-slate-700">
                {DAYS.map((d) => (
                  <div key={d.index} className="p-3 text-center">
                    <span className="block font-bold text-slate-800 dark:text-slate-200">{d.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

        {/* Gantt Rows per Workstation */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {STATIONS.filter((st) => selectedStation === "all" || st.id === selectedStation).map((station) => {
            const stationItems = filteredSchedule.filter((item) => item.station === station.id);
            const utilPct = Math.round((station.usedHours / station.totalHours) * 100);
            const isOverloaded = utilPct >= 90;

            return (
              <div key={station.id} className="grid grid-cols-12 min-h-[105px]">
                {/* Station Info Column */}
                <div className="col-span-4 p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{station.name}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isOverloaded
                            ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {utilPct}% Terpakai
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Kapasitas: {station.usedHours}j / {station.totalHours}j terpakai
                    </p>
                  </div>

                  {isOverloaded && (
                    <div className="mt-2 text-[11px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>Kapasitas kritis! Disarankan lembur atau re-route.</span>
                    </div>
                  )}
                </div>

                {/* Days Grid Column */}
                <div className="col-span-8 relative p-2 bg-white dark:bg-slate-800 min-h-[110px] flex flex-col justify-center">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 grid grid-cols-6 divide-x divide-slate-200 dark:divide-slate-700 pointer-events-none">
                    {DAYS.map((d) => (
                      <div key={d.index} className="h-full" />
                    ))}
                  </div>

                  {/* Schedule Bars Layer */}
                  <div className="relative z-10 flex flex-col gap-2.5 py-1.5 pointer-events-none w-full">
                    {stationItems.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 dark:text-slate-500 italic py-4">
                        Tidak ada antrean pesanan di stasiun ini.
                      </div>
                    ) : (
                      stationItems.map((item) => {
                        const leftPercent = (item.startDay / 6) * 100;
                        const widthPercent = (item.spanDays / 6) * 100 - 1.5;

                        return (
                          <div
                            key={item.id}
                            style={{
                              marginLeft: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            onClick={() => setSelectedItem(item)}
                            className={`pointer-events-auto cursor-pointer p-2.5 rounded-xl text-left shadow-xs border transition-all hover:scale-[1.01] hover:shadow-md ${
                              item.status === "at_risk"
                                ? "bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400 dark:ring-rose-700"
                                : item.status === "completed"
                                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                : item.status === "in_progress"
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200"
                                : "bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="font-extrabold truncate flex items-center gap-1.5" title={`${item.customer} • ${item.product}`}>
                                {item.isCapacityLocked && (
                                  <span className="text-[10px]" title="Kapasitas Terkunci (PO Terkonfirmasi)">🔒</span>
                                )}
                                <span>{item.customer}</span>
                                <span className="opacity-75 font-normal truncate">• {item.product}</span>
                              </span>
                              {item.status === "at_risk" && (
                                <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                  RISK
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>{item.qty} pcs</span>
                              <span className="font-mono">{item.progress}%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.status === "at_risk"
                                    ? "bg-rose-600"
                                    : item.status === "completed"
                                    ? "bg-emerald-600"
                                    : "bg-blue-600"
                                }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

      {/* Selected Item Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">{selectedItem.id}</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                  {selectedItem.orderId} — {selectedItem.customer}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Produk</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">{selectedItem.product}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Kuantitas</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">{selectedItem.qty} Unit</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Stasiun</span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {STATIONS.find((s) => s.id === selectedItem.station)?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Operator PIC</span>
                  <strong className="text-slate-900 dark:text-slate-100">{selectedItem.operator}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Status Alokasi Kapasitas:</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    selectedItem.isCapacityLocked
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
                  }`}>
                    <span>{selectedItem.isCapacityLocked ? "🔒" : "⏳"}</span>
                    <span>{selectedItem.isCapacityLocked ? "Kapasitas Terkunci (PO Terkonfirmasi)" : "Belum Mengunci (Draft/Simulasi)"}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Progres Penyelesaian ({selectedItem.progress}%)
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedItem.status === "at_risk" ? "bg-rose-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${selectedItem.progress}%` }}
                  />
                </div>
              </div>

              {selectedItem.status === "at_risk" && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Peringatan DSS: Bottleneck Terdeteksi!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Stasiun packaging kehabisan buffer waktu sebelum deadline pengiriman.
                    Rekomendasi tindakan: Tambah shift lembur atau aktifkan pekerja freelance packing.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Tutup
              </button>
              {selectedItem.status === "at_risk" ? (
                <Link
                  href={`/simulations?order=${selectedItem.orderId}`}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  <span>Buka Solusi What-If</span>
                </Link>
              ) : (
                <Link
                  href={`/orders/${selectedItem.orderId}`}
                  className="px-4 py-2 rounded-xl bg-blue-700 dark:bg-blue-600 text-white text-xs font-bold hover:bg-blue-800 dark:hover:bg-blue-500 shadow-sm transition-all"
                >
                  Detail Order
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
