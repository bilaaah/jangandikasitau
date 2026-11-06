"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface OrderItemData {
  id: string;
  orderNumber: string;
  poNumber: string;
  clientName: string;
  clientType: string;
  productName: string;
  quantityText: string;
  skuDetails: string;
  deadlineText: string;
  remainingText: string;
  urgencyLevel: "critical" | "warning" | "normal" | "completed";
  capacityStatus: "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" | "DRAFT";
  capacityDetail: string;
  productionStatus: "draft" | "planned" | "in_progress" | "completed";
  productionStatusLabel: string;
  progressPercent: number;
  productionNote: string;
  hasBottleneck: boolean;
  bottleneckStation?: string;
  bottleneckDeficit?: string;
}

const DEFAULT_SAMPLE_ORDERS: OrderItemData[] = [
  {
    id: "bc-1024",
    orderNumber: "BC-1024",
    poNumber: "PO-2026-881",
    clientName: "PT Nusantara Sentosa",
    clientType: "Corporate B2B • Jakarta",
    productName: "Custom Gift Boxes",
    quantityText: "300 box",
    skuDetails: "4 SKU Set",
    deadlineText: "24 Okt 2026, 17:00",
    remainingText: "Sisa 48 jam (Kritis)",
    urgencyLevel: "critical",
    capacityStatus: "AT_RISK",
    capacityDetail: "Packaging bottleneck: Kurang 8 jam pada line perakitan box",
    productionStatus: "planned",
    productionStatusLabel: "Terjadwal (Planned)",
    progressPercent: 35,
    productionNote: "Kesiapan Bahan: 100%",
    hasBottleneck: true,
    bottleneckStation: "Perakitan Box & Packing",
    bottleneckDeficit: "Kurang 8 jam kerja",
  },
  {
    id: "bc-1023",
    orderNumber: "BC-1023",
    poNumber: "PO-2026-880",
    clientName: "Ibu Ratna Catering",
    clientType: "Repeat Regular • Depok",
    productName: "Signature Brownies",
    quantityText: "120 box",
    skuDetails: "Fudgy Almond",
    deadlineText: "23 Okt 2026, 12:00",
    remainingText: "Sisa 20 jam",
    urgencyLevel: "normal",
    capacityStatus: "FEASIBLE",
    capacityDetail: "Semua stasiun aman (Mixer, Deck Oven #2, Packing)",
    productionStatus: "in_progress",
    productionStatusLabel: "Dalam Proses (In Progress)",
    progressPercent: 70,
    productionNote: "Baking Tahap 2 selesai",
    hasBottleneck: false,
  },
  {
    id: "bc-1022",
    orderNumber: "BC-1022",
    poNumber: "PO-2026-879",
    clientName: "Kopi Selaras Cafe",
    clientType: "Daily Contract • Jaksel",
    productName: "Artisan Croissants",
    quantityText: "500 pcs",
    skuDetails: "Butter Plain",
    deadlineText: "25 Okt 2026, 06:00",
    remainingText: "Sisa 62 jam",
    urgencyLevel: "normal",
    capacityStatus: "FEASIBLE",
    capacityDetail: "Baking & laminating pas (Utilisasi Sheeter 82%)",
    productionStatus: "in_progress",
    productionStatusLabel: "Dalam Proses (In Progress)",
    progressPercent: 50,
    productionNote: "Proofing & Cold Ferment",
    hasBottleneck: false,
  },
  {
    id: "bc-1021",
    orderNumber: "BC-1021",
    poNumber: "PO-2026-878",
    clientName: "Wedding Organizer Lestari",
    clientType: "Custom Project • Tangerang",
    productName: "Royal Tier Wedding Cake",
    quantityText: "1 tier (Fondant)",
    skuDetails: "40cm Tinggi",
    deadlineText: "26 Okt 2026, 09:00",
    remainingText: "Sisa 88 jam",
    urgencyLevel: "critical",
    capacityStatus: "NOT_FEASIBLE",
    capacityDetail: "Kapasitas chef dekorasi penuh (Overbooked 140%)",
    productionStatus: "draft",
    productionStatusLabel: "Draft Status",
    progressPercent: 0,
    productionNote: "Jangan terima DP sebelum simulasi!",
    hasBottleneck: true,
    bottleneckStation: "Meja Dekorasi Fondant",
    bottleneckDeficit: "Defisit 12 jam artisan",
  },
  {
    id: "bc-1020",
    orderNumber: "BC-1020",
    poNumber: "PO-2026-877",
    clientName: "Toko Roti Berkah",
    clientType: "Distributor Mitra • Bekasi",
    productName: "Choco Banana Bread",
    quantityText: "250 loaves",
    skuDetails: "Kemasan Retail",
    deadlineText: "26 Okt 2026, 14:00",
    remainingText: "Sisa 94 jam",
    urgencyLevel: "normal",
    capacityStatus: "FEASIBLE",
    capacityDetail: "Jadwal oven deck shift pagi dialokasikan",
    productionStatus: "planned",
    productionStatusLabel: "Terjadwal (Planned)",
    progressPercent: 15,
    productionNote: "Bahan baku sudah ready",
    hasBottleneck: false,
  },
  {
    id: "bc-1019",
    orderNumber: "BC-1019",
    poNumber: "PO-2026-876",
    clientName: "PT Digital Kreatif",
    clientType: "Corporate Agency • Jaksel",
    productName: "Custom Merch Hampers",
    quantityText: "150 sets",
    skuDetails: "Cookies & Mug",
    deadlineText: "22 Okt 2026, 16:00",
    remainingText: "Tuntas Sesuai Target",
    urgencyLevel: "completed",
    capacityStatus: "FEASIBLE",
    capacityDetail: "Selesai 4 jam lebih cepat dari jadwal",
    productionStatus: "completed",
    productionStatusLabel: "Selesai (Completed)",
    progressPercent: 100,
    productionNote: "Siap di-pickup kurir",
    hasBottleneck: false,
  },
];

interface OrdersDashboardViewProps {
  initialDbOrders?: any[];
}

/** Hitung sisa hari dari sekarang ke deadline */
function getRemainingText(deadline: string | Date): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`;
  if (diffDays === 0) return "Deadline hari ini!";
  if (diffDays === 1) return "Besok — KRITIS";
  if (diffDays <= 3) return `Sisa ${diffDays} hari (Kritis)`;
  return `Sisa ${diffDays} hari`;
}

function getUrgencyLevel(deadline: string | Date, capStatus: string, orderStatus: string): "critical" | "warning" | "normal" | "completed" {
  if (orderStatus === "COMPLETED") return "completed";
  const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || capStatus === "NOT_FEASIBLE") return "critical";
  if (diffDays <= 2 || capStatus === "AT_RISK") return "warning";
  return "normal";
}

export function OrdersDashboardView({ initialDbOrders }: OrdersDashboardViewProps) {
  const [orders, setOrders] = useState<OrderItemData[]>(() => {
    if (initialDbOrders && initialDbOrders.length > 0) {
      // Map DB orders to view items — HANYA DB data, tidak dicampur sample
      const mappedDb: OrderItemData[] = initialDbOrders.map((o) => {
        const item = o.items?.[0];
        const analysis = o.capacityAnalyses?.[0];
        const statusMap = {
          FEASIBLE: "FEASIBLE",
          AT_RISK: "AT_RISK",
          NOT_FEASIBLE: "NOT_FEASIBLE",
        };
        const capStatus = (statusMap[analysis?.status as keyof typeof statusMap] ||
          "DRAFT") as any;

        return {
          id: o.id,
          orderNumber: `BC-${o.id.slice(0, 4).toUpperCase()}`,
          poNumber: `PO-${new Date(o.createdAt).getFullYear()}-${o.id.slice(0, 3)}`,
          clientName: o.customerName || "Customer",
          clientType: "Pelanggan Terdaftar",
          productName: item?.product?.name || "Produk Custom",
          quantityText: `${item?.quantity ?? 1} unit`,
          skuDetails: item?.product?.description || "SKU Standar",
          deadlineText: new Date(o.requiredDeliveryDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          remainingText: getRemainingText(o.requiredDeliveryDate),
          urgencyLevel: getUrgencyLevel(o.requiredDeliveryDate, capStatus, o.status),
          capacityStatus: capStatus,
          capacityDetail:
            analysis?.reasoning?.[0] || "Kalkulasi kapasitas terverifikasi engine.",
          productionStatus: (o.status?.toLowerCase() as any) || "draft",
          productionStatusLabel: o.status || "DRAFT",
          progressPercent: o.status === "COMPLETED" ? 100 : o.status === "IN_PROGRESS" ? 50 : o.status === "CONFIRMED" ? 20 : 0,
          productionNote: analysis ? `Analisis DSS — ${analysis.status}` : "Belum dianalisis",
          hasBottleneck: (analysis?.bottlenecks?.length ?? 0) > 0,
          bottleneckStation: analysis?.bottlenecks?.[0]?.resourceType || undefined,
          bottleneckDeficit: analysis?.bottlenecks?.[0]?.description || undefined,
        };
      });
      // FIX FE-2: hanya tampilkan DB data, bukan campuran dengan sample
      return mappedDb;
    }
    return DEFAULT_SAMPLE_ORDERS;
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [productionFilter, setProductionFilter] = useState("all");

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<OrderItemData | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<string>("overtime");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [suratJalanOrder, setSuratJalanOrder] = useState<OrderItemData | null>(null);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        searchQuery === "" ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCapacity =
        capacityFilter === "all" ||
        order.capacityStatus.toLowerCase() === capacityFilter.toLowerCase();

      const matchProduction =
        productionFilter === "all" ||
        order.productionStatus.toLowerCase() === productionFilter.toLowerCase();

      return matchSearch && matchCapacity && matchProduction;
    });
  }, [orders, searchQuery, capacityFilter, productionFilter]);

  // Counts
  const totalCount = orders.length;
  const feasibleCount = orders.filter((o) => o.capacityStatus === "FEASIBLE").length;
  const atRiskCount = orders.filter((o) => o.capacityStatus === "AT_RISK").length;
  const notFeasibleCount = orders.filter((o) => o.capacityStatus === "NOT_FEASIBLE").length;
  const draftCount = orders.filter((o) => o.capacityStatus === "DRAFT").length;

  const handleOpenSimulation = (order: OrderItemData) => {
    setSelectedOrder(order);
    setSelectedSolution("overtime");
  };

  const handleApplySolution = () => {
    if (!selectedOrder) return;

    // Apply simulation solution: shift to FEASIBLE
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          let updatedDetail = "";
          if (selectedSolution === "overtime") {
            updatedDetail = "Solusi aktif: Lembur +4 jam disetujui (Kapasitas aman 82%)";
          } else if (selectedSolution === "reschedule") {
            updatedDetail = "Solusi aktif: Deadline digeser +1 hari (Kapasitas optimal 76%)";
          } else {
            updatedDetail = "Solusi aktif: 100 pcs dialihkan ke mitra Tangerang (Aman)";
          }

          return {
            ...o,
            capacityStatus: "FEASIBLE",
            capacityDetail: updatedDetail,
            urgencyLevel: "normal",
            hasBottleneck: false,
          };
        }
        return o;
      })
    );

    const orderNum = selectedOrder.orderNumber;
    setSelectedOrder(null);
    setToastMessage(`Simulasi Diterapkan: Rekomendasi solusi untuk ${orderNum} aktif pada sesi ini.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCapacityFilter("all");
    setProductionFilter("all");
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0b1c30] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">
            check_circle
          </span>
          <span className="text-[13px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Command Context Bar */}
      <div className="px-4 sm:px-8 pt-6 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-blue-400 uppercase tracking-widest font-bold">Operasional</span>
            <span className="material-symbols-outlined text-[#64748B] text-[14px]">chevron_right</span>
            <span className="text-[11px] text-slate-600 dark:text-[#94A3B8] font-semibold">Antrean Pesanan</span>
            <span className="material-symbols-outlined text-[#64748B] text-[14px]">chevron_right</span>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">SweetCrumbs Hub Semarang</span>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-3 flex-wrap mt-0.5">
            <h1 className="text-2xl sm:text-[28px] text-slate-900 dark:text-[#F1F5F9] font-extrabold tracking-tight leading-tight">
              Daftar Pesanan
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/[0.12] border border-blue-500/20 text-blue-300 text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
              {totalCount} Pesanan Aktif
            </span>
          </div>

          <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed mt-1">
            Pantau status kapasitas, kesiapan bahan &amp; workstation, serta progres jadwal produksi di seluruh lini.
          </p>
        </div>

        {/* Page Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
          <Link
            href="/orders/new"
            className="btn btn-primary inline-flex items-center gap-2 px-5 h-10 text-[13px]"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>Buat Pesanan Baru</span>
          </Link>
        </div>
      </div>

      {/* ── Metric Cards ──────────────────────────── */}
      <div className="px-4 sm:px-8 pb-5 grid grid-cols-2 lg:grid-cols-5 gap-3">

        {/* All Orders */}
        <div
          onClick={() => setCapacityFilter("all")}
          className={`metric-card metric-all cursor-pointer ${capacityFilter === "all" ? "active metric-all" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={capacityFilter === "all"}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10.5px] text-[#64748B] uppercase font-bold tracking-widest leading-tight">
              Semua<br/>Pesanan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#1D4ED8] text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>inbox</span>
            </div>
          </div>
          <div className="metric-number">{totalCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">total order</p>
        </div>

        {/* Feasible */}
        <div
          onClick={() => setCapacityFilter("feasible")}
          className={`metric-card metric-feasible cursor-pointer ${capacityFilter === "feasible" ? "active" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={capacityFilter === "feasible"}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10.5px] text-[#64748B] uppercase font-bold tracking-widest leading-tight">
              Kapasitas<br/>Aman
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(16,185,129,0.1)'}}>
              <span className="material-symbols-outlined text-[18px]" style={{color: '#10B981', fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            </div>
          </div>
          <div className="metric-number" style={{color: '#059669'}}>{feasibleCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">{Math.round((feasibleCount / (totalCount || 1)) * 100)}% kapasitas aman</p>
        </div>

        {/* At Risk */}
        <div
          onClick={() => setCapacityFilter("at_risk")}
          className={`metric-card metric-at-risk cursor-pointer ${capacityFilter === "at_risk" ? "active" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={capacityFilter === "at_risk"}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10.5px] text-[#64748B] uppercase font-bold tracking-widest leading-tight">
              Perlu<br/>Review
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(245,158,11,0.1)'}}>
              <span className="material-symbols-outlined text-[18px]" style={{color: '#F59E0B', fontVariationSettings: "'FILL' 1"}}>warning</span>
            </div>
          </div>
          <div className="metric-number" style={{color: '#D97706'}}>{atRiskCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">potensi telat</p>
        </div>

        {/* Not Feasible */}
        <div
          onClick={() => setCapacityFilter("not_feasible")}
          className={`metric-card metric-not-feasible cursor-pointer ${capacityFilter === "not_feasible" ? "active" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={capacityFilter === "not_feasible"}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10.5px] text-[#64748B] uppercase font-bold tracking-widest leading-tight">
              Kapasitas<br/>Kurang
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(239,68,68,0.1)'}}>
              <span className="material-symbols-outlined text-[18px]" style={{color: '#EF4444', fontVariationSettings: "'FILL' 1"}}>cancel</span>
            </div>
          </div>
          <div className="metric-number" style={{color: '#DC2626'}}>{notFeasibleCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">kapasitas tidak cukup</p>
        </div>

        {/* Draft */}
        <div
          onClick={() => setCapacityFilter("draft")}
          className={`metric-card metric-draft cursor-pointer col-span-2 lg:col-span-1 ${capacityFilter === "draft" ? "active" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={capacityFilter === "draft"}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[10.5px] text-[#64748B] uppercase font-bold tracking-widest leading-tight">
              Draft<br/>(Menunggu)
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#6B7280] text-[18px]">hourglass_empty</span>
            </div>
          </div>
          <div className="metric-number" style={{color: '#4B5563'}}>{draftCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">butuh validasi</p>
        </div>

      </div>

      {/* Main Filter Bar & Controls */}
      <div className="px-4 sm:px-8 pb-5">
        <div className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan ID Pesanan, Nama Klien, atau Produk..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-[#64748B] text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Kapasitas Dropdown */}
            <div className="relative">
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] text-slate-800 dark:text-[#F1F5F9] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/25 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Kapasitas: Semua</option>
                <option value="feasible" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">FEASIBLE (Aman)</option>
                <option value="at_risk" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">AT RISK (Perlu Review)</option>
                <option value="not_feasible" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">NOT FEASIBLE (Kurang)</option>
                <option value="draft" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Draft</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Produksi Dropdown */}
            <div className="relative">
              <select
                value={productionFilter}
                onChange={(e) => setProductionFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] text-slate-800 dark:text-[#F1F5F9] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/25 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Status: Semua</option>
                <option value="draft" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Draft</option>
                <option value="planned" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Terjadwal (Planned)</option>
                <option value="in_progress" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Dalam Proses</option>
                <option value="completed" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Selesai</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Date Range Picker Pill */}
            <button
              type="button"
              className="h-10 px-4 rounded-xl bg-blue-50 dark:bg-blue-500/[0.12] border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-[13px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/[0.20] transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                date_range
              </span>
              <span>22 Okt - 31 Okt 2026</span>
            </button>

            {/* View Controls / Reset */}
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Semua Filter"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.10] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Card List (visible <md) ───────────────────────── */}
      <div className="px-4 pb-4 md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-[36px] text-[#94A3B8] block mb-2">inbox</span>
            <p className="font-semibold text-sm">Tidak ada pesanan yang sesuai filter.</p>
            <button onClick={handleResetFilters} className="text-sm text-[#2563eb] hover:underline font-medium mt-1">
              Reset Filter
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isAtRisk = order.capacityStatus === "AT_RISK";
            const isNotFeasible = order.capacityStatus === "NOT_FEASIBLE";
            const isFeasible = order.capacityStatus === "FEASIBLE";
            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-xs p-4 space-y-3 ${
                  isNotFeasible ? "border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20"
                  : isAtRisk    ? "border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20"
                  :               "border-slate-200 dark:border-slate-700"
                  
                }`}
              >
                {/* Row 1: Order number + status badge */}
                <div className="flex items-center justify-between">
                  <Link href={`/orders/${order.id}`} className="font-extrabold text-base text-[#004ac6] hover:underline">
                    {order.orderNumber}
                  </Link>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    isFeasible      ? "bg-emerald-100 text-emerald-800"
                    : isAtRisk      ? "bg-amber-100 text-amber-800"
                    : isNotFeasible ? "bg-rose-100 text-rose-800"
                    :                 "bg-slate-100 text-slate-700"
                  }`}>
                    {isFeasible ? "✅ Aman" : isAtRisk ? "⚠️ Perlu Perhatian" : isNotFeasible ? "🔴 Kurang" : "Draft"}
                  </span>
                </div>

                {/* Row 2: Client + product */}
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{order.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{order.productName} • {order.quantityText}</p>
                </div>

                {/* Row 3: Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 dark:text-slate-400">{order.productionStatusLabel}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{order.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        order.progressPercent === 100 ? "bg-emerald-500" : "bg-[#2563eb]"
                      }`}
                      style={{ width: `${order.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Row 4: Deadline + actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] text-[#64748B]">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">schedule</span>
                    {order.deadlineText}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {order.hasBottleneck && (
                      <Link
                        href={`/simulations?order=${order.id}`}
                        className="px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] bg-[#bc4800] hover:bg-[#943700] transition-colors"
                      >
                        Simulasi
                      </Link>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#004ac6] text-[11px] font-semibold hover:bg-[#dbe1ff] transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comprehensive Orders Table (hidden <md, shown md+) */}
      <div className="hidden md:block px-4 sm:px-8">
        <div className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden scroll-hint">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 dark:text-[#94A3B8] text-[10.5px] font-bold uppercase tracking-widest border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.03]">
                  <th className="py-3 pl-6 pr-4">Order ID</th>
                  <th className="py-3 px-4">Klien / Pemesan</th>
                  <th className="py-3 px-4">Produk &amp; Kuantitas</th>
                  <th className="py-3 px-4">Deadline &amp; Sisa Waktu</th>
                  <th className="py-3 px-4">Status Kapasitas</th>
                  <th className="py-3 px-4">Progres Produksi</th>
                  <th className="py-3 pr-6 pl-4 text-right">Tindakan Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-slate-800 dark:text-[#F1F5F9] text-[13px]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-[#94A3B8]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 dark:text-[#64748B] text-[36px]">
                          inbox
                        </span>
                        <p className="font-semibold text-[15px]">Tidak ada pesanan yang sesuai filter.</p>
                        <button
                          onClick={handleResetFilters}
                          className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Reset Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isAtRisk = order.capacityStatus === "AT_RISK";
                    const isNotFeasible = order.capacityStatus === "NOT_FEASIBLE";
                    const isFeasible = order.capacityStatus === "FEASIBLE";

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition-colors group ${
                          isNotFeasible
                            ? "bg-rose-50/60 dark:bg-rose-500/[0.06]"
                            : isAtRisk
                            ? "bg-amber-50/60 dark:bg-amber-500/[0.06]"
                            : ""
                        }`}
                      >
                        {/* Order ID */}
                        <td className="py-4 pl-6 pr-4 align-top">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#64748B] text-[18px] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                              drag_indicator
                            </span>
                            <div>
                              <Link
                                href={`/orders/${order.id}`}
                                className={`font-bold text-[16px] tracking-tight block hover:underline ${
                                  isNotFeasible ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {order.orderNumber}
                              </Link>
                              <span className="text-[11px] text-[#94A3B8] font-mono">
                                {order.poNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4 align-top">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-bold text-slate-900 dark:text-[#F1F5F9] text-[14px] hover:text-blue-600 dark:hover:text-blue-400 hover:underline block"
                          >
                            {order.clientName}
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">
                              business
                            </span>
                            <span>{order.clientType}</span>
                          </div>
                        </td>

                        {/* Product & Qty */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-[13px]">
                            {order.productName}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] text-slate-800 dark:text-[#F1F5F9] font-bold border border-slate-200/80 dark:border-white/[0.06]">
                            <span>{order.quantityText}</span>
                            <span className="text-slate-500 dark:text-[#94A3B8] font-normal">• {order.skuDetails}</span>
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-[13px]">
                            {order.deadlineText}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[11px] font-bold ${
                              order.urgencyLevel === "critical"
                                ? "bg-amber-100 dark:bg-amber-500/[0.15] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/25"
                                : order.urgencyLevel === "completed"
                                ? "bg-emerald-100 dark:bg-emerald-500/[0.15] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25"
                                : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-[#94A3B8] border border-slate-200/80 dark:border-white/[0.06]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {order.urgencyLevel === "critical"
                                ? "alarm"
                                : order.urgencyLevel === "completed"
                                ? "done_all"
                                : "schedule"}
                            </span>
                            <span>{order.remainingText}</span>
                          </div>
                        </td>

                        {/* Capacity Status */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1 max-w-[210px]">
                            {isFeasible && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/[0.15] text-emerald-300 border border-emerald-500/25 text-[11px] font-bold w-fit">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Aman
                              </span>
                            )}
                            {isAtRisk && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/[0.15] text-amber-300 border border-amber-500/25 text-[11px] font-bold w-fit">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                Perlu Perhatian
                              </span>
                            )}
                            {isNotFeasible && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/[0.15] text-rose-300 border border-rose-500/25 text-[11px] font-bold w-fit">
                                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                Kapasitas Kurang
                              </span>
                            )}
                            <span
                              className={`text-[11px] leading-tight mt-0.5 ${
                                isNotFeasible
                                  ? "text-rose-400 font-medium"
                                  : isAtRisk
                                  ? "text-amber-400"
                                  : "text-[#94A3B8]"
                              }`}
                            >
                              {order.capacityDetail}
                            </span>
                          </div>
                        </td>

                        {/* Production Progress */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`font-semibold ${
                                  order.progressPercent === 100
                                    ? "text-emerald-400"
                                    : "text-blue-400"
                                }`}
                              >
                                {order.productionStatusLabel}
                              </span>
                              <span className="font-mono font-bold text-[#94A3B8]">
                                {order.progressPercent}%
                              </span>
                            </div>
                            <div className="w-28 bg-slate-200 dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  order.progressPercent === 100
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${order.progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-[#94A3B8]">
                              {order.productionNote}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-6 pl-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.hasBottleneck && (
                              <Link
                                href={`/simulations?order=${order.id}`}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] transition-all shadow-xs ${
                                  isNotFeasible
                                    ? "bg-rose-600 hover:bg-rose-500"
                                    : "bg-amber-600 hover:bg-amber-500"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  auto_fix_high
                                </span>
                                <span>Simulasi Solusi</span>
                              </Link>
                            )}

                            {order.progressPercent === 100 && (
                              <button
                                type="button"
                                onClick={() => setSuratJalanOrder(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/[0.15] text-emerald-300 hover:bg-emerald-500/[0.25] text-[11px] font-semibold transition-colors border border-emerald-500/25"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  receipt
                                </span>
                                <span>Surat Jalan</span>
                              </button>
                            )}

                            <Link
                              href={`/orders/${order.id}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#F1F5F9] text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-white/[0.10] border border-slate-200 dark:border-white/[0.08] transition-colors"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-4 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#94A3B8] text-[12px]">
              <span>
                Menampilkan <strong className="text-slate-900 dark:text-[#F1F5F9] font-bold">1-{filteredOrders.length}</strong> dari{" "}
                <strong className="text-slate-900 dark:text-[#F1F5F9] font-bold">{totalCount}</strong> pesanan
              </span>
              <span>•</span>
              <span>Halaman 1 dari 1</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#64748B] text-[12px] font-medium disabled:opacity-40 cursor-not-allowed flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Sebelumnya</span>
              </button>
              <button className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[12px] font-bold shadow-sm shadow-blue-500/30">
                1
              </button>
              <button
                disabled
                className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#64748B] text-[12px] font-medium disabled:opacity-40 cursor-not-allowed flex items-center gap-1"
              >
                <span>Selanjutnya</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* end hidden md:block (Orders Table for desktop) */}

      {/* Interactive Simulation Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Drawer Content — full-width on mobile, max-w-md on sm+ */}
          <div className="relative w-full sm:max-w-md bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] shadow-2xl z-10 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-[16px]">
                  <span className="material-symbols-outlined text-[22px]">auto_fix_high</span>
                  <span>Simulasi Solusi Kapasitas</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Order Info Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex flex-col gap-1">
                <span className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
                  Pesanan Terpilih
                </span>
                <span className="text-[16px] text-slate-900 dark:text-[#F1F5F9] font-extrabold">
                  {selectedOrder.orderNumber} • {selectedOrder.productName}
                </span>
                <span className="text-[12px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>
                    Bottleneck: {selectedOrder.bottleneckStation || "Workstation"} (
                    {selectedOrder.bottleneckDeficit || "Defisit jam kerja"})
                  </span>
                </span>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]">
                  Pilih Penyesuaian Cepat (What-If Sandbox):
                </label>

                {/* Option 1: Overtime */}
                <label
                  onClick={() => setSelectedSolution("overtime")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedSolution === "overtime"
                      ? "border-blue-500 bg-blue-500/[0.12] ring-2 ring-blue-500/25"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <input
                    type="radio"
                    name="solusi"
                    checked={selectedSolution === "overtime"}
                    onChange={() => setSelectedSolution("overtime")}
                    className="mt-1 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#F1F5F9]">
                      Lembur Shift Tambahan (+4 Jam)
                    </span>
                    <span className="text-[12px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Estimasi upah lembur Rp 280.000, deadline pesanan tetap aman dan margin laba tetap di 34%.
                    </span>
                  </div>
                </label>

                {/* Option 2: Reschedule */}
                <label
                  onClick={() => setSelectedSolution("reschedule")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedSolution === "reschedule"
                      ? "border-blue-500 bg-blue-500/[0.12] ring-2 ring-blue-500/25"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <input
                    type="radio"
                    name="solusi"
                    checked={selectedSolution === "reschedule"}
                    onChange={() => setSelectedSolution("reschedule")}
                    className="mt-1 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#F1F5F9]">
                      Mundurkan Deadline (+1 Hari)
                    </span>
                    <span className="text-[12px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Kirim draf notifikasi negosiasi otomatis ke WhatsApp {selectedOrder.clientName}.
                    </span>
                  </div>
                </label>

                {/* Option 3: Subcontract */}
                <label
                  onClick={() => setSelectedSolution("subcontract")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedSolution === "subcontract"
                      ? "border-blue-500 bg-blue-500/[0.12] ring-2 ring-blue-500/25"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <input
                    type="radio"
                    name="solusi"
                    checked={selectedSolution === "subcontract"}
                    onChange={() => setSelectedSolution("subcontract")}
                    className="mt-1 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#F1F5F9]">
                      Alihkan ke Subkontraktor Partner
                    </span>
                    <span className="text-[12px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Kirim 100 pcs ke Mitra Box Packaging Tangerang untuk menjaga jadwal rilis.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex flex-col gap-2 pt-6 border-t border-white/[0.06]">
              <p className="text-[11px] text-[#94A3B8] text-center mb-0.5">
                Simulasi ini akan memperbarui status kapasitas pesanan pada sesi saat ini.
              </p>
              <button
                type="button"
                onClick={handleApplySolution}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[13px] font-bold shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Terapkan Solusi (Simulasi)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] text-[#94A3B8] hover:bg-white/[0.10] hover:text-white text-[13px] font-semibold transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Surat Jalan Modal (Delivery Note) ── */}
      {suratJalanOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A]/95 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/[0.08] text-[#F1F5F9] space-y-5 animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black">
            {/* Header Surat Jalan */}
            <div className="flex items-start justify-between border-b pb-4 border-white/[0.08] print:border-gray-200">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/[0.15] px-2 py-0.5 rounded border border-emerald-500/25 font-bold uppercase print:bg-emerald-50 print:text-emerald-700">
                  Surat Jalan Pengiriman Resmi
                </span>
                <h3 className="text-lg font-extrabold text-[#F1F5F9] mt-1 print:text-black">
                  SweetCrumbs Artisan Bakery
                </h3>
                <p className="text-xs text-[#94A3B8] print:text-gray-600">
                  No. Dokumen: SJ-2026-{suratJalanOrder.orderNumber} &bull; Tgl: {suratJalanOrder.deadlineText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuratJalanOrder(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] text-[#94A3B8] hover:bg-white/[0.10] hover:text-white flex items-center justify-center font-bold print:hidden"
              >
                ✕
              </button>
            </div>

            {/* Recipient info */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-1 print:bg-gray-50 print:border-gray-200">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Tujuan Pengiriman:</span>
              <p className="font-bold text-[#F1F5F9] text-sm print:text-black">{suratJalanOrder.clientName}</p>
              <p className="text-[#94A3B8] print:text-gray-600">{suratJalanOrder.clientType}</p>
              <p className="text-[#94A3B8] font-mono print:text-gray-600">Nomor PO: {suratJalanOrder.poNumber}</p>
            </div>

            {/* Product breakdown */}
            <div className="border rounded-xl overflow-hidden border-white/[0.08] text-xs print:border-gray-200">
              <div className="bg-white/[0.06] p-2.5 font-bold text-[#F1F5F9] flex justify-between print:bg-gray-100 print:text-black">
                <span>Rincian Barang</span>
                <span>Jumlah</span>
              </div>
              <div className="p-3 flex items-center justify-between bg-white/[0.02] print:bg-white">
                <div>
                  <span className="font-bold text-[#F1F5F9] block print:text-black">{suratJalanOrder.productName}</span>
                  <span className="text-[11px] text-[#94A3B8] print:text-gray-600">{suratJalanOrder.skuDetails}</span>
                </div>
                <span className="font-mono font-bold text-blue-400 text-sm print:text-blue-700">
                  {suratJalanOrder.quantityText}
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-center text-xs">
              <div className="border border-dashed border-white/[0.15] p-3 rounded-xl print:border-gray-300">
                <span className="text-[10px] text-[#64748B] block mb-8">Yang Menyerahkan (Gudang/Dapur):</span>
                <span className="font-bold text-[#F1F5F9] border-t border-white/[0.15] pt-1 block print:text-black print:border-gray-300">
                  Bilah (SweetCrumbs)
                </span>
              </div>
              <div className="border border-dashed border-white/[0.15] p-3 rounded-xl print:border-gray-300">
                <span className="text-[10px] text-[#64748B] block mb-8">Penerima / Driver Kurir:</span>
                <span className="font-bold text-[#F1F5F9] border-t border-white/[0.15] pt-1 block print:text-black print:border-gray-300">
                  ( ............................ )
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] print:hidden">
              <button
                type="button"
                onClick={() => setSuratJalanOrder(null)}
                className="px-4 py-2 rounded-xl border border-white/[0.10] text-xs font-bold text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/25"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
