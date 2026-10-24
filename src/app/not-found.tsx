// src/app/not-found.tsx
//
// Custom 404 page — branded BizCapacity.
// Tampil otomatis oleh Next.js saat route tidak ditemukan.

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function NotFound() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9ff]">
      {/* Floating glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        {/* Brand */}
        <div className="flex justify-center">
          <BrandLogo size="sm" />
        </div>

        {/* 404 Visual */}
        <div className="relative">
          <div className="text-[9rem] font-black text-[#1D4ED8]/8 leading-none select-none tracking-tight">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <span className="material-symbols-outlined text-white text-[36px]">
                search_off
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            Sepertinya halaman yang kamu cari tidak ada atau sudah dipindahkan.
            Kembali ke dasbor untuk melanjutkan pengelolaan pesanan.
          </p>
        </div>

        {/* Quick capacity status card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">sensors</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#0F172A]">Sistem BizCapacity tetap aktif</p>
            <p className="text-[11px] text-[#64748B]">Engine kapasitas berjalan normal — data pesanan aman.</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 ml-auto" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold transition-all shadow-md shadow-[#1D4ED8]/20 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Kembali ke Dasbor
          </Link>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#0F172A] text-sm font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Buat Pesanan Baru
          </Link>
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-[#94a3b8]">
          Butuh bantuan?{" "}
          <Link href="/settings" className="font-semibold text-[#1D4ED8] hover:underline">
            Buka Pengaturan
          </Link>{" "}
          atau hubungi tim BizCapacity.
        </p>
      </div>
    </main>
  );
}
