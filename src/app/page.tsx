"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* Top Announcement Bar (Responsive) */}
      <div className="w-full bg-[#004ac6] text-white py-1.5 sm:py-2 px-3 sm:px-4 text-center">
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
      <header className="sticky top-0 w-full z-50 bg-[#f8f9ff]/95 backdrop-blur-xl border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
          <div className="shrink-0 max-w-[190px] sm:max-w-none">
            <BrandLogo size="sm" subtitleText="Sistem Kapasitas UMKM" className="sm:hidden" />
            <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" className="hidden sm:flex" />
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#fitur" className="text-[14px] text-[#525e7d] hover:text-[#004ac6] font-medium transition-colors">
              Fitur Platform
            </a>
            <a href="#cara-kerja" className="text-[14px] text-[#525e7d] hover:text-[#004ac6] font-medium transition-colors">
              Cara Kerja (4 Langkah)
            </a>
            <a href="#studi-kasus" className="text-[14px] text-[#525e7d] hover:text-[#004ac6] font-medium transition-colors">
              Studi Kasus UKM
            </a>
            <a href="#faq" className="text-[14px] text-[#525e7d] hover:text-[#004ac6] font-medium transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-[14px] font-semibold text-[#525e7d] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-xl transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#004ac6] text-white text-xs sm:text-[14px] font-bold shadow-md shadow-[#004ac6]/20 hover:bg-[#2563eb] transition-all active:scale-[0.99] whitespace-nowrap"
            >
              Mulai Gratis
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#0b1c30] hover:bg-[#eff4ff] transition-colors flex items-center justify-center"
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
          <div className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-[#e5eeff] px-4 py-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 pb-4 border-b border-[#e5eeff]">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-[#0b1c30] hover:text-[#004ac6] py-2 px-3 rounded-xl hover:bg-[#eff4ff] transition-colors"
              >
                <span>Fitur Platform</span>
                <span className="material-symbols-outlined text-[18px] text-[#737686]">chevron_right</span>
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-[#0b1c30] hover:text-[#004ac6] py-2 px-3 rounded-xl hover:bg-[#eff4ff] transition-colors"
              >
                <span>Cara Kerja (4 Langkah)</span>
                <span className="material-symbols-outlined text-[18px] text-[#737686]">chevron_right</span>
              </a>
              <a
                href="#studi-kasus"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-[#0b1c30] hover:text-[#004ac6] py-2 px-3 rounded-xl hover:bg-[#eff4ff] transition-colors"
              >
                <span>Studi Kasus UKM</span>
                <span className="material-symbols-outlined text-[18px] text-[#737686]">chevron_right</span>
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-[#0b1c30] hover:text-[#004ac6] py-2 px-3 rounded-xl hover:bg-[#eff4ff] transition-colors"
              >
                <span>FAQ &amp; Bantuan</span>
                <span className="material-symbols-outlined text-[18px] text-[#737686]">chevron_right</span>
              </a>
            </div>

            <div className="pt-3.5 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-[#004ac6] bg-[#eff4ff] hover:bg-[#dbe1ff] rounded-xl transition-colors"
              >
                Masuk ke Akun (Login)
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#004ac6] hover:bg-[#2563eb] rounded-xl shadow-md transition-colors"
              >
                Mulai Gratis Sekarang
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#eff4ff] via-[#f8f9ff] to-[#f8f9ff] pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dce9ff] text-[#004ac6] w-fit shadow-xs border border-[#b4c5ff]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-[12px] font-bold">
                  Sistem Keputusan Kapasitas #1 untuk UMKM Produsen
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1c30] leading-tight sm:leading-tight">
                  Ketahui Kapasitas Nyata Toko &amp; Bengkel Anda{" "}
                  <span className="text-[#004ac6] underline decoration-[#cdd9fe] decoration-4 underline-offset-8">
                    Sebelum Mengiyakan
                  </span>{" "}
                  Pesanan.
                </h1>
                <p className="text-[16px] text-[#525e7d] max-w-2xl leading-relaxed">
                  Sistem pendukung keputusan kapasitas produksi cerdas untuk UMKM Indonesia. Cek ketersediaan tenaga kerja, jam oven/mesin, dan stok packaging secara deterministik dalam hitungan detik. Berhenti berjanji dengan tebak-tebakan.
                </p>
              </div>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#004ac6] text-white font-bold text-[15px] shadow-lg shadow-[#004ac6]/25 hover:bg-[#2563eb] transition-all active:scale-[0.99] text-center"
                >
                  <span>Coba Gratis Sekarang</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <a
                  href="#interactive-preview"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0b1c30] font-bold text-[15px] border border-[#e5eeff] shadow-xs hover:bg-[#eff4ff] transition-all"
                >
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">
                    play_circle
                  </span>
                  <span>Lihat Demo Interaktif</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 text-[#525e7d] text-[12px] font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                    check_circle
                  </span>
                  <span>Tanpa kartu kredit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                    check_circle
                  </span>
                  <span>Setup mudah 5 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                    check_circle
                  </span>
                  <span>Support WhatsApp lokal</span>
                </div>
              </div>

              {/* SME Social Proof Avatars */}
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-[#e5eeff] p-4 rounded-2xl shadow-xs">
                <div className="flex -space-x-3 overflow-hidden">
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#004ac6] text-white font-bold flex items-center justify-center text-xs">
                    BL
                  </div>
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#2563eb] text-white font-bold flex items-center justify-center text-xs">
                    RK
                  </div>
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#525e7d] text-white font-bold flex items-center justify-center text-xs">
                    AP
                  </div>
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#004ac6] text-white flex items-center justify-center text-[11px] font-bold">
                    +450
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="text-[14px] text-[#0b1c30] ml-1 font-bold">4.9/5</span>
                  </div>
                  <span className="text-[12px] text-[#525e7d]">
                    Dipercaya 450+ pemilik bakery, katering, konveksi, dan hampers di Jabodetabek &amp; Surabaya
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulation Card Preview */}
            <div className="lg:col-span-5 flex flex-col" id="interactive-preview">
              <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] overflow-hidden">
                {/* Simulated App Header */}
                <div className="bg-[#213145] text-[#eaf1ff] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ba1a1a]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#bc4800]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-[12px] text-white/80 ml-2 font-medium">
                      BizCapacity • Real-Time Order Verification
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-white font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Simulation
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col gap-4 bg-white">
                  {/* Step A: Incoming Order */}
                  <div className="flex flex-col gap-1 pb-3 bg-[#eff4ff] border border-[#dbe1ff] p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-[#525e7d] font-bold">
                        Pesanan Masuk
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#dbe1ff] text-[#003ea8] font-bold">
                        ID: #ORD-7821
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-[18px] font-extrabold text-[#0b1c30]">
                        300 Hampers Lebaran Royale
                      </div>
                      <div className="text-[13px] font-bold text-[#004ac6]">
                        Deadline: 3 Hari
                      </div>
                    </div>
                    <div className="text-[12px] text-[#525e7d] flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>Total Kebutuhan Produksi: 48 Jam Kerja Terdistribusi</span>
                    </div>
                  </div>

                  {/* Step B: Capacity Check Result */}
                  <div
                    className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all ${
                      heroSolved
                        ? "bg-[#dcfce7]/40 border-[#15803d]/30"
                        : "bg-[#fee2e2]/40 border-[#ba1a1a]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-1.5 text-[14px] font-bold ${
                          heroSolved ? "text-[#15803d]" : "text-[#ba1a1a]"
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
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : "bg-[#fee2e2] text-[#ba1a1a]"
                        }`}
                      >
                        {heroSolved ? "Kapasitas Aman" : "Defisit Kapasitas"}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#0b1c30] mt-1 leading-relaxed">
                      {heroSolved ? (
                        <>
                          Lembur 2 orang x 4 jam disetujui. Stasiun Perakitan kini memiliki{" "}
                          <strong className="text-[#15803d] font-bold">buffer waktu 2 jam</strong>. Pesanan siap dikirim tepat waktu!
                        </>
                      ) : (
                        <>
                          Stasiun Perakitan &amp; Packing kekurangan{" "}
                          <strong className="font-bold text-[#ba1a1a]">8 Jam Kerja</strong>. Jika diterima langsung, pesanan berisiko terlambat 1 hari kerja.
                        </>
                      )}
                    </p>

                    {/* Bottleneck Breakdown Bar */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#0b1c30] font-medium">Baking &amp; Oven (Kapasitas: 85%)</span>
                        <span className="text-emerald-700 font-bold">Aman</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                        <div className="h-full bg-[#004ac6] rounded-full" style={{ width: "85%" }}></div>
                      </div>

                      <div className="flex justify-between text-[11px] mt-1">
                        <span
                          className={`font-bold ${
                            heroSolved ? "text-[#15803d]" : "text-[#ba1a1a]"
                          }`}
                        >
                          Packing &amp; Assembly Box ({heroSolved ? "Kapasitas: 82%" : "Kapasitas: 118%"})
                        </span>
                        <span
                          className={`font-bold ${
                            heroSolved ? "text-[#15803d]" : "text-[#ba1a1a]"
                          }`}
                        >
                          {heroSolved ? "Buffer +2 Jam" : "+8 Jam Defisit"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            heroSolved ? "bg-[#15803d]" : "bg-[#ba1a1a]"
                          }`}
                          style={{ width: heroSolved ? "82%" : "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Step C: Smart Recommendation */}
                  <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[#004ac6] text-[13px] font-bold">
                      <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                      <span>Rekomendasi Cerdas BizCapacity:</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[12px] text-[#0b1c30] pl-1">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">
                          check
                        </span>
                        <span>
                          Opsi 1: Tambah <strong>1 Tenaga Harian Lepas</strong> (Shift Siang) → Kapasitas bergeser aman ke 82%.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">
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
                    <span className="text-[11px] text-[#525e7d] font-medium">
                      Keputusan Deterministik
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeroSolved(!heroSolved)}
                      className="px-4 py-2 rounded-xl bg-[#004ac6] text-white text-[13px] font-bold hover:bg-[#2563eb] shadow-md shadow-[#004ac6]/20 flex items-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
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
      <section className="w-full py-8 bg-[#eff4ff] border-y border-[#e5eeff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[12px] uppercase tracking-wider text-[#525e7d] font-bold whitespace-nowrap">
              Disesuaikan Khusus Alur Kerja:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs border border-[#e5eeff] text-[#0b1c30] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                  bakery_dining
                </span>
                <span>Commercial Bakery</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs border border-[#e5eeff] text-[#0b1c30] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                  restaurant
                </span>
                <span>Catering &amp; Kitchen</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs border border-[#e5eeff] text-[#0b1c30] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                  styler
                </span>
                <span>Konveksi &amp; Garment</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs border border-[#e5eeff] text-[#0b1c30] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                  print
                </span>
                <span>Percetakan &amp; Sablon</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs border border-[#e5eeff] text-[#0b1c30] text-[13px] font-bold">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">
                  featured_seasonal_and_gifts
                </span>
                <span>Custom Gift &amp; Hampers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SME Pain Point Grid */}
      <section className="w-full py-20 bg-white" id="tantangan">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-[#004ac6] font-bold">
              Tantangan Operasional UKM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Tantangan Nyata Pemilik Bisnis Setiap Hari: Berjanji Cepat, Menyesal Kemudian.
            </h2>
            <p className="text-[15px] text-[#525e7d]">
              Ketika pesanan ramai, kenapa operasional justru semakin kacau dan profit malah tergerus? Inilah 4 jebakan utama manajemen kapasitas konvensional:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-6 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">
                  sentiment_very_dissatisfied
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Terlanjur Mengiyakan Pesanan Besar
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Takut kehilangan omzet, pemilik bilang &ldquo;Bisa!&rdquo; sebelum cek jadwal. Akibatnya lembur darurat semalaman, biaya bengkak, dan margin laba ludes seketika.
                </p>
              </div>
              <div className="pt-2 mt-auto text-[#ba1a1a] text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                <span>Margin Tergerus 40-70%</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-6 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#dce9ff] text-[#004ac6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">calendar_clock</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Jadwal Produksi Tebak-Tebakan
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Hanya mengandalkan ingatan kepala produksi atau papan tulis manual. Tidak ada yang tahu pasti jam berapa oven, meja potong, atau printer benar-benar lowong.
                </p>
              </div>
              <div className="pt-2 mt-auto text-[#525e7d] text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">hourglass_disabled</span>
                <span>Antrean Menumpuk Tanpa Urutan</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-6 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#ffdbcd] text-[#943700] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Bahan Baku Habis di Tengah Jalan
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Kue sudah matang tapi box packaging khusus habis. Baju sudah dijahit tapi kancing kurang. Operasional terhenti total menunggu pengiriman darurat bahan baku.
                </p>
              </div>
              <div className="pt-2 mt-auto text-[#943700] text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>Keterlambatan Kirim 24-48 Jam</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-6 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#0b1c30] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">group_off</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Pekerja Kewalahan &amp; Kualitas Drop
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Karyawan lelah berujung kelalaian: salah packing isi kue, jahitan miring, atau salah cetak nama klien. Menimbulkan gelombang komplain dan rating anjlok di medsos.
                </p>
              </div>
              <div className="pt-2 mt-auto text-[#ba1a1a] text-[12px] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">star_half</span>
                <span>Rusaknya Reputasi Brand</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section: 4 Steps */}
      <section className="w-full py-20 bg-[#eff4ff] border-y border-[#e5eeff]" id="cara-kerja">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-[12px] uppercase tracking-wider text-[#004ac6] font-bold">
                Alur Kerja Deterministik
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Bagaimana BizCapacity Bekerja (4 Langkah Pasti)
              </h2>
              <p className="text-[15px] text-[#525e7d]">
                Ubah tebakan menjadi kepastian matematika produksi dalam kurang dari 60 detik.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#004ac6] text-[13px] font-bold shadow-xs border border-[#dbe1ff]">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>Proses Cepat • Real-time Cloud</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[16px] font-black">
                  01
                </div>
                <span className="material-symbols-outlined text-[#004ac6] text-[24px]">input</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">Masukkan Data Pesanan</h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Cukup ketik jumlah kuantiti produk, varian pesanan, dan tanggal/jam deadline pengiriman yang diminta calon pelanggan.
                </p>
              </div>
              <div className="bg-[#eff4ff] border border-[#dbe1ff] p-3 rounded-xl text-[#525e7d] text-[11px] font-medium mt-auto">
                Input via Web, Tablet Kasir, atau Form Cepat WhatsApp CS.
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[16px] font-black">
                  02
                </div>
                <span className="material-symbols-outlined text-[#004ac6] text-[24px]">memory</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Mesin Kapasitas Menghitung
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Sistem langsung mencocokkan beban kerja terhadap jadwal mesin aktif, jam kerja karyawan, dan ketersediaan stok bahan di gudang.
                </p>
              </div>
              <div className="bg-[#eff4ff] border border-[#dbe1ff] p-3 rounded-xl text-[#525e7d] text-[11px] font-medium mt-auto">
                Algoritma load-balancing multi-stasiun otomatis.
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[16px] font-black">
                  03
                </div>
                <span className="material-symbols-outlined text-[#004ac6] text-[24px]">
                  troubleshoot
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Pahami Bottleneck / Hambatan
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Dapatkan status visual langsung: <strong className="text-[#15803d]">FEASIBLE</strong> (Aman), <strong className="text-[#b45309]">AT RISK</strong> (Mepet), atau <strong className="text-[#ba1a1a]">NOT FEASIBLE</strong>.
                </p>
              </div>
              <div className="bg-[#eff4ff] border border-[#dbe1ff] p-3 rounded-xl text-[#525e7d] text-[11px] font-medium mt-auto">
                Deteksi dini: Oven kurang 3 jam atau Jar kaca kurang 40 pcs.
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[16px] font-black">
                  04
                </div>
                <span className="material-symbols-outlined text-[#004ac6] text-[24px]">
                  model_training
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                  Simulasi Solusi (What-If Sandbox)
                </h3>
                <p className="text-[13px] text-[#525e7d] leading-relaxed">
                  Coba simulasi geser deadline, tambah shift lembur 2 jam, atau rekrut tenaga lepasan. Lihat pergeseran kapasitas dan margin sebelum deal dengan klien.
                </p>
              </div>
              <div className="bg-[#eff4ff] border border-[#dbe1ff] p-3 rounded-xl text-[#525e7d] text-[11px] font-medium mt-auto">
                Negosiasi harga &amp; waktu secara percaya diri dan akurat.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SME Case Study Banner: SweetCrumbs Bakery Jakarta */}
      <section className="w-full py-16 bg-white" id="studi-kasus">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 relative">
                <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center p-6 text-white text-center">
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
                <div className="flex items-center gap-1.5 text-[#004ac6]">
                  <span className="material-symbols-outlined text-[20px]">format_quote</span>
                  <span className="text-[12px] uppercase tracking-wider font-bold">
                    Cerita Nyata Pemilik Bisnis
                  </span>
                </div>
                <blockquote className="text-xl sm:text-2xl font-bold text-[#0b1c30] leading-snug">
                  &ldquo;Dengan BizCapacity, kami berani mengunci order korporat 500 box hampers premium tanpa cemas oven overload ataupun deadline berantakan. Omzet Lebaran kami melesat 2.4x lipat.&rdquo;
                </blockquote>
                <div className="grid grid-cols-3 gap-3 py-3 bg-white border border-[#e5eeff] p-4 rounded-2xl shadow-xs">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#004ac6]">100%</div>
                    <div className="text-[12px] text-[#525e7d]">Tepat Waktu Kirim</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#004ac6]">0 Jam</div>
                    <div className="text-[12px] text-[#525e7d]">Lembur Panik / Sia-sia</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#004ac6]">+38%</div>
                    <div className="text-[12px] text-[#525e7d]">Kenaikan Margin Bersih</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#004ac6] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      BL
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#0b1c30]">Bilah</span>
                      <span className="text-[12px] text-[#525e7d]">
                        Founder &amp; Head Baker, SweetCrumbs Jakarta
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-1 text-[13px] text-[#004ac6] font-bold hover:underline"
                  >
                    <span>Masuk ke Dashboard</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase & Grid */}
      <section className="w-full py-20 bg-[#eff4ff] border-y border-[#e5eeff]" id="demo-simulasi">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-[#004ac6] font-bold">
              Fitur Lengkap Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Segala Hal yang Dibutuhkan untuk Menguasai Kapasitas Toko &amp; Pabrik Anda
            </h2>
            <p className="text-[15px] text-[#525e7d]">
              Didesain dengan antarmuka bersih khas desktop modern yang ramah operator bengkel dan kasir front-end.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="fitur">
            {/* Left Side: Interactive Feature List Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#004ac6] shadow-sm flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">speed</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-extrabold text-[#0b1c30]">Order Capacity Checker</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#003ea8] font-bold">
                      Utama
                    </span>
                  </div>
                  <p className="text-[12px] text-[#525e7d] leading-relaxed">
                    Kalkulasi kesiapan produksi per tanggal secara otomatis sebelum kasir atau sales menerbitkan faktur down payment.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#e5eeff] hover:bg-white flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calendar_view_week</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-[#0b1c30]">Visual Production Queue</h4>
                  <p className="text-[12px] text-[#525e7d] leading-relaxed">
                    Papan timeline harian per workstation (stasiun potong, jahit, oven, sablon, finishing) tanpa spreadsheet rumit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#e5eeff] hover:bg-white flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-[#0b1c30]">What-If Scenario Sandbox</h4>
                  <p className="text-[12px] text-[#525e7d] leading-relaxed">
                    Eksperimen instan: apa yang terjadi jika ada mesin oven yang servis atau jika shift ditambah 2 jam di hari Sabtu.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#e5eeff] hover:bg-white flex items-start gap-4 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">layers</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-extrabold text-[#0b1c30]">Material &amp; BOM Tracker</h4>
                  <p className="text-[12px] text-[#525e7d] leading-relaxed">
                    Pengurangan otomatis stok ribbon, toples kaca, box karton, dan bahan baku utama saat pesanan dikunci.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Live Interactive Capacity Meter Display */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e5eeff] shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#004ac6] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">table_chart</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-extrabold text-[#0b1c30]">
                      Simulasi Jadwal Stasiun Kerja
                    </span>
                    <span className="text-[12px] text-[#525e7d]">
                      Tanggal: 14 - 16 April 2025 (Pekan Sibuk)
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-[11px] font-bold border border-[#dbe1ff]">
                  Shift 08:00 - 17:00
                </span>
              </div>

              {/* Workstation 1 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#004ac6] text-[20px]">oven_gen</span>
                    <span className="text-[14px] font-bold text-[#0b1c30]">
                      Stasiun 01: Deck Oven Utama (4 Dek)
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-bold">
                    Kapasitas: 72% (Aman)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#e5eeff] overflow-hidden flex">
                  <div className="h-full bg-[#004ac6] rounded-full" style={{ width: "72%" }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#525e7d]">
                  <span>Terpakai: 26 Jam dari total 36 Jam mesin</span>
                  <span className="font-bold text-[#004ac6]">Sisa 10 Jam Kosong</span>
                </div>
              </div>

              {/* Workstation 2 */}
              <div
                className={`flex flex-col gap-1.5 p-4 rounded-2xl border transition-all ${
                  workstationOvertimeActive
                    ? "bg-[#dcfce7]/30 border-[#15803d]/30"
                    : "bg-[#fee2e2]/30 border-[#ba1a1a]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        workstationOvertimeActive ? "text-[#15803d]" : "text-[#ba1a1a]"
                      }`}
                    >
                      package_2
                    </span>
                    <span className="text-[14px] font-bold text-[#0b1c30]">
                      Stasiun 02: Meja Perakitan &amp; Finishing Box
                    </span>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      workstationOvertimeActive
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : "bg-[#fee2e2] text-[#ba1a1a]"
                    }`}
                  >
                    {workstationOvertimeActive
                      ? "Kapasitas: 78% (Aman)"
                      : "Kapasitas: 104% (Overload)"}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#e5eeff] overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      workstationOvertimeActive ? "bg-[#15803d]" : "bg-[#ba1a1a]"
                    }`}
                    style={{ width: workstationOvertimeActive ? "78%" : "100%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#525e7d]">
                    {workstationOvertimeActive
                      ? "Terpakai: 52 Jam dari total 66 Jam kerja (+4 Jam lembur)"
                      : "Terpakai: 52 Jam dari total 50 Jam kerja reguler"}
                  </span>
                  <span
                    className={`font-bold ${
                      workstationOvertimeActive ? "text-[#15803d]" : "text-[#ba1a1a]"
                    }`}
                  >
                    {workstationOvertimeActive ? "Buffer +14 Jam" : "Defisit 2 Jam (Butuh Overtime)"}
                  </span>
                </div>
              </div>

              {/* Workstation 3 */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bc4800] text-[20px]">
                      task_alt
                    </span>
                    <span className="text-[14px] font-bold text-[#0b1c30]">
                      Stasiun 03: QC Kartu Ucapan &amp; Ribbon Tag
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbcd] text-[#943700] font-bold">
                    Kapasitas: 89% (Mepet)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#e5eeff] overflow-hidden flex">
                  <div className="h-full bg-[#bc4800] rounded-full" style={{ width: "89%" }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#525e7d]">
                  <span>Terpakai: 16 Jam dari total 18 Jam kerja</span>
                  <span className="font-bold text-[#bc4800]">Sisa 2 Jam Cadangan</span>
                </div>
              </div>

              {/* Micro-controller toggle */}
              <div className="p-4 bg-[#eff4ff] border border-[#dbe1ff] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ac6] text-[22px]">tune</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0b1c30]">
                      Uji Coba: Tambah 1 Shift Lembur (+4 Jam)
                    </span>
                    <span className="text-[11px] text-[#525e7d]">
                      Lihat perubahan Stasiun 02 secara real-time menjadi aman hijau
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkstationOvertimeActive(!workstationOvertimeActive)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-[#dbe1ff] text-[#004ac6] hover:bg-[#dbe1ff] text-[12px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
      <section className="w-full py-20 bg-white" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-14">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-[#004ac6] font-bold">
              Hasil Terbukti Nyata
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Efisiensi Produksi Lebih Tenang, Laba Lebih Maksimal
            </h2>
          </div>

          {/* Stat Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-[#f8f9ff] border border-[#e5eeff] p-8 rounded-2xl shadow-xs flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-[#004ac6]">99.4%</div>
              <div className="text-[15px] font-bold text-[#0b1c30]">Ketepatan Janji Kirim</div>
              <p className="text-[13px] text-[#525e7d] max-w-xs">
                Hampir 0 pelanggan yang menerima pesanan terlambat sejak pesanan diverifikasi sebelum deal.
              </p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#e5eeff] p-8 rounded-2xl shadow-xs flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-[#bc4800]">-65%</div>
              <div className="text-[15px] font-bold text-[#0b1c30]">Pengeluaran Lembur Darurat</div>
              <p className="text-[13px] text-[#525e7d] max-w-xs">
                Tidak ada lagi upah lembur dadakan tengah malam akibat salah perhitungan jadwal awal.
              </p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#e5eeff] p-8 rounded-2xl shadow-xs flex flex-col items-center gap-2">
              <div className="text-4xl sm:text-5xl font-black text-[#004ac6]">5 Menit</div>
              <div className="text-[15px] font-bold text-[#0b1c30]">Waktu Onboarding Sistem</div>
              <p className="text-[13px] text-[#525e7d] max-w-xs">
                Input daftar mesin dan staf Anda, sistem langsung siap menghitung pesanan perdana tanpa instalasi rumit.
              </p>
            </div>
          </div>

          {/* PRICING SECTION - SaaS Bertingkat Terjangkau Khusus UMKM */}
          <div className="w-full pt-10 pb-6 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[12px] uppercase tracking-wider text-[#004ac6] font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Paket Langganan SaaS Bertingkat
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Investasi Kecil, Dampak Besar bagi Kepercayaan Pelanggan
              </h3>
              <p className="text-sm text-[#525e7d]">
                Biaya terjangkau yang dirancang khusus untuk daya beli UMKM manufaktur pesanan (MTO). Mulai gratis hari ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
              {/* Card 1: Pemula (Gratis) */}
              <div className="bg-white border border-[#e5eeff] p-7 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#525e7d] uppercase tracking-wider">Pemula &amp; Komunitas</span>
                    <h4 className="text-xl font-extrabold text-[#0b1c30] mt-1">Paket Starter</h4>
                    <p className="text-xs text-[#525e7d] mt-1">Untuk usaha mikro, pemula MTO, dan binaan dinas/inkubator.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-[#f1f5f9]">
                    <span className="text-3xl font-black text-[#0b1c30]">Rp 0</span>
                    <span className="text-xs text-[#525e7d]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#0b1c30]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Hingga 30 pesanan aktif / bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>2 Pengguna (1 Owner + 1 Admin Staf)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Cek Kelayakan Pre-Order Real-time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Jadwal Produksi Visual Mingguan</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#004ac6] text-[#004ac6] text-xs font-bold text-center hover:bg-[#eff4ff] transition-all block"
                >
                  Mulai Gratis Sekarang
                </Link>
              </div>

              {/* Card 2: Mandiri Bertumbuh (Paling Populer) */}
              <div className="bg-gradient-to-b from-blue-50/50 to-white border-2 border-[#004ac6] p-7 rounded-2xl shadow-md flex flex-col justify-between relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#004ac6] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Paling Populer • Pilihan UMKM
                </span>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#004ac6] uppercase tracking-wider">Tumbuh &amp; Aktif</span>
                    <h4 className="text-xl font-extrabold text-[#0b1c30] mt-1">Mandiri Bertumbuh</h4>
                    <p className="text-xs text-[#525e7d] mt-1">Setara harga 1 porsi hampers/kue untuk amankan seluruh pesanan.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-[#dbe1ff]">
                    <span className="text-3xl font-black text-[#004ac6]">Rp 49.000</span>
                    <span className="text-xs text-[#525e7d]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#0b1c30]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span><strong>Pesanan Tanpa Batas (Unlimited)</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Hingga 5 Staf Produksi &amp; Operator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span><strong>Simulasi What-If Lengkap</strong> (Lembur, Outsource, Split)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Detektor Bottleneck &amp; Restock Otomatis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Notifikasi WhatsApp Real-time</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#004ac6] text-white text-xs font-bold text-center hover:bg-[#003ca2] shadow-sm transition-all block"
                >
                  Pilih Paket Bertumbuh
                </Link>
              </div>

              {/* Card 3: Bisnis + AI Advisor */}
              <div className="bg-white border border-[#e5eeff] p-7 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#525e7d] uppercase tracking-wider">Skala Menengah &amp; Maklon</span>
                    <h4 className="text-xl font-extrabold text-[#0b1c30] mt-1">Bisnis + AI Advisor</h4>
                    <p className="text-xs text-[#525e7d] mt-1">Konsultan cerdas kapasitas &amp; negosiasi otomatis berbasis AI.</p>
                  </div>
                  <div className="flex items-baseline gap-1 py-2 border-y border-[#f1f5f9]">
                    <span className="text-3xl font-black text-[#0b1c30]">Rp 149.000</span>
                    <span className="text-xs text-[#525e7d]">/ bulan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#0b1c30]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Semua fitur Paket Mandiri Bertumbuh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-[16px]">auto_awesome</span>
                      <span><strong>Explain with AI Kontekstual</strong> (Konsultan Kapasitas)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Multi-Workshop &amp; Tim Tanpa Batas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>Analitik Historis 90 Hari &amp; Laporan PDF</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#0b1c30] text-[#0b1c30] text-xs font-bold text-center hover:bg-slate-50 transition-all block"
                >
                  Pilih Paket AI Advisor
                </Link>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordions */}
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-3 pt-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0b1c30] text-center mb-3">
              Pertanyaan Umum Pemilik Bisnis
            </h3>

            {/* FAQ 1 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-5 shadow-xs flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(0)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-[#0b1c30] cursor-pointer"
              >
                <span>Apakah software ini rumit seperti ERP pabrik besar?</span>
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                  {openFaq === 0 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 0 && (
                <p className="text-[13px] text-[#525e7d] leading-relaxed pt-2 border-t border-[#e5eeff]">
                  Sama sekali tidak. BizCapacity dirancang khusus untuk pemilik usaha UKM dan supervisor lapangan. Tanpa jargon manufaktur rumit. Bahasa yang dipakai sangat sederhana: jam oven, pekerja, kuota packing, dan tanggal siap kirim.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-5 shadow-xs flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(1)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-[#0b1c30] cursor-pointer"
              >
                <span>Bagaimana jika pesanan saya custom (spesifikasi beda-beda)?</span>
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                  {openFaq === 1 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 1 && (
                <p className="text-[13px] text-[#525e7d] leading-relaxed pt-2 border-t border-[#e5eeff]">
                  Sangat cocok! Anda bisa membuat resep produk atau template estimasi pengerjaan (misal: Sablon 3 warna butuh 2x waktu stasiun dryer). Kapasitas dihitung dinamis berdasarkan kompleksitas pesanan.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-2xl p-5 shadow-xs flex flex-col gap-2 transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(2)}
                className="w-full flex items-center justify-between text-left text-[15px] font-bold text-[#0b1c30] cursor-pointer"
              >
                <span>Bisa diakses dari smartphone atau tablet kasir?</span>
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                  {openFaq === 2 ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaq === 2 && (
                <p className="text-[13px] text-[#525e7d] leading-relaxed pt-2 border-t border-[#e5eeff]">
                  Bisa. Tim admin sales di WhatsApp atau kasir toko dapat mengecek slot kapasitas langsung dari HP sebelum mengiyakan pesanan dari pelanggan.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final High-Contrast CTA Banner */}
      <section className="w-full py-20 bg-[#213145] text-[#eaf1ff] relative overflow-hidden">
        {/* Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#004ac6]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#bc4800]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#dbe1ff] text-[12px] font-bold border border-white/10">
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
            className="w-full max-w-xl bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 items-center"
          >
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#737686] text-[20px]">
                mail
              </span>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Masukkan email bisnis / operasional Anda..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#737686] text-[14px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#004ac6] text-white text-[14px] font-bold hover:bg-[#2563eb] transition-all whitespace-nowrap shadow-md shadow-[#004ac6]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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
      <footer className="w-full bg-[#eff4ff] border-t border-[#e5eeff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-12 pb-8">
          {/* Top Verification Banner */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 mb-10 sm:mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border border-[#e5eeff] shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <div>
                <div className="text-[15px] font-extrabold text-[#0b1c30]">
                  Terverifikasi untuk UKM Indonesia
                </div>
                <div className="text-xs text-[#525e7d] mt-0.5">
                  Sistem pendukung keputusan kapasitas produksi untuk Bakery, Konveksi, Percetakan, dan Katering.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto shrink-0">
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] text-[#0b1c30] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">security</span>
                <span>ISO 27001 Ready</span>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] text-[#0b1c30] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">hub</span>
                <span>Standar Kemenkop UKM</span>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] text-[#0b1c30] text-xs font-bold text-center">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">domain_verification</span>
                <span>DSS Engine Verified</span>
              </div>
            </div>
          </div>

          {/* Links Grid: 2 columns on mobile, 4 on tablet, 5 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-7 sm:gap-8 mb-10 sm:mb-12">
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-3.5">
              <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" />
              <p className="text-xs text-[#525e7d] max-w-sm leading-relaxed mt-1">
                Know Your Capacity Before You Promise. Solusi terpadu pemetaan kapasitas produksi real-time, manajemen antrean pesanan, dan kalkulasi otomatis untuk produsen dan manufaktur skala menengah di Indonesia.
              </p>
              <div className="text-[11px] text-[#737686]">
                Operasional Berbasis di: Jakarta &amp; Surabaya, Indonesia
              </div>
            </div>

            <div>
              <div className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider mb-3">Solusi Industri</div>
              <ul className="flex flex-col gap-2 text-xs text-[#525e7d]">
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Commercial Bakery</li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Garment &amp; Konveksi</li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Screen Printing &amp; Sablon</li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Catering &amp; Dapur Bersama</li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Custom Box &amp; Hampers</li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider mb-3">Platform</div>
              <ul className="flex flex-col gap-2 text-xs text-[#525e7d]">
                <li>
                  <Link href="/orders/new" className="hover:text-[#004ac6] transition-colors">
                    Kalkulator Kapasitas
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-[#004ac6] transition-colors">
                    Antrean Produksi Visual
                  </Link>
                </li>
                <li>
                  <Link href="/simulations" className="hover:text-[#004ac6] transition-colors">
                    Simulasi What-If
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#004ac6] transition-colors">
                    Paket UMKM Mandiri
                  </Link>
                </li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Notifikasi WhatsApp</li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider mb-3">Akses Cepat</div>
              <ul className="flex flex-col gap-2 text-xs text-[#525e7d]">
                <li>
                  <Link href="/login" className="hover:text-[#004ac6] transition-colors font-semibold">
                    Masuk ke Akun
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#004ac6] transition-colors font-semibold">
                    Daftar Akun Baru
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#004ac6] transition-colors font-semibold">
                    Dashboard Operasional
                  </Link>
                </li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Kebijakan Privasi</li>
                <li className="hover:text-[#004ac6] transition-colors cursor-pointer">Syarat &amp; Ketentuan</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#525e7d] text-center sm:text-left">
            <div>© 2026 BizCapacity Indonesia • Hak Cipta Dilindungi Undang-Undang.</div>
            <div className="flex items-center gap-4 text-[11px] text-[#737686]">
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
