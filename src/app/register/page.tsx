"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[a-zA-Z]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (!password) return "Min. 8 karakter (huruf & angka)";
    if (strength <= 1) return "Kekuatan: Lemah";
    if (strength === 2) return "Kekuatan: Cukup";
    if (strength === 3) return "Kekuatan: Bagus";
    return "Kekuatan: Sangat Aman";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (typeof window !== "undefined") {
      const industryLabels: Record<string, string> = {
        bakery: "Bakery & Pastry",
        catering: "Katering & F&B",
        hampers: "Hampers & Custom Gift",
        garment: "Konveksi & Garment",
        printing: "Percetakan & Cetak",
        crafts: "Workshop Kreatif",
      };

      if (businessName.trim()) {
        localStorage.setItem("biz_name", businessName.trim());
      }
      if (industry) {
        localStorage.setItem("biz_type", industryLabels[industry] || industry);
      }
      if (fullname.trim()) {
        localStorage.setItem("biz_owner", fullname.trim());
      }
      if (email.trim()) {
        localStorage.setItem("biz_email", email.trim());
      }
      if (phone.trim()) {
        localStorage.setItem("biz_phone", phone.trim());
      }
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F1F5F9] transition-colors duration-200">
      <div className="flex flex-col w-full max-w-7xl mx-auto py-4">
        {/* Dynamic Top Banner */}
        <div className="flex items-center justify-between mb-6 px-2">
          <BrandLogo size="md" subtitleText="Sistem Keputusan Kapasitas UMKM" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Kembali ke Beranda</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-2 bg-blue-50 dark:bg-blue-500/[0.10] border border-blue-200 dark:border-blue-500/20 px-4 py-1.5 rounded-full">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] text-blue-700 dark:text-blue-300 font-semibold">
                Live Engine v4.2 â€¢ Kapasitas Cloud UMKM
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Registration Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white/85 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl dark:shadow-2xl dark:shadow-black/30 p-6 sm:p-10">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/[0.10] px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
                Mulai Gratis â€¢ Paket Berlangganan UMKM Mulai Rp 49.000/bln
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight mt-3 mb-2">
                Mulai Kendalikan Kapasitas Produksi Anda
              </h1>
              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Bergabung dengan 450+ pelaku usaha bakery, katering, dan custom hampers di Indonesia untuk mencegah overcapacity dan keterlambatan pesanan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Fullname & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="fullname">
                    Nama Lengkap
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="contoh: Bilah"
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] border border-slate-200 dark:border-white/[0.10] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-white/[0.08] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-[14px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="business-name">
                    Nama Usaha / Brand
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="contoh: SweetCrumbs Bakery &amp; Hampers"
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] border border-slate-200 dark:border-white/[0.10] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-white/[0.08] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-[14px]"
                  />
                </div>
              </div>

              {/* Row 2: Business Email & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="email">
                    Email Bisnis
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bilah@sweetcrumbs.id"
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] border border-slate-200 dark:border-white/[0.10] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-white/[0.08] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-[14px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="phone">
                      Nomor WhatsApp Aktif
                    </label>
                    <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">notifications_active</span>
                      <span>Notif Real-time</span>
                    </span>
                  </div>
                  <div className="flex rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] focus-within:bg-white dark:focus-within:bg-white/[0.08] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/25 transition-all overflow-hidden h-11">
                    <div className="flex items-center px-3 bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-[#F1F5F9] text-[12px] font-bold select-none gap-1.5 border-r border-slate-200 dark:border-white/[0.08]">
                      <span className="inline-block w-4 h-3 rounded-xs overflow-hidden relative shadow-xs">
                        <span className="absolute inset-x-0 top-0 h-1.5 bg-red-600"></span>
                        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white"></span>
                      </span>
                      <span>+62</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="812-3456-7890"
                      className="w-full px-4 bg-transparent text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Industry Category */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="industry">
                  Kategori Industri
                </label>
                <div className="relative">
                  <select
                    id="industry"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.10] text-slate-900 dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-white/[0.08] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all appearance-none text-[14px] cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0F172A] text-white">Pilih model workstation &amp; kapasitas usaha Anda</option>
                    <option value="bakery" className="bg-[#0F172A] text-white">Bakery &amp; Pastry (Kapasitas Oven, Mixer, Cooling)</option>
                    <option value="catering" className="bg-[#0F172A] text-white">Katering &amp; F&amp;B (Kapasitas Prep, Batch Memasak, Packing)</option>
                    <option value="hampers" className="bg-[#0F172A] text-white">Hampers &amp; Gift Box (Kapasitas Meja Rakit, Pita &amp; QC)</option>
                    <option value="garment" className="bg-[#0F172A] text-white">Garment &amp; Konveksi (Kapasitas Pola, Jahit, Finishing)</option>
                    <option value="printing" className="bg-[#0F172A] text-white">Percetakan (Kapasitas Mesin Cetak, Potong, Laminasi)</option>
                    <option value="crafts" className="bg-[#0F172A] text-white">Custom Crafts &amp; Workshop Kreatif</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3 text-[#64748B] text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Row 4: Password with strength bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-[#F1F5F9]" htmlFor="password">
                    Buat Kata Sandi
                  </label>
                  <span
                    className={`text-[12px] font-semibold ${
                      strength <= 1
                        ? "text-red-400"
                        : strength === 2
                        ? "text-amber-400"
                        : strength === 3
                        ? "text-blue-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white dark:bg-white/[0.05] text-slate-900 dark:text-[#F1F5F9] border border-slate-200 dark:border-white/[0.10] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-white/[0.08] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-[#64748B] hover:text-slate-700 dark:hover:text-white p-1 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* Strength 4-segment bars */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      strength >= 1
                        ? strength === 1
                          ? "bg-red-500"
                          : strength === 2
                          ? "bg-amber-500"
                          : strength === 3
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                        : "bg-slate-200 dark:bg-white/[0.08]"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      strength >= 2
                        ? strength === 2
                          ? "bg-amber-500"
                          : strength === 3
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                        : "bg-slate-200 dark:bg-white/[0.08]"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      strength >= 3
                        ? strength === 3
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                        : "bg-slate-200 dark:bg-white/[0.08]"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      strength >= 4 ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/[0.08]"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-white/[0.15] bg-white dark:bg-white/[0.05] cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[12px] text-slate-500 dark:text-[#94A3B8] leading-relaxed select-none cursor-pointer"
                >
                  Saya menyetujui{" "}
                  <a href="#" className="text-blue-400 hover:underline font-bold">
                    Ketentuan Layanan
                  </a>{" "}
                  &amp;{" "}
                  <a href="#" className="text-blue-400 hover:underline font-bold">
                    Kebijakan Privasi
                  </a>{" "}
                  BizCapacity.
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      <span>Menyiapkan Akun &amp; Workshop...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar &amp; Mulai Setup Usaha (Mulai Tanpa Biaya)</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Reassurance Badges */}
              <div className="pt-2 pb-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 flex flex-wrap items-center justify-around gap-2 text-slate-500 dark:text-[#94A3B8]">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">
                    check_circle
                  </span>
                  <span>Tanpa Biaya Setup Awal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-blue-400 text-[16px]">
                    timer
                  </span>
                  <span>Setup Dalam 3 Menit</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                    upgrade
                  </span>
                  <span>Upgrade Kapan Saja</span>
                </div>
              </div>

              {/* Switch to Login */}
              <div className="text-center pt-2 text-[13px] text-slate-500 dark:text-[#94A3B8]">
                Sudah memiliki akun usaha?{" "}
                <Link href="/login" className="text-blue-400 font-bold hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT: Feature Perks & Live Micro-Simulators (5 Cols) */}
          <div className="lg:col-span-5 space-y-5 flex flex-col">
            {/* Perks Card */}
            <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#64748B] font-bold">
                  Mengapa BizCapacity?
                </span>
                <span className="text-[11px] text-blue-300 bg-blue-500/[0.12] border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  Anti-Overbooking
                </span>
              </div>

              {/* Perk 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-slate-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.15] flex items-center justify-center text-blue-400 shrink-0">
                  <span className="material-symbols-outlined text-[22px]">event_available</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[14px] text-slate-900 dark:text-[#F1F5F9]">
                    Cek kapasitas order sebelum deal
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                    Ketahui detik ini juga apakah oven atau meja potong siap menerima order tambahan 1.000 pcs tanpa lembur berlebihan.
                  </p>
                </div>
              </div>

              {/* Perk 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-slate-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/[0.15] flex items-center justify-center text-indigo-400 shrink-0">
                  <span className="material-symbols-outlined text-[22px]">engineering</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[14px] text-slate-900 dark:text-[#F1F5F9]">
                    Simulasi pekerja &amp; lembur instan
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                    Tinggal geser what-if scenario untuk melihat dampak penambahan shift lembur terhadap tanggal tenggat penyelesaian.
                  </p>
                </div>
              </div>

              {/* Perk 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-slate-100 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/[0.15] flex items-center justify-center text-amber-400 shrink-0">
                  <span className="material-symbols-outlined text-[22px]">view_timeline</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[14px] text-slate-900 dark:text-[#F1F5F9]">
                    Dashboard antrean lantai produksi
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                    Pantau titik macet secara visual: bahan baku terhambat, workstation over-capacity, atau batch siap dikirim ke kurir.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Capacity Mini-Card Preview */}
            <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[13px] text-slate-900 dark:text-[#F1F5F9] font-bold">
                    Simulasi Beban Batch Hari Ini
                  </span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/[0.15] text-emerald-300 border border-emerald-500/20 font-bold">
                  Kapasitas Tersedia
                </span>
              </div>

              {/* Production Workstation Load Meters */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold">Mixer Adonan Utama (40kg)</span>
                    <span className="text-slate-400 dark:text-[#94A3B8] font-bold">
                      68% <span className="font-normal text-[11px]">(Sisa 12kg)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold">Deck Oven Rotary</span>
                    <span className="text-amber-400 font-bold">
                      86% <span className="font-normal text-[11px]">(Hampir Penuh)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden flex">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "86%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-800 dark:text-[#F1F5F9] font-semibold">Stasiun Kemas &amp; Pita Hampers</span>
                    <span className="text-blue-400 font-bold">
                      42% <span className="font-normal text-[11px]">(Sisa 350 box)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Rekomendasi sistem: Terima PO hingga 250 box tambahan</span>
                </div>
              </div>
            </div>

            {/* Testimonial Highlight Card */}
            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                RK
              </div>
              <div className="flex flex-col">
                <p className="text-[12px] text-slate-800 dark:text-[#F1F5F9] italic leading-relaxed">
                  &ldquo;Dulu sering tolak order katering karena takut oven nggak muat. Dengan BizCapacity, kami berani ambil 40% order lebih banyak tanpa telat kirim.&rdquo;
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">Ratna Kusuma</span>
                  <span className="text-[#64748B]">â€¢</span>
                  <span className="text-slate-500 dark:text-[#94A3B8]">Founder Dapur Rasa Artisan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

