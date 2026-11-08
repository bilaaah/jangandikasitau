"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { logout } from "@/actions/auth.actions";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isHelpOpen?: boolean;
  onOpenHelp?: () => void;
  onCloseHelp?: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: "pesanan" | "produk" | "mesin" | "halaman";
  href: string;
  icon: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Pesanan
  { id: "bc-1024", title: "BC-1024 — PT Nusantara Sentosa", subtitle: "300 box Hampers Lebaran (⚠️ Perlu Perhatian)", type: "pesanan", href: "/orders/bc-1024", icon: "receipt_long" },
  { id: "bc-1023", title: "BC-1023 — Ibu Ratna Catering", subtitle: "120 box Brownies Fudgy (✅ Aman)", type: "pesanan", href: "/orders/bc-1023", icon: "receipt_long" },
  { id: "bc-1022", title: "BC-1022 — Kopi Selaras Cafe", subtitle: "500 pcs Artisan Croissants (✅ Aman)", type: "pesanan", href: "/orders/bc-1022", icon: "receipt_long" },
  { id: "bc-1021", title: "BC-1021 — Wedding Organizer Lestari", subtitle: "1 tier Wedding Cake (🔴 Kapasitas Kurang)", type: "pesanan", href: "/orders/bc-1021", icon: "receipt_long" },
  
  // Produk
  { id: "prod-1", title: "Custom Gift Boxes & Hampers", subtitle: "Resep BOM & Jam Kerja Staf", type: "produk", href: "/products", icon: "inventory_2" },
  { id: "prod-2", title: "Signature Fudgy Brownies", subtitle: "Kapasitas Oven Deck & Bahan Baku", type: "produk", href: "/products", icon: "inventory_2" },
  { id: "prod-3", title: "Artisan Butter Croissants", subtitle: "Sensitivitas Tenaga Kerja & Waktu Fermentasi", type: "produk", href: "/products", icon: "inventory_2" },

  // Sumber Daya
  { id: "res-1", title: "Staf & Tenaga Kerja (4 Karyawan)", subtitle: "Budi Santoso, Chef Aris, Siti Rahma, Dita", type: "mesin", href: "/resources", icon: "group" },
  { id: "res-2", title: "Oven Deck Gas 3-Deck (Kapasitas Utama)", subtitle: "Utilisasi 88% — Shift Pagi & Siang", type: "mesin", href: "/resources", icon: "local_fire_department" },
  { id: "res-3", title: "Mesin Band Sealer (Kemasan)", subtitle: "Stasiun Packaging — Utilisasi 92%", type: "mesin", href: "/resources", icon: "precision_manufacturing" },
  { id: "res-4", title: "Stok Bahan Baku & Box Hampers", subtitle: "Cek sisa stok hardbox, pita satin, jar", type: "mesin", href: "/resources", icon: "inventory" },

  // Fitur
  { id: "nav-sim", title: "Simulasi Solusi Pesanan", subtitle: "Uji lembur & pekerja lepas sebelum terima order", type: "halaman", href: "/simulations", icon: "calculate" },
  { id: "nav-plan", title: "Jadwal Produksi Mingguan", subtitle: "Timeline kerja per stasiun kerja", type: "halaman", href: "/production-planning", icon: "calendar_month" },
  { id: "nav-new", title: "Cek Pesanan Baru", subtitle: "Kalkulasi kelayakan order dalam hitungan detik", type: "halaman", href: "/orders/new", icon: "add_circle" },
];

export function AppHeader({ onToggleSidebar, isSidebarOpen, isHelpOpen, onOpenHelp, onCloseHelp }: AppHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [localHelpModal, setLocalHelpModal] = useState(false);
  const [bizName, setBizName] = useState("SweetCrumbs Bakery");

  // Automatically close any open header dropdowns when sidebar opens
  useEffect(() => {
    if (isSidebarOpen) {
      setShowProfile(false);
      setShowNotifications(false);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const updateBiz = () => {
      try {
        const stored = localStorage.getItem("biz_name");
        if (stored) setBizName(stored);
      } catch {
        // SSR guard
      }
    };
    updateBiz();
    window.addEventListener("storage", updateBiz);
    window.addEventListener("biz_profile_updated", updateBiz);
    return () => {
      window.removeEventListener("storage", updateBiz);
      window.removeEventListener("biz_profile_updated", updateBiz);
    };
  }, []);

  const showHelpModal = isHelpOpen !== undefined ? isHelpOpen : localHelpModal;
  const setShowHelpModal = (val: boolean) => {
    if (val) {
      if (onOpenHelp) onOpenHelp();
      else setLocalHelpModal(true);
    } else {
      if (onCloseHelp) onCloseHelp();
      else setLocalHelpModal(false);
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Notification read status
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "Antrian Packaging Hampers Penuh",
      desc: "Pesanan BC-1024 (PT Nusantara) butuh tambahan 8 jam kerja operator.",
      time: "10 menit lalu",
      unread: true,
      href: "/orders/bc-1024",
      icon: "warning",
      color: "text-amber-400 bg-amber-500/[0.10]",
    },
    {
      id: "n-2",
      title: "Stok Hardbox Satin Menipis",
      desc: "Sisa 250 box di gudang. Butuh 300 box untuk memenuhi order minggu ini.",
      time: "1 jam lalu",
      unread: true,
      href: "/resources",
      icon: "inventory_2",
      color: "text-rose-400 bg-rose-500/[0.10]",
    },
    {
      id: "n-3",
      title: "Batch Brownies Selesai Dipanggang",
      desc: "Pesanan BC-1023 (Ibu Ratna) siap masuk tahap packaging.",
      time: "2 jam lalu",
      unread: true,
      href: "/orders/bc-1023",
      icon: "task_alt",
      color: "text-emerald-400 bg-emerald-500/[0.10]",
    },
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered search items
  const filteredSearch = searchQuery.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 6);

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleSelectSearchItem = (href: string) => {
    setIsSearchFocused(false);
    setSearchQuery("");
    router.push(href);
  };

  return (
    <>
      <header className="app-header fixed top-0 left-0 lg:left-64 right-0 h-16 z-40 flex items-center justify-between px-3 sm:px-6 bg-[#0B1120]/90 backdrop-blur-md border-b border-white/[0.08]">
        {/* ── Left: Mobile Hamburger + Business Badge ── */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={() => {
                setShowProfile(false);
                setShowNotifications(false);
                onToggleSidebar();
              }}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-1.5 rounded-xl text-[#94A3B8] hover:bg-white/[0.06] hover:text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          {/* Business badge */}
          <Link
            href="/settings"
            title="Klik untuk buka Pengaturan Usaha"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-[#F1F5F9] text-[11.5px] sm:text-[12px] font-semibold transition-colors select-none group min-w-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot flex-shrink-0" />
            <span className="truncate max-w-[95px] sm:max-w-[220px]">{bizName}</span>
          </Link>
        </div>

        {/* ── Right: Search + Actions + Profile ─────── */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* 🔍 Global Interactive Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 dark:text-[#94A3B8] text-[17px] pointer-events-none">
                search
              </span>
              <input
                id="global-search"
                type="text"
                placeholder="Cari pesanan, produk, staf, mesin..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-64 h-9 pl-9 pr-8 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-[#64748B] text-[13px] transition-all outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:bg-white dark:focus:bg-white/[0.08] focus:w-80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute right-0 top-11 w-96 max-h-[380px] overflow-y-auto bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-2xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-slate-200 dark:border-white/[0.08] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-[#64748B] uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] mb-1">
                  <span>Hasil Pencarian Cepat</span>
                  <span className="text-[10px] lowercase font-normal">Tekan untuk buka</span>
                </div>

                {filteredSearch.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                    Tidak menemukan &ldquo;{searchQuery}&rdquo;. Coba kata kunci pesanan, produk, atau mesin.
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filteredSearch.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSearchItem(item.href)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex items-center gap-3 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-slate-800 dark:text-[#F1F5F9] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">{item.subtitle}</p>
                        </div>
                        <span className="material-symbols-outlined text-[15px] text-slate-400 dark:text-[#475569] group-hover:text-blue-500 dark:group-hover:text-blue-400">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ☀️ / 🌙 Theme Toggle Button */}
          <ThemeToggle />

          {/* 📖 Panduan Penggunaan Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            title="Panduan Sistem Kapasitas UMKM"
            aria-label="Panduan & Bantuan"
            className="p-2 rounded-xl text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span className="hidden xl:inline text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">Panduan</span>
          </button>

          {/* 🔔 Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
              className={`relative p-2 rounded-xl transition-colors flex items-center ${
                showNotifications ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-2xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-slate-200 dark:border-white/[0.08] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Header */}
                <div className="p-3.5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">Notifikasi Produksi</h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{unreadCount} pemberitahuan baru</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                {/* Notification Items */}
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06] max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setShowNotifications(false)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors block ${
                        n.unread ? "bg-blue-50/50 dark:bg-blue-500/[0.06]" : ""
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                        <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold leading-tight ${n.unread ? "text-slate-900 dark:text-[#F1F5F9]" : "text-slate-500 dark:text-[#94A3B8]"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-[#64748B] shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-2.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] text-center">
                  <Link
                    href="/orders"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Buka Semua Pesanan &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08]" aria-hidden="true" />

          {/* 👤 Profile Button & Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setShowProfile((prev) => !prev)}
              aria-label="Profil pengguna & pengaturan"
              className={`flex items-center gap-2.5 pl-1 rounded-xl pr-2 py-1 transition-colors group ${
                showProfile ? "bg-blue-500/15" : "hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[12px] shadow-sm shadow-blue-500/30">
                  {session?.user?.name?.slice(0, 2).toUpperCase() ?? "BC"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1120]" />
              </div>

              {/* Name info */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[13px] font-semibold text-slate-800 dark:text-[#F1F5F9] leading-tight">
                  {session?.user?.name ?? (session?.user?.role === "MEMBER" || session?.user?.role === "STAFF" ? "Staf Produksi" : "Owner")}
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-[#94A3B8] leading-none">
                  {session?.user?.role === "MEMBER" || session?.user?.role === "STAFF" ? "Staff" : "Owner"}
                </span>
              </div>

              <span className={`material-symbols-outlined text-[16px] text-slate-400 dark:text-[#94A3B8] hidden sm:block transition-transform ${
                showProfile ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
              }`}>
                expand_more
              </span>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-11 w-64 bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-2xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-slate-200 dark:border-white/[0.08] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Business identity */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9]">{bizName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                    {session?.user?.email ?? "Operasional Aktif"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  {session?.user?.role !== "MEMBER" && session?.user?.role !== "STAFF" && (
                    <Link
                      href="/settings"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-[#94A3B8]">settings</span>
                      <span>Pengaturan Usaha</span>
                    </Link>
                  )}
                  <Link
                    href="/resources"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-[#94A3B8]">group</span>
                    <span>Data Staf &amp; Mesin</span>
                  </Link>
                  <Link
                    href="/simulations"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-[#94A3B8]">calculate</span>
                    <span>Simulasi Kapasitas</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      setShowHelpModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-[#94A3B8]">help</span>
                    <span>Panduan Penggunaan</span>
                  </button>
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Keluar Akun</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Panduan Singkat Modal (Quick Guide) ── */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl dark:shadow-black/30 border border-slate-200 dark:border-white/[0.08] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#F1F5F9]">Panduan Pemilik Usaha</h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Panduan Penggunaan Sistem Keputusan Kapasitas UMKM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-[#94A3B8] dark:hover:bg-white/[0.10] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/[0.10] border border-blue-200 dark:border-blue-500/20 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h5 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Cek Pesanan Sebelum Bilang Iya</h5>
                  <p className="text-blue-900/80 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                    Saat pelanggan minta order banyak atau deadline mepet, buka menu <strong>&ldquo;Cek Pesanan Baru&rdquo;</strong>. Sistem akan langsung hitung apakah jam kerja oven dan bahanmu cukup.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/[0.10] border border-amber-200 dark:border-amber-500/20 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h5 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Gunakan Simulator Jika Kapasitas Padat</h5>
                  <p className="text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Jika ada tanda <strong>⚠️ Perlu Perhatian</strong> atau <strong>🔴 Antrian Padat</strong>, jangan buru-buru tolak! Buka menu <strong>Simulasi</strong> untuk coba opsi lembur atau tambah pekerja harian.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/[0.10] border border-emerald-200 dark:border-emerald-200/20 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Perbarui Data Tim &amp; Bahan Secara Berkala</h5>
                  <p className="text-emerald-900/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                    Di menu <strong>&ldquo;Staf, Mesin &amp; Bahan&rdquo;</strong>, kamu bisa tambah karyawan baru, catat mesin oven yang aktif, dan isi ulang stok bahan saat baru belanja dari supplier.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                href="/orders/new"
                onClick={() => setShowHelpModal(false)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Coba Cek Pesanan &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold shadow-sm shadow-blue-500/30 transition-all"
              >
                Saya Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
