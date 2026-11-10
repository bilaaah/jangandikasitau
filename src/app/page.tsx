"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function HomePage() {
  const router = useRouter();

  // Interactive state for Hero Simulation Card
  const [heroSolved, setHeroSolved] = useState(false);

  // Interactive state for Feature Showcase Workstation Simulation
  const [workstationOvertimeActive, setWorkstationOvertimeActive] = useState(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [signupEmail, setSignupEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHeroQuickSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/register?email=${encodeURIComponent(signupEmail)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Top Announcement Bar (Responsive) */}
      <div className="w-full bg-gradient-to-r from-blue-700/80 via-blue-600/80 to-indigo-700/80 backdrop-blur-xl border-b border-white/[0.08] text-white py-1.5 sm:py-2 px-3 sm:px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] font-medium">
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white font-bold tracking-wider uppercase text-[10px]">
            Pembaruan V2.4
          </span>
          <span className="truncate max-w-[240px] sm:max-w-none">
            Simulasi Kapasitas &amp; Lembur kini siap pakai!
          </span>
          <a
            href="#demo-simulasi"
            className="underline font-bold hover:text-white/80 shrink-0 inline-flex items-center gap-0.5 ml-1"
          >
            Coba <span className="hidden sm:inline">Kalkulator</span> <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Sticky Header (Responsive) */}
      <header className="sticky top-0 w-full z-50 bg-white/85 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-xs dark:shadow-[0_1px_16px_rgba(0,0,0,0.4)]">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-4">
          <div className="shrink-0">
            <BrandLogo size="sm" showSubtitle={false} className="sm:hidden" />
            <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" className="hidden sm:flex" />
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#fitur" className="text-[14px] text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Fitur Platform
            </a>
            <a href="#cara-kerja" className="text-[14px] text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Cara Kerja (4 Langkah)
            </a>
            <a href="#studi-kasus" className="text-[14px] text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Studi Kasus UKM
            </a>
            <a href="#faq" className="text-[14px] text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle className="w-8 h-8 sm:w-9 sm:h-9" />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-[14px] font-semibold text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs sm:text-[14px] font-bold shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-[0.99] whitespace-nowrap"
            >
              Mulai Gratis
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center shrink-0"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/[0.08] px-4 py-4 shadow-xl dark:shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-100 dark:border-white/[0.08]">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <span>Fitur Platform</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-[#64748B]">chevron_right</span>
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <span>Cara Kerja (4 Langkah)</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-[#64748B]">chevron_right</span>
              </a>
              <a
                href="#studi-kasus"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <span>Studi Kasus UKM</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-[#64748B]">chevron_right</span>
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <span>FAQ &amp; Bantuan</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-[#64748B]">chevron_right</span>
              </a>
            </div>

            <div className="pt-3.5 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/[0.12] hover:bg-blue-100 dark:hover:bg-blue-500/[0.20] border border-blue-200 dark:border-blue-500/20 rounded-xl transition-colors"
              >
                Masuk ke Akun (Login)
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-md shadow-blue-500/25 transition-colors"
              >
                Mulai Gratis Sekarang
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden hero-glass pt-12 pb-20 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/[0.12] text-blue-700 dark:text-blue-300 w-fit shadow-xs border border-blue-200 dark:border-blue-500/20 animate-slide-down shimmer-badge">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-[12px] font-bold">
                  Sistem Keputusan Kapasitas #1 untuk UMKM Produsen
                </span>
              </div>

              <div className="flex flex-col gap-3 animate-slide-up">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-[#F1F5F9] leading-tight sm:leading-tight">
                  Ketahui Kapasitas Nyata Toko &amp; Bengkel Anda{" "}
                  <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 decoration-4 underline-offset-8">
                    Sebelum Mengiyakan
                  </span>{" "}
                  Pesanan.
                </h1>
                <p className="text-[16px] text-slate-600 dark:text-[#94A3B8] max-w-2xl leading-relaxed">
                  Sistem pendukung keputusan kapasitas produksi cerdas untuk UMKM Indonesia. Cek ketersediaan tenaga kerja, jam oven/mesin, dan stok packaging secara deterministik dalam hitungan detik. Berhenti berjanji dengan tebak-tebakan.
                </p>
              </div>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 animate-slide-up stagger-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-[0.99] text-center"
                >
                  <span>Coba Gratis Sekarang</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <a
                  href="#interactive-preview"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/80 dark:bg-white/[0.05] text-slate-800 dark:text-[#F1F5F9] font-bold text-[15px] border border-slate-200 dark:border-white/[0.10] shadow-xs hover:bg-white dark:hover:bg-white/[0.08] transition-all"
                >
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                    play_circle
                  </span>
                  <span>Lihat Demo Interaktif</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-[#94A3B8] text-[12px] font-medium pt-1 animate-slide-up stagger-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    check_circle
                  </span>
                  <span>Tanpa kartu kredit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    check_circle
                  </span>
                  <span>Setup mudah 5 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    check_circle
                  </span>
                  <span>Support WhatsApp lokal</span>
                </div>
              </div>

              {/* SME Social Proof Avatars */}
              <div className="mt-2 flex items-center gap-3.5 sm:gap-4 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xs animate-slide-up stagger-4 hover-lift">
                <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    BL
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    RK
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    AP
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    +450
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="material-symbols-outlined text-[15px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[15px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[15px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[15px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[15px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono ml-1">4.9/5</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">(450+ Rating)</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                    Dipercaya 450+ pemilik bakery, katering, konveksi, dan hampers di Jabodetabek &amp; Surabaya
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulation Card Preview */}
            <div className="lg:col-span-5 flex flex-col animate-float hover-lift" id="interactive-preview">
              <div className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-slate-200 dark:border-white/[0.08] overflow-hidden">
                {/* Simulated App Header */}
                <div className="bg-slate-900 dark:bg-[#0F172A]/90 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-[12px] text-white/90 ml-2 font-medium">
                      BizCapacity • Real-Time Order Verification
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-white font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Simulation
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col gap-4 bg-transparent">
                  {/* Step A: Incoming Order */}
                  <div className="flex flex-col gap-1 pb-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] font-bold">
                        Pesanan Masuk
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/[0.15] text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/20">
                        ID: #ORD-7821
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-[18px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                        300 Hampers Lebaran Royale
                      </div>
                      <div className="text-[13px] font-bold text-blue-600 dark:text-blue-400">
                        Deadline: 3 Hari
                      </div>
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>Total Kebutuhan Produksi: 48 Jam Kerja Terdistribusi</span>
                    </div>
                  </div>

                  {/* Step B: Capacity Check Result */}
                  <div
                    className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all ${
                      heroSolved
                        ? "bg-emerald-500/[0.10] border-emerald-500/25"
                        : "bg-rose-500/[0.10] border-rose-500/25"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-1.5 text-[14px] font-bold ${
                          heroSolved ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {heroSolved ? "check_circle" : "warning"}
                        </span>
                        <span>{heroSolved ? "Hasil Analisis: FEASIBLE" : "Hasil Analisis: AT RISK"}</span>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                          heroSolved
                            ? "bg-emerald-500/[0.20] text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/[0.20] text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {heroSolved ? "Kapasitas Aman" : "Defisit Kapasitas"}
                      </span>
                    </div>

                    <p className="text-[12px] text-slate-700 dark:text-[#CBD5E1] mt-1 leading-relaxed">
                      {heroSolved ? (
                        <>
                          Lembur 2 orang x 4 jam disetujui. Stasiun Perakitan kini memiliki{" "}
                          <strong className="text-emerald-400 font-bold">buffer waktu 2 jam</strong>. Pesanan siap dikirim tepat waktu!
                        </>
                      ) : (
                        <>
                          Stasiun Perakitan &amp; Packing kekurangan{" "}
                          <strong className="font-bold text-rose-400">8 Jam Kerja</strong>. Jika diterima langsung, pesanan berisiko terlambat 1 hari kerja.
                        </>
                      )}
                    </p>

                    {/* Bottleneck Breakdown Bar */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-[#CBD5E1] font-medium">Baking &amp; Oven (Kapasitas: 85%)</span>
                        <span className="text-emerald-400 font-bold">Aman</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
                      </div>

                      <div className="flex justify-between text-[11px] mt-1">
                        <span
                          className={`font-bold ${
                            heroSolved ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          Packing &amp; Assembly Box ({heroSolved ? "Kapasitas: 82%" : "Kapasitas: 118%"})
                        </span>
                        <span
                          className={`font-bold ${
                            heroSolved ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {heroSolved ? "Buffer +2 Jam" : "+8 Jam Defisit"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            heroSolved ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: heroSolved ? "82%" : "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Step C: Smart Recommendation */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[13px] font-bold">
                      <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                      <span>Rekomendasi Cerdas BizCapacity:</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[12px] text-slate-700 dark:text-[#CBD5E1] pl-1">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">
                          check
                        </span>
                        <span>
                          Opsi 1: Tambah <strong>1 Tenaga Harian Lepas</strong> (Shift Siang) → Kapasitas bergeser aman ke 82%.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">
                          check
                        </span>
                        <span>
                          Opsi 2: Setujui Overtime <strong>2 Orang x 4 Jam</strong> → Biaya tambahan Rp 320.000 (Margin tetap 34%).
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Bar inside Card */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600 dark:text-[#94A3B8] font-medium">
                      Keputusan Deterministik
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeroSolved(!heroSolved)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[13px] font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span>{heroSolved ? "Reset Simulasi" : "Terapkan Solusi & Terima Order"}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {heroSolved ? "refresh" : "thumb_up"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Industry Badges */}
      <section className="w-full py-8 bg-slate-100/70 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[12px] uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] font-bold whitespace-nowrap">
              Disesuaikan Khusus Alur Kerja:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-[13px] font-bold hover-lift-sm transition-transform cursor-default">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  bakery_dining
                </span>
                <span>Commercial Bakery</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-[13px] font-bold hover-lift-sm transition-transform cursor-default">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  restaurant
                </span>
                <span>Catering &amp; Kitchen</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-[13px] font-bold hover-lift-sm transition-transform cursor-default">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  styler
                </span>
                <span>Konveksi &amp; Garment</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-[13px] font-bold hover-lift-sm transition-transform cursor-default">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  print
                </span>
                <span>Percetakan &amp; Sablon</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-[13px] font-bold hover-lift-sm transition-transform cursor-default">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  featured_seasonal_and_gifts
                </span>
                <span>Custom Gift &amp; Hampers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SME Pain Point Grid */}
      <section className="w-full py-20 bg-[#F8FAFC] dark:bg-[#0B1120]" id="tantangan">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
              Tantangan Operasional UKM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Tantangan Nyata Pemilik Bisnis Setiap Hari: Berjanji Cepat, Menyesal Kemudian.
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-[#94A3B8]">
              Ketika pesanan ramai, kenapa operasional justru semakin kacau dan profit malah tergerus? Inilah 4 jebakan utama manajemen kapasitas konvensional:
            </p>
          </div>

          <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/[0.15] text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">
                  sentiment_very_dissatisfied
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Terlanjur Mengiyakan Pesanan Besar
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Takut kehilangan omzet, pemilik bilang &ldquo;Bisa!&rdquo; sebelum cek jadwal. Akibatnya lembur darurat semalaman, biaya bengkak, dan margin laba ludes seketika.
                </p>
              </div>
              <div className="pt-2 mt-auto text-rose-400 text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                <span>Margin Tergerus 40-70%</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/[0.15] text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">calendar_clock</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Jadwal Produksi Tebak-Tebakan
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Hanya mengandalkan ingatan kepala produksi atau papan tulis manual. Tidak ada yang tahu pasti jam berapa oven, meja potong, atau printer benar-benar lowong.
                </p>
              </div>
              <div className="pt-2 mt-auto text-slate-600 dark:text-[#94A3B8] text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">hourglass_disabled</span>
                <span>Antrean Menumpuk Tanpa Urutan</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/[0.15] text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Bahan Baku Habis di Tengah Jalan
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Kue sudah matang tapi box packaging khusus habis. Baju sudah dijahit tapi kancing kurang. Operasional terhenti total menunggu pengiriman darurat bahan baku.
                </p>
              </div>
              <div className="pt-2 mt-auto text-amber-400 text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>Keterlambatan Kirim 24-48 Jam</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-[#F1F5F9] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">group_off</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Pekerja Kewalahan &amp; Kualitas Drop
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Karyawan lelah berujung kelalaian: salah packing isi kue, jahitan miring, atau salah cetak nama klien. Menimbulkan gelombang komplain dan rating anjlok di medsos.
                </p>
              </div>
              <div className="pt-2 mt-auto text-rose-400 text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">star_half</span>
                <span>Rusaknya Reputasi Brand</span>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section: 4 Steps */}
      <section className="w-full py-20 bg-slate-50 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/[0.06]" id="cara-kerja">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-[12px] uppercase tracking-wider text-blue-400 font-bold">
                Alur Kerja Deterministik
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                Bagaimana BizCapacity Bekerja (4 Langkah Pasti)
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-[#94A3B8]">
                Ubah tebakan menjadi kepastian matematika produksi dalam kurang dari 60 detik.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-blue-400 text-[13px] font-bold shadow-xs border border-white/[0.08]">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>Proses Cepat • Real-time Cloud</span>
            </div>
          </div>

          <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-[16px] font-black">
                  01
                </div>
                <span className="material-symbols-outlined text-blue-400 text-[24px]">input</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">Masukkan Data Pesanan</h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Cukup ketik jumlah kuantiti produk, varian pesanan, dan tanggal/jam deadline pengiriman yang diminta calon pelanggan.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 rounded-xl text-slate-600 dark:text-[#94A3B8] text-[11px] font-medium mt-auto">
                Input via Web, Tablet Kasir, atau Form Cepat WhatsApp CS.
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-[16px] font-black">
                  02
                </div>
                <span className="material-symbols-outlined text-blue-400 text-[24px]">memory</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Mesin Kapasitas Menghitung
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Sistem langsung mencocokkan beban kerja terhadap jadwal mesin aktif, jam kerja karyawan, dan ketersediaan stok bahan di gudang.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 rounded-xl text-slate-600 dark:text-[#94A3B8] text-[11px] font-medium mt-auto">
                Algoritma load-balancing multi-stasiun otomatis.
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-[16px] font-black">
                  03
                </div>
                <span className="material-symbols-outlined text-blue-400 text-[24px]">
                  troubleshoot
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Pahami Bottleneck / Hambatan
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Dapatkan status visual langsung: <strong className="text-emerald-400">FEASIBLE</strong> (Aman), <strong className="text-amber-400">AT RISK</strong> (Mepet), atau <strong className="text-rose-400">NOT FEASIBLE</strong>.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 rounded-xl text-slate-600 dark:text-[#94A3B8] text-[11px] font-medium mt-auto">
                Deteksi dini: Oven kurang 3 jam atau Jar kaca kurang 40 pcs.
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col gap-4 hover-lift hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-[16px] font-black">
                  04
                </div>
                <span className="material-symbols-outlined text-blue-400 text-[24px]">
                  model_training
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Simulasi Solusi (What-If Sandbox)
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Coba simulasi geser deadline, tambah shift lembur 2 jam, atau rekrut tenaga lepasan. Lihat pergeseran kapasitas dan margin sebelum deal dengan klien.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 rounded-xl text-slate-600 dark:text-[#94A3B8] text-[11px] font-medium mt-auto">
                Negosiasi harga &amp; waktu secara percaya diri dan akurat.
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SME Case Study Banner: SweetCrumbs Bakery Jakarta */}
      <section className="w-full py-16 bg-slate-50/60 dark:bg-[#0B1120]" id="studi-kasus">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ScrollReveal>
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm dark:shadow-xl hover-lift">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 relative">
                <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md bg-gradient-to-tr from-blue-700 to-indigo-600 border border-white/[0.08] flex items-center justify-center p-6 text-white text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-[64px] text-white/90">
                      bakery_dining
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[12px] font-bold">
                      Studi Kasus UMKM
                    </span>
                    <h3 className="text-xl font-black">SweetCrumbs Artisan Bakery &amp; Hampers</h3>
                    <p className="text-[13px] text-white/80">Kebayoran Baru, Jakarta Selatan</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <span className="material-symbols-outlined text-[20px]">format_quote</span>
                  <span className="text-[12px] uppercase tracking-wider font-bold">
                    Cerita Nyata Pemilik Bisnis
                  </span>
                </div>
                <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] leading-snug">
                  &ldquo;Dengan BizCapacity, kami berani mengunci order korporat 500 box hampers premium tanpa cemas oven overload ataupun deadline berantakan. Omzet Lebaran kami melesat 2.4x lipat.&rdquo;
                </blockquote>
                <div className="grid grid-cols-3 gap-3 py-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</div>
                    <div className="text-[12px] text-slate-600 dark:text-[#94A3B8]">Tepat Waktu Kirim</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">0 Jam</div>
                    <div className="text-[12px] text-slate-600 dark:text-[#94A3B8]">Lembur Panik / Sia-sia</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">+38%</div>
                    <div className="text-[12px] text-slate-600 dark:text-[#94A3B8]">Kenaikan Margin Bersih</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      BL
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-900 dark:text-[#F1F5F9]">Bilah</span>
                      <span className="text-[12px] text-slate-600 dark:text-[#94A3B8]">
                        Founder &amp; Head Baker, SweetCrumbs Jakarta
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-1 text-[13px] text-blue-400 font-bold hover:underline"
                  >
                    <span>Masuk ke Dashboard</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Interactive Feature Showcase & Grid */}
      <section className="w-full py-20 bg-slate-50 dark:bg-white/[0.02] border-y border-slate-200/80 dark:border-white/[0.06]" id="demo-simulasi">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-blue-400 font-bold">
              Fitur Lengkap Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Segala Hal yang Dibutuhkan untuk Menguasai Kapasitas Toko &amp; Pabrik Anda
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-[#94A3B8]">
              Didesain dengan antarmuka bersih khas desktop modern yang ramah operator bengkel dan kasir front-end.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="fitur">
            {/* Left Side: Interactive Feature List Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-blue-500/50 shadow-md flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">speed</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">Order Capacity Checker</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/[0.15] text-blue-300 font-bold border border-blue-500/20">
                      Utama
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    Kalkulasi kesiapan produksi per tanggal secara otomatis sebelum kasir atau sales menerbitkan faktur down payment.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-white/[0.06] flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.15] text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calendar_view_week</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">Visual Production Queue</h4>
                  <p className="text-[12px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    Papan timeline harian per workstation (stasiun potong, jahit, oven, sablon, finishing) tanpa spreadsheet rumit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-white/[0.06] flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.15] text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">What-If Scenario Sandbox</h4>
                  <p className="text-[12px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    Eksperimen instan: apa yang terjadi jika ada mesin oven yang servis atau jika shift ditambah 2 jam di hari Sabtu.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-white/[0.06] flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.15] text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">layers</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">Material &amp; BOM Tracker</h4>
                  <p className="text-[12px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    Pengurangan otomatis stok ribbon, toples kaca, box karton, dan bahan baku utama saat pesanan dikunci.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Live Interactive Capacity Meter Display */}
            <div className="lg:col-span-7 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">table_chart</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                      Simulasi Jadwal Stasiun Kerja
                    </span>
                    <span className="text-[12px] text-slate-600 dark:text-[#94A3B8]">
                      Tanggal: 14 - 16 April 2025 (Pekan Sibuk)
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/[0.12] text-blue-300 text-[11px] font-bold border border-blue-500/20">
                  Shift 08:00 - 17:00
                </span>
              </div>

              {/* Workstation 1 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-[20px]">oven_gen</span>
                    <span className="text-[14px] font-bold text-slate-900 dark:text-[#F1F5F9]">
                      Stasiun 01: Deck Oven Utama (4 Dek)
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/[0.20] text-emerald-300 border border-emerald-500/30 font-bold">
                    Kapasitas: 72% (Aman)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden flex">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[#94A3B8]">
                  <span>Terpakai: 26 Jam dari total 36 Jam mesin</span>
                  <span className="font-bold text-blue-400">Sisa 10 Jam Kosong</span>
                </div>
              </div>

              {/* Workstation 2 */}
              <div
                className={`flex flex-col gap-1.5 p-4 rounded-2xl border transition-all ${
                  workstationOvertimeActive
                    ? "bg-emerald-500/[0.10] border-emerald-500/25"
                    : "bg-rose-500/[0.10] border-rose-500/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        workstationOvertimeActive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      package_2
                    </span>
                    <span className="text-[14px] font-bold text-slate-900 dark:text-[#F1F5F9]">
                      Stasiun 02: Meja Perakitan &amp; Finishing Box
                    </span>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      workstationOvertimeActive
                        ? "bg-emerald-500/[0.20] text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/[0.20] text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {workstationOvertimeActive
                      ? "Kapasitas: 78% (Aman)"
                      : "Kapasitas: 104% (Overload)"}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      workstationOvertimeActive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: workstationOvertimeActive ? "78%" : "100%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-[#94A3B8]">
                    {workstationOvertimeActive
                      ? "Terpakai: 52 Jam dari total 66 Jam kerja (+4 Jam lembur)"
                      : "Terpakai: 52 Jam dari total 50 Jam kerja reguler"}
                  </span>
                  <span
                    className={`font-bold ${
                      workstationOvertimeActive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {workstationOvertimeActive ? "Buffer +14 Jam" : "Defisit 2 Jam (Butuh Overtime)"}
                  </span>
                </div>
              </div>

              {/* Workstation 3 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">
                      task_alt
                    </span>
                    <span className="text-[14px] font-bold text-slate-900 dark:text-[#F1F5F9]">
                      Stasiun 03: QC Kartu Ucapan &amp; Ribbon Tag
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/[0.20] text-amber-300 border border-amber-500/30 font-bold">
                    Kapasitas: 89% (Mepet)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden flex">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "89%" }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[#94A3B8]">
                  <span>Terpakai: 16 Jam dari total 18 Jam kerja</span>
                  <span className="font-bold text-amber-400">Sisa 2 Jam Cadangan</span>
                </div>
              </div>

              {/* Micro-controller toggle */}
              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[22px]">tune</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-[#F1F5F9]">
                      Uji Coba: Tambah 1 Shift Lembur (+4 Jam)
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                      Lihat perubahan Stasiun 02 secara real-time menjadi aman hijau
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkstationOvertimeActive(!workstationOvertimeActive)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.10] text-blue-400 hover:bg-white/[0.10] text-[12px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {workstationOvertimeActive ? "undo" : "refresh"}
                  </span>
                  <span>{workstationOvertimeActive ? "Nonaktifkan Lembur" : "Aktifkan Simulasi"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Metrics & FAQ Snippet */}
      <section className="w-full py-20 bg-[#F8FAFC] dark:bg-[#0B1120]" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-14">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
              Hasil Terbukti Nyata
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Efisiensi Produksi Lebih Tenang, Laba Lebih Maksimal
            </h2>
          </div>

          {/* Stat Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-8 rounded-2xl shadow-sm flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-blue-400">99.4%</div>
              <div className="text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9]">Ketepatan Janji Kirim</div>
              <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] max-w-xs">
                Hampir 0 pelanggan yang menerima pesanan terlambat sejak pesanan diverifikasi sebelum deal.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-8 rounded-2xl shadow-sm flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-amber-400">-65%</div>
              <div className="text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9]">Pengeluaran Lembur Darurat</div>
              <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] max-w-xs">
                Tidak ada lagi upah lembur dadakan tengah malam akibat salah perhitungan jadwal awal.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-8 rounded-2xl shadow-sm flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-blue-400">5 Menit</div>
              <div className="text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9]">Waktu Onboarding Sistem</div>
              <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] max-w-xs">
                Input daftar mesin dan staf Anda, sistem langsung siap menghitung pesanan perdana tanpa instalasi rumit.
              </p>
            </div>
          </div>

          {/* PRICING SECTION - SaaS Bertingkat Terjangkau Khusus UMKM */}
          <div className="w-full pt-10 pb-6 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[12px] uppercase tracking-wider text-blue-300 font-bold bg-blue-500/[0.12] px-3 py-1 rounded-full border border-blue-500/20">
                Paket Langganan SaaS Bertingkat
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                Investasi Kecil, Dampak Besar bagi Kepercayaan Pelanggan
              </h3>
              <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
                Biaya terjangkau yang dirancang khusus untuk daya beli UMKM manufaktur pesanan (MTO). Mulai gratis hari ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
              {/* Card 1: Pemula (Gratis) */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-7 rounded-2xl shadow-sm flex flex-col justify-between hover:border-white/[0.15] transition-all">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">Pemula &amp; Komunitas</span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-[#F1F5F9] mt-1">Paket Starter</h4>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">Untuk usaha mikro, pemula MTO, dan binaan dinas/inkubator.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-white/[0.06]">
                    <span className="text-3xl font-black text-slate-900 dark:text-[#F1F5F9]">Rp 0</span>
                    <span className="text-xs text-slate-600 dark:text-[#94A3B8]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-[#CBD5E1]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Hingga 30 pesanan aktif / bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>2 Pengguna (1 Owner + 1 Admin Staf)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Cek Kelayakan Pre-Order Real-time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Jadwal Produksi Visual Mingguan</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl border border-blue-500/30 text-blue-400 text-xs font-bold text-center hover:bg-blue-500/[0.10] transition-all block"
                >
                  Mulai Gratis Sekarang
                </Link>
              </div>

              {/* Card 2: Mandiri Bertumbuh (Paling Populer) */}
              <div className="bg-gradient-to-b from-blue-500/[0.10] to-white/[0.04] backdrop-blur-xl border-2 border-blue-500 p-7 rounded-2xl shadow-xl flex flex-col justify-between relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Paling Populer • Pilihan UMKM
                </span>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tumbuh &amp; Aktif</span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-[#F1F5F9] mt-1">Mandiri Bertumbuh</h4>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">Setara harga 1 porsi hampers/kue untuk amankan seluruh pesanan.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-white/[0.08]">
                    <span className="text-3xl font-black text-blue-400">Rp 49.000</span>
                    <span className="text-xs text-slate-600 dark:text-[#94A3B8]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-[#CBD5E1]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span><strong>Pesanan Tanpa Batas (Unlimited)</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Hingga 5 Staf Produksi &amp; Operator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span><strong>Simulasi What-If Lengkap</strong> (Lembur, Outsource, Split)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Detektor Bottleneck &amp; Restock Otomatis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Notifikasi WhatsApp Real-time</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold text-center hover:from-blue-500 hover:to-blue-400 shadow-md transition-all block"
                >
                  Pilih Paket Bertumbuh
                </Link>
              </div>

              {/* Card 3: Bisnis + AI Advisor */}
              <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] p-7 rounded-2xl shadow-sm flex flex-col justify-between hover:border-white/[0.15] transition-all">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">Skala Menengah &amp; Maklon</span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-[#F1F5F9] mt-1">Bisnis + AI Advisor</h4>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">Konsultan cerdas kapasitas &amp; negosiasi otomatis berbasis AI.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-white/[0.06]">
                    <span className="text-3xl font-black text-slate-900 dark:text-[#F1F5F9]">Rp 149.000</span>
                    <span className="text-xs text-slate-600 dark:text-[#94A3B8]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-[#CBD5E1]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Semua fitur Paket Mandiri Bertumbuh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400 text-[16px]">auto_awesome</span>
                      <span><strong>Explain with AI Kontekstual</strong> (Konsultan Kapasitas)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Multi-Workshop &amp; Tim Tanpa Batas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Analitik Historis 90 Hari &amp; Laporan PDF</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl border border-white/[0.15] text-slate-900 dark:text-[#F1F5F9] text-xs font-bold text-center hover:bg-white/[0.06] transition-all block"
                >
                  Pilih Paket AI Advisor
                </Link>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordions */}
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-3 pt-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] text-center mb-3">
              Pertanyaan Umum Pemilik Bisnis
            </h3>

            {/* FAQ 1 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(0)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9] cursor-pointer"
              >
                <span>Apakah software ini rumit seperti ERP pabrik besar?</span>
                <span className="material-symbols-outlined text-blue-400 text-[22px]">
                  {openFaq === 0 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 0 && (
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed pt-2 border-t border-white/[0.06]">
                  Sama sekali tidak. BizCapacity dirancang khusus untuk pemilik usaha UKM dan supervisor lapangan. Tanpa jargon manufaktur rumit. Bahasa yang dipakai sangat sederhana: jam oven, pekerja, kuota packing, dan tanggal siap kirim.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(1)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9] cursor-pointer"
              >
                <span>Bagaimana jika pesanan saya custom (spesifikasi beda-beda)?</span>
                <span className="material-symbols-outlined text-blue-400 text-[22px]">
                  {openFaq === 1 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 1 && (
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed pt-2 border-t border-white/[0.06]">
                  Sangat cocok! Anda bisa membuat resep produk atau template estimasi pengerjaan (misal: Sablon 3 warna butuh 2x waktu stasiun dryer). Kapasitas dihitung dinamis berdasarkan kompleksitas pesanan.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(2)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-slate-900 dark:text-[#F1F5F9] cursor-pointer"
              >
                <span>Bisa diakses dari smartphone atau tablet kasir?</span>
                <span className="material-symbols-outlined text-blue-400 text-[22px]">
                  {openFaq === 2 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 2 && (
                <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed pt-2 border-t border-white/[0.06]">
                  Bisa. Tim admin sales di WhatsApp atau kasir toko dapat mengecek slot kapasitas langsung dari HP sebelum mengiyakan pesanan dari pelanggan.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final High-Contrast CTA Banner */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0F172A] to-[#0B1120] text-[#F1F5F9] relative overflow-hidden border-t border-white/[0.06]">
        {/* Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] text-blue-300 text-[12px] font-bold border border-white/[0.10]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Mulai Gratis • Paket Berlangganan UMKM Mulai Rp 49.000/bln</span>
          </div>

          <div className="flex flex-col gap-2 max-w-3xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Siap Selamatkan Reputasi &amp; Jadwal Produksi Bisnis Anda?
            </h2>
            <p className="text-[16px] text-white/80 max-w-2xl mx-auto leading-relaxed">
              Jangan biarkan satu pesanan terlambat menghancurkan kepercayaan pelanggan yang Anda bangun bertahun-tahun. Coba BizCapacity hari ini dan ketahui batas kapasitas Anda secara presisi.
            </p>
          </div>

          {/* Quick Signup Box */}
          <form
            onSubmit={handleHeroQuickSignup}
            className="w-full max-w-xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 items-center"
          >
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#64748B] text-[20px]">
                mail
              </span>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Masukkan email bisnis / operasional Anda..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] text-[#F1F5F9] placeholder:text-[#64748B] text-[14px] focus:outline-none focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/25 border border-white/[0.08]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[14px] font-bold transition-all whitespace-nowrap shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Daftar Gratis</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-[12px] font-semibold pt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
              <span>Akses Semua Fitur Kapasitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
              <span>Pendampingan Setup Gratis oleh Tim Ahli</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
              <span>Bisa Berhenti Kapan Saja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer (Responsive) */}
      <footer className="w-full bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-12 pb-8">
          {/* Top Verification Banner */}
          <div className="bg-slate-50 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-5 sm:p-6 mb-10 sm:mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/[0.15] border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <div>
                <div className="text-[15px] font-extrabold text-slate-900 dark:text-[#F1F5F9]">
                  Terverifikasi untuk UKM Indonesia
                </div>
                <div className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                  Sistem pendukung keputusan kapasitas produksi untuk Bakery, Konveksi, Percetakan, dan Katering.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto shrink-0">
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-blue-400">security</span>
                <span>ISO 27001 Ready</span>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-blue-400">hub</span>
                <span>Standar Kemenkop UKM</span>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-[#F1F5F9] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-blue-400">domain_verification</span>
                <span>DSS Engine Verified</span>
              </div>
            </div>
          </div>

          {/* Links Grid: 2 columns on mobile, 4 on tablet, 5 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-7 sm:gap-8 mb-10 sm:mb-12">
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-3.5">
              <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" />
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] max-w-sm leading-relaxed mt-1">
                Know Your Capacity Before You Promise. Solusi terpadu pemetaan kapasitas produksi real-time, manajemen antrean pesanan, dan kalkulasi otomatis untuk produsen dan manufaktur skala menengah di Indonesia.
              </p>
              <div className="text-[11px] text-[#64748B]">
                Operasional Berbasis di: Jakarta &amp; Surabaya, Indonesia
              </div>
            </div>

            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider mb-3">Solusi Industri</div>
              <ul className="flex flex-col gap-2 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Commercial Bakery</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Garment &amp; Konveksi</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Screen Printing &amp; Sablon</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Catering &amp; Dapur Bersama</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Custom Box &amp; Hampers</li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider mb-3">Platform</div>
              <ul className="flex flex-col gap-2 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li>
                  <Link href="/orders/new" className="hover:text-blue-400 transition-colors">
                    Kalkulator Kapasitas
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-blue-400 transition-colors">
                    Antrean Produksi Visual
                  </Link>
                </li>
                <li>
                  <Link href="/simulations" className="hover:text-blue-400 transition-colors">
                    Simulasi What-If
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-blue-400 transition-colors">
                    Paket UMKM Mandiri
                  </Link>
                </li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Notifikasi WhatsApp</li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs font-extrabold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider mb-3">Akses Cepat</div>
              <ul className="flex flex-col gap-2 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li>
                  <Link href="/login" className="hover:text-blue-400 transition-colors font-semibold">
                    Masuk ke Akun
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-blue-400 transition-colors font-semibold">
                    Daftar Akun Baru
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors font-semibold">
                    Dashboard Operasional
                  </Link>
                </li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Kebijakan Privasi</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Syarat &amp; Ketentuan</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-[#94A3B8] text-center sm:text-left">
            <div>© 2026 BizCapacity Indonesia • Hak Cipta Dilindungi Undang-Undang.</div>
            <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
              <span>Bahasa Indonesia (ID)</span>
              <span>•</span>
              <span>Server Lokal (Semarang DC)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
