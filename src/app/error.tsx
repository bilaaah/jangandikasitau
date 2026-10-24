"use client";

// src/app/error.tsx
//
// Global Error Boundary — tampil otomatis Next.js saat runtime error.
// Memberikan recovery path yang jelas agar user tidak stuck di layar kosong.

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log ke console untuk debugging (bisa diganti Sentry/logging service nanti)
    console.error("[BizCapacity Global Error]", error);
  }, [error]);

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9ff]">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-rose-400/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-xl shadow-rose-500/20">
            <span className="material-symbols-outlined text-white text-[36px]">
              error
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Ada yang Tidak Beres
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            Sistem mengalami kendala sementara. Data pesananmu aman — ini bukan masalah pada data kamu.
          </p>

          {/* Error digest for support */}
          {error?.digest && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-500 border border-slate-200">
              <span className="material-symbols-outlined text-[14px]">tag</span>
              Kode Error: {error.digest}
            </div>
          )}
        </div>

        {/* What happened */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-bold text-amber-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Apa yang bisa kamu lakukan sekarang:
          </p>
          <ul className="text-xs text-amber-800 space-y-1 pl-6 list-disc">
            <li>Klik <strong>Coba Lagi</strong> untuk reload halaman ini</li>
            <li>Kembali ke Dasbor dan mulai dari awal</li>
            <li>Jika terus berulang, catat kode error di atas dan hubungi admin</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold transition-all shadow-md shadow-[#1D4ED8]/20 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#0F172A] text-sm font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Kembali ke Dasbor
          </Link>
        </div>

        {/* Brand footer */}
        <p className="text-[11px] text-[#94a3b8]">
          BizCapacity — Engine kapasitas tetap berjalan di latar belakang.
        </p>
      </div>
    </main>
  );
}
