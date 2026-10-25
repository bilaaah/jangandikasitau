"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("Selamat datang");
  const [currentDate, setCurrentDate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [bizName, setBizName] = useState("SweetCrumbs");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : "Selamat sore");
    setCurrentDate(new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));

    try {
      const storedBiz = localStorage.getItem("biz_name");
      if (storedBiz) setBizName(storedBiz);
    } catch {
      // SSR guard
    }
    setOwnerName(session?.user?.name ?? "");
  }, [session?.user?.name]);

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* ── Salam & Status Hari Ini ─── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600">Sistem aktif — data diperbarui otomatis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {greeting}, {ownerName}! 👋
            </h1>
            <p className="mt-1.5 text-sm text-[#64748B] max-w-xl">
              Ini ringkasan usahamu hari ini. Ada <strong className="text-[#0F172A]">1 pesanan yang butuh perhatianmu</strong> — cek rekomendasi di bawah ya.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 text-xs font-medium text-[#64748B] bg-slate-100 border border-[#e2e8f0] px-3.5 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-[#64748B]">calendar_today</span>
            <span>{currentDate || "Hari ini"}</span>
          </div>
        </div>

        {/* ── Panduan Singkat (untuk user baru) ─── */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">lightbulb</span>
            </span>
            <div>
              <p className="text-sm font-bold text-blue-900">Panduan Cepat Sistem Kapasitas {bizName}</p>
              <p className="text-xs text-blue-700 mt-0.5">3 langkah mudah untuk mulai kelola pesanan dan kapasitas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {[
              { step: "1", label: "Isi Data Staf & Bahan", href: "/resources", icon: "group" },
              { step: "2", label: "Masukkan Pesanan", href: "/orders/new", icon: "receipt_long" },
              { step: "3", label: "Lihat Rekomendasi", href: "/simulations", icon: "auto_awesome" },
            ].map((s) => (
              <Link
                key={s.step}
                href={s.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-all"
              >
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{s.step}</span>
                <span className="material-symbols-outlined text-[14px] text-blue-500">{s.icon}</span>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 4 Kartu Status Utama ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Status Produksi Hari Ini</h2>
            <span className="text-xs text-[#94A3B8]">Klik kartu untuk lihat rincian &rarr;</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Kartu 1 */}
            <Link
              href="/production-planning"
              title="Buka Jadwal & Beban Produksi"
              className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] group-hover:text-blue-600 transition-colors">Kapasitas Terpakai</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0F172A] font-mono">82%</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    ⚠️ Perlu Perhatian
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1.5">
                  Masih aman, tapi jangan terima terlalu banyak pesanan baru minggu ini.
                </p>
                <div className="text-[11px] font-bold text-blue-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Buka Timeline Kerja</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Kartu 2 */}
            <Link
              href="/resources"
              title="Buka Data Staf & Jam Kerja"
              className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] group-hover:text-emerald-600 transition-colors">Jam Kerja Staf</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0F172A] font-mono">148</span>
                  <span className="text-xs text-[#64748B]">dari 180 jam/hari</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "82%" }} />
                </div>
                <p className="text-xs text-[#64748B] mt-1">Sisa 32 jam bebas hari ini.</p>
                <div className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Kelola Tim Staf</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Kartu 3 */}
            <Link
              href="/resources"
              title="Buka Data Oven & Mesin"
              className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] group-hover:text-indigo-600 transition-colors">Penggunaan Oven & Mesin</span>
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0F172A] font-mono">72</span>
                  <span className="text-xs text-[#64748B]">dari 96 jam/hari</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "75%" }} />
                </div>
                <p className="text-xs text-[#64748B] mt-1">Masih ada slot kosong untuk batch siang.</p>
                <div className="text-[11px] font-bold text-indigo-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Cek Mesin &amp; Oven</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Kartu 4 — Peringatan */}
            <Link
              href="/simulations?order=bc-1024"
              title="Buka Simulasi untuk Cari Solusi"
              className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-xs flex flex-col justify-between hover:border-rose-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">🔴 Antrian Padat</span>
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-rose-700 font-mono">1 Stasiun</span>
                <p className="text-xs text-rose-700 font-medium mt-1.5">
                  Bagian Packaging Hampers hampir penuh (92%). Perlu solusi sebelum terima order baru.
                </p>
                <div className="text-[11px] font-bold text-rose-700 mt-2 flex items-center gap-1">
                  <span>Cari Solusi di Simulator &rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Panel Tengah: Beban Stasiun + Rekomendasi ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Beban per Bagian */}
          <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Kapasitas Setiap Bagian Produksi</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Seberapa sibuk masing-masing bagian di dapur/workshop-mu hari ini
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Shift 08:00 – 17:00
              </span>
            </div>

            <div className="space-y-5">
              {/* Bagian 1 — PADAT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-bold text-[#0F172A]">Packaging & Perakitan Hampers</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      🔴 ANTRIAN PADAT
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-rose-700">92%</span>
                    <span className="text-[#94a3b8]">(Sisa 8 jam)</span>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "92%" }} />
                </div>
                <p className="text-[11px] text-rose-700 font-medium">
                  ⚠️ Penyebab: 2 pesanan hampers besar jatuh tempo 24 Okt. Perlu solusi jika mau terima order tambahan.
                </p>
              </div>

              {/* Bagian 2 — AMAN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-[#0F172A]">Oven A & B (Memanggang)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      ✅ AMAN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#0F172A]">68%</span>
                    <span className="text-[#94a3b8]">(Sisa 450 pcs)</span>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "68%" }} />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Masih bisa muat brownies atau roti artisan di batch siang.
                </p>
              </div>

              {/* Bagian 3 — LELUASA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-[#0F172A]">Mixing & Adonan</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ✅ LELUASA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#0F172A]">45%</span>
                    <span className="text-[#94a3b8]">(Kapasitas aman)</span>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              {/* Bagian 4 — STABIL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-bold text-[#0F172A]">Dekorasi & Finishing Kue</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      ✅ STABIL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#0F172A]">60%</span>
                    <span className="text-[#94a3b8]">(1 wedding cake on-track)</span>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Rekomendasi + CTA */}
          <div className="lg:col-span-5 space-y-5">

            {/* Rekomendasi Sistem */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-300 font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Rekomendasi Sistem</span>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                  ⚠️ 1 Pesanan Perlu Solusi
                </span>
              </div>

              <h4 className="text-base font-bold text-white">
                Pesanan PT Nusantara Sentosa perlu keputusan kamu
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pesanan 300 box hampers ini kekurangan waktu kerja di bagian packaging sekitar 8 jam. Kamu bisa tambah jam lembur atau rekrut 1 pekerja harian untuk selesaikan tepat waktu.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/simulations?order=bc-1024"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-center text-xs font-bold transition-all shadow-sm"
                >
                  Coba Simulasi Solusinya &rarr;
                </Link>
                <Link
                  href="/orders/bc-1024"
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold transition-all text-slate-200"
                >
                  Lihat Detail Pesanan
                </Link>
              </div>
            </div>

            {/* Widget Stok Bahan Kritis (Bukan duplikat Cek Pesanan) */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Stok Bahan Kritis</h4>
                    <p className="text-[11px] text-[#64748B]">Perlu diisi ulang minggu ini</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Defisit Stok
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Hardbox Rigid Satin</span>
                    <span className="text-[11px] text-[#64748B]">Sisa 250 box &bull; Butuh 300 box</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    -50 box
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Pita Satin Emas 2.5cm</span>
                    <span className="text-[11px] text-[#64748B]">Sisa 600 m &bull; Stok pas-pasan</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Pas
                  </span>
                </div>
              </div>

              <Link
                href="/resources?tab=materials"
                className="w-full py-2 px-3 rounded-xl border border-[#cbd5e1] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center pt-2"
              >
                <span>Kelola Stok &amp; Bahan Baku</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Daftar Pesanan Aktif ─── */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Pesanan yang Sedang Dikerjakan</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Klik kartu pesanan untuk melihat detail analisa kapasitas dan opsi produksi
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] flex items-center gap-1"
            >
              <span>Lihat Semua (6 Pesanan)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Pesanan 1 — Butuh Solusi */}
            <Link
              href="/orders/bc-1024"
              title="Buka rincian pesanan BC-1024"
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 hover:border-amber-400 hover:shadow-md transition-all space-y-2 block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  ⚠️ Perlu Solusi
                </span>
                <span className="text-xs font-mono font-bold text-amber-900 group-hover:text-blue-700 transition-colors">
                  BC-1024 &rarr;
                </span>
              </div>
              <h5 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-700 transition-colors">
                PT Nusantara Sentosa
              </h5>
              <p className="text-xs text-[#64748B]">300 box • Hampers Lebaran Custom</p>
              <div className="text-[11px] font-medium text-amber-800 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                <span>⚠️ Packaging kurang 8 jam kerja</span>
                <span className="text-[10px] font-bold text-amber-900 underline opacity-0 group-hover:opacity-100 transition-opacity">Buka</span>
              </div>
            </Link>

            {/* Pesanan 2 — Bisa Dikerjakan */}
            <Link
              href="/orders/bc-1023"
              title="Buka rincian pesanan BC-1023"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ✅ Bisa Dikerjakan
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                  BC-1023 &rarr;
                </span>
              </div>
              <h5 className="font-bold text-sm text-[#0F172A] group-hover:text-emerald-700 transition-colors">
                Ibu Ratna Catering
              </h5>
              <p className="text-xs text-[#64748B]">120 box • Brownies Fudgy Signature</p>
              <div className="text-[11px] font-medium text-emerald-800 pt-1 border-t border-emerald-200/60 flex items-center justify-between">
                <span>✅ Kapasitas aman — oven &amp; packing siap</span>
                <span className="text-[10px] font-bold text-emerald-900 underline opacity-0 group-hover:opacity-100 transition-opacity">Buka</span>
              </div>
            </Link>

            {/* Pesanan 3 — Bisa Dikerjakan */}
            <Link
              href="/orders/bc-1022"
              title="Buka rincian pesanan BC-1022"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ✅ Bisa Dikerjakan
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                  BC-1022 &rarr;
                </span>
              </div>
              <h5 className="font-bold text-sm text-[#0F172A] group-hover:text-emerald-700 transition-colors">
                Kafe Kopi Kulo BSD
              </h5>
              <p className="text-xs text-[#64748B]">80 pcs • Artisan Sourdough Loaf</p>
              <div className="text-[11px] font-medium text-emerald-800 pt-1 border-t border-emerald-200/60 flex items-center justify-between">
                <span>✅ Selesai 22 Okt — buffer 2 hari</span>
                <span className="text-[10px] font-bold text-emerald-900 underline opacity-0 group-hover:opacity-100 transition-opacity">Buka</span>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
