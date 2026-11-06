"use client";

import { useState, useEffect } from "react";
import { updateBusinessSettingsAction } from "@/actions/settings.actions";

interface SettingsManagerViewProps {
  initialBusinessName?: string;
  initialLocation?: string;
}

export function SettingsManagerView({
  initialBusinessName = "SweetCrumbs Artisan Bakery & Hampers",
  initialLocation = "Kebayoran Baru, Jakarta Selatan",
}: SettingsManagerViewProps) {
  const [activeTab, setActiveTab] = useState<"profil" | "capacity" | "notifications" | "costs" | "billing">("capacity");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form states
  const [shopName, setShopName] = useState(initialBusinessName);
  const [location, setLocation] = useState(initialLocation);
  const [contactPhone, setContactPhone] = useState("+62 812-3456-7890");

  const [shiftHours, setShiftHours] = useState("8");
  const [utilThreshold, setUtilThreshold] = useState("85");
  const [deliveryBufferDays, setDeliveryBufferDays] = useState("1");
  const [weekendOff, setWeekendOff] = useState(true);

  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [overcapacityNotification, setOvercapacityNotification] = useState(true);

  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState("35000");
  const [freelanceDayRate, setFreelanceDayRate] = useState("180000");

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("biz_name");
      const storedPhone = localStorage.getItem("biz_phone");
      const storedLoc = localStorage.getItem("biz_location");
      const storedShift = localStorage.getItem("biz_shift_hours");
      const storedUtil = localStorage.getItem("biz_util_threshold");
      const storedBuffer = localStorage.getItem("biz_buffer_days");
      const storedOt = localStorage.getItem("biz_overtime_rate");
      const storedFree = localStorage.getItem("biz_freelance_rate");

      if (storedName) setShopName(storedName);
      if (storedPhone) setContactPhone(storedPhone);
      if (storedLoc) setLocation(storedLoc);
      if (storedShift) setShiftHours(storedShift);
      if (storedUtil) setUtilThreshold(storedUtil);
      if (storedBuffer) setDeliveryBufferDays(storedBuffer);
      if (storedOt) setOvertimeHourlyRate(storedOt);
      if (storedFree) setFreelanceDayRate(storedFree);
    } catch {
      // SSR guard
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Persist to localStorage for client-side instant access
      localStorage.setItem("biz_name", shopName.trim());
      localStorage.setItem("biz_phone", contactPhone.trim());
      localStorage.setItem("biz_location", location.trim());
      localStorage.setItem("biz_shift_hours", shiftHours);
      localStorage.setItem("biz_util_threshold", utilThreshold);
      localStorage.setItem("biz_buffer_days", deliveryBufferDays);
      localStorage.setItem("biz_overtime_rate", overtimeHourlyRate);
      localStorage.setItem("biz_freelance_rate", freelanceDayRate);

      window.dispatchEvent(new Event("biz_profile_updated"));

      // Persist to PostgreSQL database via Server Action
      const res = await updateBusinessSettingsAction({
        shopName,
        location,
        contactPhone,
        shiftHours: Number(shiftHours),
        utilThreshold: Number(utilThreshold),
        deliveryBufferDays: Number(deliveryBufferDays),
        overtimeHourlyRate: Number(overtimeHourlyRate),
        freelanceDayRate: Number(freelanceDayRate),
      });

      setIsSaving(false);
      if (res.success) {
        setSaveToast("Pengaturan profil & parameter kapasitas berhasil disimpan ke database!");
      } else {
        setSaveToast(res.error || "Gagal menyimpan ke database.");
      }
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: unknown) {
      setIsSaving(false);
      setSaveToast("Pengaturan berhasil disimpan di perangkat lokal.");
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  const tabs = [
    { id: "capacity", label: "Parameter Engine DSS", icon: "speed" },
    { id: "profil", label: "Profil Usaha", icon: "storefront" },
    { id: "costs", label: "Tarif Lembur & Biaya", icon: "payments" },
    { id: "notifications", label: "Notifikasi & Alert", icon: "notifications" },
    { id: "billing", label: "Paket Langganan SaaS", icon: "loyalty" },
  ] as const;

  const inputClass = "w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400";
  const numberInputClass = "w-24 h-9 px-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const cardClass = "p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-1";
  const labelClass = "block text-xs font-bold text-slate-800 dark:text-slate-200";
  const subLabelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1";
  const descClass = "text-[11px] text-slate-500 dark:text-slate-400";
  const h3Class = "text-base font-extrabold text-slate-900 dark:text-slate-50";

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Preferences</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Pengaturan Operasional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            Pengaturan Usaha (Settings)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Konfigurasi parameter jam kerja harian, buffer kelayakan pesanan, dan kalkulasi biaya DSS.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 dark:hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaving ? "sync" : "save"}
          </span>
          <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto text-xs font-bold text-slate-500 dark:text-slate-400 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? "bg-blue-700 dark:bg-blue-600 text-white shadow-xs"
                : "hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-6">
        {/* TAB: PARAMETER CAPACITY ENGINE */}
        {activeTab === "capacity" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className={h3Class}>
                Threshold &amp; Aturan Kelayakan Kapasitas
              </h3>
              <p className={`${descClass} mt-1`}>
                Engine BizCapacity menggunakan aturan deterministik ini untuk menentukan status FEASIBLE, AT RISK, atau OVERCAPACITY.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cardClass}>
                <label className={labelClass}>
                  Batas Kritis Utilisasi (At Risk Threshold)
                </label>
                <p className={descClass}>
                  Beban di atas persentase ini akan memicu status waspada dan rekomendasi solusi.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={utilThreshold}
                    onChange={(e) => setUtilThreshold(e.target.value)}
                    className={numberInputClass}
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">% Kapasitas Maksimal</span>
                </div>
              </div>

              <div className={cardClass}>
                <label className={labelClass}>
                  Jam Kerja Harian Standar / Shift
                </label>
                <p className={descClass}>
                  Durasi operasional normal sebelum terhitung sebagai jam lembur (overtime).
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className={numberInputClass}
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jam / Hari per Karyawan</span>
                </div>
              </div>

              <div className={cardClass}>
                <label className={labelClass}>
                  Safety Buffer Pengiriman Pesanan
                </label>
                <p className={descClass}>
                  Cadangan waktu ekstra sebelum jam janji antar untuk mengantisipasi packing &amp; kurir.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={deliveryBufferDays}
                    onChange={(e) => setDeliveryBufferDays(e.target.value)}
                    className={numberInputClass}
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hari Kerja</span>
                </div>
              </div>

              <div className={`${cardClass} space-y-2`}>
                <label className={labelClass}>
                  Kalender Kerja &amp; Libur Produksi
                </label>
                <p className={descClass}>
                  Sabtu-Minggu tidak dihitung dalam kapasitas mesin kecuali disimulasikan lembur.
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={weekendOff}
                    onChange={(e) => setWeekendOff(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kecualikan Hari Minggu dari Perhitungan Kapasitas Normal
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFIL USAHA */}
        {activeTab === "profil" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className={h3Class}>Profil &amp; Identitas Usaha</h3>
              <p className={`${descClass} mt-1`}>
                Data identitas yang muncul pada kop surat laporan evaluasi kapasitas dan ringkasan order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={subLabelClass}>Nama Brand / UMKM</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={subLabelClass}>Nomor WhatsApp Operasional</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={subLabelClass}>Alamat Central Kitchen / Workshop</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: BIAYA & TARIF */}
        {activeTab === "costs" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className={h3Class}>
                Parameter Biaya untuk Simulasi What-If
              </h3>
              <p className={`${descClass} mt-1`}>
                Digunakan untuk menghitung estimasi biaya tambahan ketika skenario lembur atau pekerja lepas diterapkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cardClass}>
                <label className={labelClass}>
                  Upah Lembur Operator (Rp / Jam)
                </label>
                <p className={`${descClass} mb-2`}>
                  Tarif standar per jam lembur karyawan tetap.
                </p>
                <input
                  type="number"
                  value={overtimeHourlyRate}
                  onChange={(e) => setOvertimeHourlyRate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className={cardClass}>
                <label className={labelClass}>
                  Upah Harian Pekerja Lepas / Freelance Packing
                </label>
                <p className={`${descClass} mb-2`}>
                  Tarif harian untuk tenaga bantuan saat peak season hampers.
                </p>
                <input
                  type="number"
                  value={freelanceDayRate}
                  onChange={(e) => setFreelanceDayRate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFIKASI */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className={h3Class}>
                Pengaturan Peringatan Dini (Early Warning System)
              </h3>
              <p className={`${descClass} mt-1`}>
                Kirim peringatan instan kepada manajer produksi saat pesanan baru menyebabkan overcapacity.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={overcapacityNotification}
                  onChange={(e) => setOvercapacityNotification(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Peringatan Visual Saat Simulasi Overcapacity (&gt;85%)
                  </span>
                  <span className={`${descClass}`}>
                    Tampilkan badge merah dan tombol direct ke What-If Sandbox pada daftar PO.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Notifikasi Ringkasan Harian ke WhatsApp Owner
                  </span>
                  <span className={`${descClass}`}>
                    Kirim laporan beban stasiun setiap jam 07:30 pagi sebelum shift dimulai.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB: PAKET & LANGGANAN SAAS */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className={h3Class}>Paket Langganan SaaS Bisnis Anda</h3>
                <p className={`${descClass} mt-1`}>
                  Model langganan fleksibel dan terjangkau khusus UMKM manufaktur Make-to-Order (MTO).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                Status: Paket Mandiri Aktif
              </span>
            </div>

            {/* Current Active Plan Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
                  Paket Anda Saat Ini
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-50">Paket Mandiri Bertumbuh (UMKM)</h4>
                <p className={descClass}>
                  Rp 49.000 / bulan &bull; Siklus tagihan berikutnya: 24 November 2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaveToast("Fitur kelola metode pembayaran invoice akan terbuka.");
                    setTimeout(() => setSaveToast(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all shadow-2xs"
                >
                  Kelola Tagihan
                </button>
              </div>
            </div>

            {/* Tier Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Plan 1 */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Paket Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-50">Rp 0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cocok untuk usaha mikro dan program inkubator UMKM.</p>
                <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <li>• Maks 30 pesanan / bulan</li>
                  <li>• 1 Owner + 1 Admin Staf</li>
                  <li>• Cek kelayakan kapasitas dasar</li>
                  <li>• Jadwal visual mingguan</li>
                </ul>
              </div>

              {/* Plan 2 - Current */}
              <div className="p-5 rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-800 space-y-3 relative shadow-xs">
                <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase absolute -top-2.5 right-4">
                  Sedang Aktif
                </span>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase">Mandiri Bertumbuh</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-400">Rp 49.000</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pilihan terpopuler bakery, konveksi, dan hampers.</p>
                <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 pt-2 border-t border-blue-100 dark:border-blue-900">
                  <li>• <strong>Pesanan Tanpa Batas</strong></li>
                  <li>• Hingga 5 Pengguna Staf</li>
                  <li>• <strong>Simulator What-If Lengkap</strong></li>
                  <li>• Detektor Bottleneck &amp; Restock</li>
                  <li>• Notifikasi WhatsApp Alert</li>
                </ul>
              </div>

              {/* Plan 3 - Upgrade */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase">Bisnis + AI Advisor</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-50">Rp 149.000</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Untuk maklon dan custom workshop skala menengah.</p>
                <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <li>• Semua fitur Mandiri Bertumbuh</li>
                  <li>• <strong>Explain with AI Kontekstual</strong></li>
                  <li>• Tim &amp; Staf Tanpa Batas</li>
                  <li>• Analitik Historis 90 Hari &amp; PDF</li>
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setSaveToast("Permintaan upgrade ke Paket AI Advisor diterima.");
                    setTimeout(() => setSaveToast(null), 3000);
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-black dark:hover:bg-white transition-all"
                >
                  Upgrade ke AI Advisor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
