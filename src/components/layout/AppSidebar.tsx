"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface AppSidebarProps {
  activeCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenHelp?: () => void;
}

interface NavItem {
  name: string;
  hint: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ activeCount = 18, isOpen, onClose, onOpenHelp }: AppSidebarProps) {
  const pathname = usePathname();

  // Read business identity from localStorage (written by Settings page)
  // Falls back to demo data until backend auth is connected
  const [bizName, setBizName] = useState("SweetCrumbs");
  const [bizType, setBizType] = useState("Bakery & Custom Gift Boxes");

  useEffect(() => {
    const updateBiz = () => {
      try {
        const storedName = localStorage.getItem("biz_name");
        const storedType = localStorage.getItem("biz_type");
        if (storedName) setBizName(storedName);
        if (storedType) setBizType(storedType);
      } catch {
        // localStorage tidak tersedia (SSR guard)
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

  const navGroups: NavGroup[] = [
    {
      title: "RINGKASAN",
      items: [
        {
          name: "Beranda",
          hint: "Status usaha hari ini",
          href: "/dashboard",
          icon: "home",
        },
        {
          name: "Pesanan",
          hint: "Daftar pesanan masuk",
          href: "/orders",
          icon: "receipt_long",
          badge: `${activeCount}`,
        },
      ],
    },
    {
      title: "DATA USAHA",
      items: [
        {
          name: "Daftar Produk",
          hint: "Produk yang kamu jual",
          href: "/products",
          icon: "inventory_2",
        },
        {
          name: "Staf, Mesin & Bahan",
          hint: "Kapasitas produksimu",
          href: "/resources",
          icon: "precision_manufacturing",
        },
        {
          name: "Jadwal Produksi",
          hint: "Rencana kerja mingguan",
          href: "/production-planning",
          icon: "calendar_month",
        },
      ],
    },
    {
      title: "BANTU PUTUSKAN",
      items: [
        {
          name: "Simulasi Pesanan",
          hint: "Tes dulu sebelum terima order",
          href: "/simulations",
          icon: "calculate",
        },
        {
          name: "Laporan & Grafik",
          hint: "Performa usaha bulan ini",
          href: "/analytics",
          icon: "bar_chart",
        },
      ],
    },
    {
      title: "LAINNYA",
      items: [
        {
          name: "Pengaturan",
          hint: "Profil & preferensi",
          href: "/settings",
          icon: "settings",
        },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/orders"
      ? pathname === "/orders" || pathname.startsWith("/orders/")
      : pathname === href;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-dark sidebar-scroll fixed left-0 top-0 h-full w-64 z-[70] flex flex-col overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ── Logo Header ───────────────────────────── */}
        <div className="h-16 px-5 flex items-center justify-between flex-shrink-0 border-b border-[#1E293B]">
          <BrandLogo variant="dark" size="sm" subtitleText="Sistem Kapasitas UMKM" />

          {/* Mobile close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>


        {/* ── Navigation ────────────────────────────── */}
        <nav className="flex flex-col px-3 py-2 gap-5 flex-1">
          {navGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-0.5">
              {/* Group label */}
              <div className="sidebar-group-label px-3 py-1 mb-1">
                {group.title}
              </div>

              {/* Items */}
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`sidebar-nav-item flex items-center justify-between px-3 py-2 text-[13.5px] font-medium ${
                      active ? "active" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[19px] transition-colors flex-shrink-0 ${
                          active ? "text-[#93C5FD]" : "text-[#64748B]"
                        }`}
                        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <div className={`truncate ${active ? "text-white" : "text-[#CBD5E1]"}`}>{item.name}</div>
                        <div className="text-[10.5px] text-[#475569] truncate">{item.hint}</div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex-shrink-0 ml-1 ${
                          active
                            ? "bg-blue-500/30 text-blue-300"
                            : "bg-white/8 text-[#64748B]"
                        }`}
                        style={active ? {} : { background: "rgba(255,255,255,0.06)" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom: Business Profile ───────────────── */}
        <div className="p-3 border-t border-[#1E293B] flex flex-col gap-2 flex-shrink-0">
          {/* Business card — nama usaha dari localStorage / settings */}
          <Link
            href="/settings"
            title="Buka Pengaturan Usaha"
            className="sidebar-profile-card block hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-white text-[14px]">storefront</span>
                </div>
                <span className="text-[13px] font-semibold text-[#F1F5F9] truncate group-hover:text-blue-300 transition-colors">
                  {bizName}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] truncate pl-9">
              {bizType} &bull; Edit
            </p>
          </Link>

          {/* Quick links */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 text-[11.5px] text-[#64748B] hover:text-blue-400 transition-colors py-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">help_outline</span>
              <span>Panduan</span>
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-[11.5px] text-[#64748B] hover:text-red-400 transition-colors py-1"
            >
              <span className="material-symbols-outlined text-[15px]">logout</span>
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
