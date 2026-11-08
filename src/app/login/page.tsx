"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { login } from "@/actions/auth.actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F1F5F9] transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto my-auto flex flex-col lg:flex-row items-stretch rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden bg-white/85 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08]">
        {/* Left Column: Form & Interaction */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-white/60 dark:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          {/* Top Branding Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Kembali ke Beranda</span>
              </Link>
              <ThemeToggle />
            </div>

            <div className="mb-6">
              <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" />
            </div>

            {/* Heading & Context */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl text-slate-900 dark:text-[#F1F5F9] font-black tracking-tight mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-[14px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Kelola jadwal produksi dan pastikan setiap janji pesanan terpenuhi tepat waktu tanpa beban lembur tak terduga.
              </p>
            </div>

            <div className="w-full rounded-xl bg-slate-100/80 dark:bg-white/[0.06] px-4 py-3 text-center text-[13px] font-medium text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/[0.08]">
              Masuk menggunakan akun Owner atau Staff yang diberikan oleh usaha Anda.
            </div>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full h-px bg-slate-200 dark:bg-white/[0.08]"></div>
              <span className="absolute px-3 bg-[#F8FAFC] dark:bg-[#0B1120] text-[11px] text-slate-500 dark:text-[#64748B] uppercase font-bold tracking-wider">
                atau masuk dengan email bisnis
              </span>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-[13px] text-slate-800 dark:text-[#F1F5F9] mb-1.5 font-bold" htmlFor="businessEmail">
                  Email Bisnis / Akun
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-[#64748B] text-[20px] pointer-events-none">
                    mail
                  </span>
                  <input
                    id="businessEmail"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="contoh: bilah@sweetcrumbs.id"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] text-[14px] border border-slate-200 dark:border-white/[0.10] shadow-xs outline-none transition-all focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] text-slate-800 dark:text-[#F1F5F9] font-bold" htmlFor="password">
                    Kata Sandi
                  </label>
                  <span className="text-[12px] text-slate-400 dark:text-[#64748B] font-medium">
                    Hubungi Owner jika lupa kata sandi
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-[#64748B] text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] text-[14px] border border-slate-200 dark:border-white/[0.10] shadow-xs outline-none transition-all focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#64748B] hover:text-white transition-colors p-1"
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[13px] text-[#94A3B8] font-medium">
                    Sesi berakhir otomatis setelah 8 jam
                  </span>
                </label>
                <div className="flex items-center gap-1 text-[#64748B] text-[12px]">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  <span>256-bit SSL</span>
                </div>
              </div>

              {state?.error && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2 text-[13px] font-medium text-rose-400"
                >
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 mt-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-[0.99] group disabled:opacity-75 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun BizCapacity</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Registration Pitch */}
          <div className="mt-8 pt-4 bg-white/[0.06] border border-white/[0.08] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
            <span className="text-[13px] text-[#94A3B8]">
              Belum memiliki akses? Minta undangan kepada Owner usaha Anda.
            </span>
          </div>
        </div>

        {/* Right Column: Visual Value Panel & Storytelling */}
        <div className="w-full lg:w-5/12 bg-[#213145] text-[#eaf1ff] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>

          {/* Header Tag & Engine State */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#dbe1ff] text-[11px] font-bold backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Capacity Engine v4.2</span>
            </div>
            <span className="material-symbols-outlined text-[#b4c5ff]/60 text-[20px]">speed</span>
          </div>

          {/* Center Micro-Dashboard Simulation */}
          <div className="relative z-10 my-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-2xl shadow-black/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#dbe1ff]">tune</span>
                <span className="text-[11px] text-[#dbe1ff] font-bold tracking-wide uppercase">
                  Shop-Floor Workstation Load
                </span>
              </div>
              <span className="text-[11px] text-white/70 font-mono">Shift 08:00 - 16:00</span>
            </div>

            {/* Meter 1 */}
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  Stasiun Packaging Hampers
                </span>
                <span className="font-mono text-[#ffb596] font-bold">92% Kapasitas Terpakai</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex">
                <div className="h-full bg-[#004ac6]" style={{ width: "70%" }}></div>
                <div className="h-full bg-[#ffb596]" style={{ width: "22%" }}></div>
                <div className="h-full bg-[#ba1a1a]/40" style={{ width: "8%" }}></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span className="text-white/60">Sisa Aman: 24 Box</span>
                <span className="text-[#ffdad6] bg-[#ba1a1a]/40 px-1.5 py-0.5 rounded font-semibold">
                  Hampir Limit
                </span>
              </div>
            </div>

            {/* Meter 2 */}
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
                  Rotary Oven Deck A &amp; B
                </span>
                <span className="font-mono text-[#dbe1ff] font-bold">68% Kapasitas</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex">
                <div className="h-full bg-[#2563eb]" style={{ width: "68%" }}></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span className="text-white/60">Sisa Kapasitas: 450 Pcs</span>
                <span className="text-[#dbe1ff] font-medium">Tersedia Batch Siang</span>
              </div>
            </div>

            {/* Sparkline Visualizer */}
            <div className="pt-2 flex items-end justify-between gap-1.5 h-12">
              <div className="h-4 w-full bg-[#2563eb]/30 rounded-t"></div>
              <div className="h-7 w-full bg-[#2563eb]/40 rounded-t"></div>
              <div className="h-9 w-full bg-[#2563eb]/60 rounded-t"></div>
              <div className="h-6 w-full bg-[#2563eb]/40 rounded-t"></div>
              <div className="h-11 w-full bg-[#dbe1ff] rounded-t"></div>
              <div className="h-8 w-full bg-[#2563eb]/50 rounded-t"></div>
              <div className="h-10 w-full bg-[#2563eb]/70 rounded-t"></div>
              <div className="h-12 w-full bg-[#ffb596] rounded-t"></div>
              <div className="h-5 w-full bg-[#2563eb]/30 rounded-t"></div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[13px] text-white font-bold ml-1.5 font-mono">4.9/5</span>
            </div>
            <blockquote className="text-[13px] text-[#eaf1ff] leading-relaxed italic">
              &ldquo;Kami tidak lagi menebak-nebak apakah sanggup menyelesaikan 300 hampers dalam 2 hari. BizCapacity langsung menunjukkan bottleneck di stasiun packaging sebelum kami tanda tangan PO.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563eb] to-emerald-400 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-black/20">
                BL
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Bilah</p>
                <p className="text-[11px] text-[#b9c6ea]">Owner, SweetCrumbs Bakery Semarang</p>
              </div>
            </div>

            {/* Metric Chip Card */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[11px] mt-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Tepat Waktu: 99.4%</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-white font-semibold">Zero Over-committing</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
