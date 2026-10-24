"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("bilah@sweetcrumbs.id");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f8f9ff]">
      <div className="w-full max-w-6xl mx-auto my-auto flex flex-col lg:flex-row items-stretch rounded-2xl shadow-xl overflow-hidden bg-white border border-[#e5eeff]">
        {/* Left Column: Form & Interaction */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#dbe1ff]/30 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          {/* Top Branding Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525e7d] hover:text-[#0052cc] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Kembali ke Beranda</span>
              </Link>
            </div>

            <div className="mb-6">
              <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" />
            </div>

            {/* Heading & Context */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl text-[#0b1c30] font-black tracking-tight mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-[14px] text-[#525e7d] leading-relaxed">
                Kelola jadwal produksi dan pastikan setiap janji pesanan terpenuhi tepat waktu tanpa beban lembur tak terduga.
              </p>
            </div>

            {/* Quick SSO CTA */}
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => router.push("/dashboard"), 600);
              }}
              className="w-full h-11 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[13px] font-semibold flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] group border border-[#dbe1ff]"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span>Lanjutkan dengan Google Workspace (Akses Demo)</span>
            </button>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full h-px bg-[#e5eeff]"></div>
              <span className="absolute px-3 bg-white text-[11px] text-[#737686] uppercase font-bold tracking-wider">
                atau masuk dengan email bisnis
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-[#0b1c30] mb-1.5 font-bold" htmlFor="businessEmail">
                  Email Bisnis / Akun
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#737686] text-[20px] pointer-events-none">
                    mail
                  </span>
                  <input
                    id="businessEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: bilah@sweetcrumbs.id"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f8f9ff] text-[#0b1c30] text-[14px] border border-[#e5eeff] shadow-xs outline-none transition-all focus:bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 placeholder:text-[#737686]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] text-[#0b1c30] font-bold" htmlFor="password">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-[12px] text-[#004ac6] hover:underline font-semibold">
                    Lupa Kata Sandi?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#737686] text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f8f9ff] text-[#0b1c30] text-[14px] border border-[#e5eeff] shadow-xs outline-none transition-all focus:bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 placeholder:text-[#737686]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#737686] hover:text-[#0b1c30] transition-colors p-1"
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
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-[#004ac6] bg-[#f8f9ff] border-[#c3c6d7] focus:ring-[#004ac6]"
                  />
                  <span className="text-[13px] text-[#525e7d] font-medium">Ingat Saya di Perangkat Ini</span>
                </label>
                <div className="flex items-center gap-1 text-[#737686] text-[12px]">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  <span>256-bit SSL</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-3 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#004ac6]/25 transition-all duration-200 active:scale-[0.99] group disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
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
          <div className="mt-8 pt-4 bg-[#eff4ff] border border-[#dbe1ff] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
            <span className="text-[13px] text-[#525e7d]">Belum punya akun usaha Anda?</span>
            <Link
              href="/register"
              className="text-[13px] text-[#004ac6] font-bold hover:underline flex items-center gap-1"
            >
              <span>Daftar Akun (Mulai Gratis)</span>
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Value Panel & Storytelling */}
        <div className="w-full lg:w-5/12 bg-[#213145] text-[#eaf1ff] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#004ac6]/30 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#cdd9fe]/10 blur-3xl pointer-events-none"></div>

          {/* Header Tag & Engine State */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#dbe1ff] text-[11px] font-bold backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Capacity Engine v4.2</span>
            </div>
            <span className="material-symbols-outlined text-[#b4c5ff]/60 text-[20px]">speed</span>
          </div>

          {/* Center Micro-Dashboard Simulation */}
          <div className="relative z-10 my-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
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
            <div className="flex gap-1 text-amber-400">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
            <blockquote className="text-[13px] text-[#eaf1ff] leading-relaxed italic">
              &ldquo;Kami tidak lagi menebak-nebak apakah sanggup menyelesaikan 300 hampers dalam 2 hari. BizCapacity langsung menunjukkan bottleneck di stasiun packaging sebelum kami tanda tangan PO.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563eb] to-emerald-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
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
