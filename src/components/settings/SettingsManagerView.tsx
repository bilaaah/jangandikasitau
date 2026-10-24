"use client";

import { useState, useEffect } from "react";

export function SettingsManagerView() {
  const [activeTab, setActiveTab] = useState<"profil" | "capacity" | "notifications" | "costs" | "billing">("capacity");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form states
  const [shopName, setShopName] = useState("SweetCrumbs Artisan Bakery & Hampers");
  const [location, setLocation] = useState("Kebayoran Baru, Jakarta Selatan");
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
      if (storedName) setShopName(storedName);
      if (storedPhone) setContactPhone(storedPhone);
      if (storedLoc) setLocation(storedLoc);
    } catch {
      // SSR guard
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (shopName.trim()) {
        localStorage.setItem("biz_name", shopName.trim());
      }
      if (contactPhone.trim()) {
        localStorage.setItem("biz_phone", contactPhone.trim());
      }
      if (location.trim()) {
        localStorage.setItem("biz_location", location.trim());
      }
      window.dispatchEvent(new Event("biz_profile_updated"));
    } catch {
      // SSR guard
    }

    setTimeout(() => {
      setIsSaving(false);
      setSaveToast("Pengaturan profil & parameter kapasitas berhasil disimpan!");
      setTimeout(() => setSaveToast(null), 4000);
    }, 500);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#525e7d]">
            <span>Preferences</span>
            <span>/</span>
            <span className="text-[#0b1c30] font-semibold">Pengaturan Operasional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30] mt-1">
            Pengaturan Usaha (Settings)
          </h1>
          <p className="mt-1 text-sm text-[#525e7d]">
            Konfigurasi parameter jam kerja harian, buffer kelayakan pesanan, dan kalkulasi biaya DSS.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#2563eb]/20 hover:bg-[#004ac6] transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaving ? "sync" : "save"}
          </span>
          <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5eeff] pb-2 overflow-x-auto text-xs font-bold text-[#525e7d] scrollbar-none">
        <button
          onClick={() => setActiveTab("capacity")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === "capacity"
              ? "bg-[#004ac6] text-white shadow-xs"
              : "hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">speed</span>
          <span>Parameter Engine DSS</span>
        </button>
        <button
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === "profil"
              ? "bg-[#004ac6] text-white shadow-xs"
              : "hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          <span>Profil Usaha</span>
        </button>
        <button
          onClick={() => setActiveTab("costs")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === "costs"
              ? "bg-[#004ac6] text-white shadow-xs"
              : "hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Tarif Lembur &amp; Biaya</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === "notifications"
              ? "bg-[#004ac6] text-white shadow-xs"
              : "hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">notifications</span>
          <span>Notifikasi &amp; Alert</span>
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === "billing"
              ? "bg-[#004ac6] text-white shadow-xs"
              : "hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">loyalty</span>
          <span>Paket Langganan SaaS</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-xs space-y-6">
        {/* TAB: PARAMETER CAPACITY ENGINE */}
        {activeTab === "capacity" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-extrabold text-[#0b1c30]">
                Threshold &amp; Aturan Kelayakan Kapasitas
              </h3>
              <p className="text-xs text-[#525e7d] mt-1">
                Engine BizCapacity menggunakan aturan deterministik ini untuk menentukan status FEASIBLE, AT RISK, atau OVERCAPACITY.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-1">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Batas Kritis Utilisasi (At Risk Threshold)
                </label>
                <p className="text-[11px] text-[#525e7d]">
                  Beban di atas persentase ini akan memicu status waspada dan rekomendasi solusi.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={utilThreshold}
                    onChange={(e) => setUtilThreshold(e.target.value)}
                    className="w-24 h-9 px-3 rounded-lg bg-white border border-[#e5eeff] text-xs font-bold text-[#0b1c30]"
                  />
                  <span className="text-xs font-bold text-[#525e7d]">% Kapasitas Maksimal</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-1">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Jam Kerja Harian Standar / Shift
                </label>
                <p className="text-[11px] text-[#525e7d]">
                  Durasi operasional normal sebelum terhitung sebagai jam lembur (overtime).
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-24 h-9 px-3 rounded-lg bg-white border border-[#e5eeff] text-xs font-bold text-[#0b1c30]"
                  />
                  <span className="text-xs font-bold text-[#525e7d]">Jam / Hari per Karyawan</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-1">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Safety Buffer Pengiriman Pesanan
                </label>
                <p className="text-[11px] text-[#525e7d]">
                  Cadangan waktu ekstra sebelum jam janji antar untuk mengantisipasi packing &amp; kurir.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={deliveryBufferDays}
                    onChange={(e) => setDeliveryBufferDays(e.target.value)}
                    className="w-24 h-9 px-3 rounded-lg bg-white border border-[#e5eeff] text-xs font-bold text-[#0b1c30]"
                  />
                  <span className="text-xs font-bold text-[#525e7d]">Hari Kerja</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Kalender Kerja &amp; Libur Produksi
                </label>
                <p className="text-[11px] text-[#525e7d]">
                  Sabtu-Minggu tidak dihitung dalam kapasitas mesin kecuali disimulasikan lembur.
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={weekendOff}
                    onChange={(e) => setWeekendOff(e.target.checked)}
                    className="rounded text-[#004ac6] focus:ring-[#004ac6] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#0b1c30]">
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
              <h3 className="text-base font-extrabold text-[#0b1c30]">Profil &amp; Identitas Usaha</h3>
              <p className="text-xs text-[#525e7d] mt-1">
                Data identitas yang muncul pada kop surat laporan evaluasi kapasitas dan ringkasan order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#525e7d] mb-1">Nama Brand / UMKM</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525e7d] mb-1">Nomor WhatsApp Operasional</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#525e7d] mb-1">Alamat Central Kitchen / Workshop</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: BIAYA & TARIF */}
        {activeTab === "costs" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-extrabold text-[#0b1c30]">
                Parameter Biaya untuk Simulasi What-If
              </h3>
              <p className="text-xs text-[#525e7d] mt-1">
                Digunakan untuk menghitung estimasi biaya tambahan ketika skenario lembur atau pekerja lepas diterapkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Upah Lembur Operator (Rp / Jam)
                </label>
                <p className="text-[11px] text-[#525e7d] mb-2">
                  Tarif standar per jam lembur karyawan tetap.
                </p>
                <input
                  type="number"
                  value={overtimeHourlyRate}
                  onChange={(e) => setOvertimeHourlyRate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#e5eeff] text-xs font-bold text-[#0b1c30]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Upah Harian Pekerja Lepas / Freelance Packing
                </label>
                <p className="text-[11px] text-[#525e7d] mb-2">
                  Tarif harian untuk tenaga bantuan saat peak season hampers.
                </p>
                <input
                  type="number"
                  value={freelanceDayRate}
                  onChange={(e) => setFreelanceDayRate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#e5eeff] text-xs font-bold text-[#0b1c30]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFIKASI */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-extrabold text-[#0b1c30]">
                Pengaturan Peringatan Dini (Early Warning System)
              </h3>
              <p className="text-xs text-[#525e7d] mt-1">
                Kirim peringatan instan kepada manajer produksi saat pesanan baru menyebabkan overcapacity.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={overcapacityNotification}
                  onChange={(e) => setOvercapacityNotification(e.target.checked)}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-[#004ac6] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">
                    Peringatan Visual Saat Simulasi Overcapacity (&gt;85%)
                  </span>
                  <span className="text-[11px] text-[#525e7d]">
                    Tampilkan badge merah dan tombol direct ke What-If Sandbox pada daftar PO.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-[#004ac6] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">
                    Notifikasi Ringkasan Harian ke WhatsApp Owner
                  </span>
                  <span className="text-[11px] text-[#525e7d]">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0b1c30]">Paket Langganan SaaS Bisnis Anda</h3>
                <p className="text-xs text-[#525e7d] mt-1">
                  Model langganan fleksibel dan terjangkau khusus UMKM manufaktur Make-to-Order (MTO).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                Status: Paket Mandiri Aktif
              </span>
            </div>

            {/* Current Active Plan Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004ac6] bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                  Paket Anda Saat Ini
                </span>
                <h4 className="text-lg font-black text-[#0b1c30]">Paket Mandiri Bertumbuh (UMKM)</h4>
                <p className="text-xs text-[#525e7d]">
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
                  className="px-4 py-2 rounded-xl bg-white border border-blue-300 text-xs font-bold text-[#004ac6] hover:bg-blue-50 transition-all shadow-2xs"
                >
                  Kelola Tagihan
                </button>
              </div>
            </div>

            {/* Tier Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Plan 1 */}
              <div className="p-5 rounded-xl border border-[#e5eeff] bg-[#fafbff] space-y-3">
                <span className="text-[11px] font-bold text-[#525e7d] uppercase">Paket Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0b1c30]">Rp 0</span>
                  <span className="text-xs text-[#525e7d]">/ bulan</span>
                </div>
                <p className="text-xs text-[#525e7d]">Cocok untuk usaha mikro dan program inkubator UMKM.</p>
                <ul className="text-xs text-[#0b1c30] space-y-1.5 pt-2 border-t border-[#e5eeff]">
                  <li>• Maks 30 pesanan / bulan</li>
                  <li>• 1 Owner + 1 Admin Staf</li>
                  <li>• Cek kelayakan kapasitas dasar</li>
                  <li>• Jadwal visual mingguan</li>
                </ul>
              </div>

              {/* Plan 2 - Current */}
              <div className="p-5 rounded-xl border-2 border-[#004ac6] bg-white space-y-3 relative shadow-xs">
                <span className="text-[10px] font-bold text-white bg-[#004ac6] px-2 py-0.5 rounded-full uppercase absolute -top-2.5 right-4">
                  Sedang Aktif
                </span>
                <span className="text-[11px] font-bold text-[#004ac6] uppercase">Mandiri Bertumbuh</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#004ac6]">Rp 49.000</span>
                  <span className="text-xs text-[#525e7d]">/ bulan</span>
                </div>
                <p className="text-xs text-[#525e7d]">Pilihan terpopuler bakery, konveksi, dan hampers.</p>
                <ul className="text-xs text-[#0b1c30] space-y-1.5 pt-2 border-t border-[#dbe1ff]">
                  <li>• <strong>Pesanan Tanpa Batas</strong></li>
                  <li>• Hingga 5 Pengguna Staf</li>
                  <li>• <strong>Simulator What-If Lengkap</strong></li>
                  <li>• Detektor Bottleneck &amp; Restock</li>
                  <li>• Notifikasi WhatsApp Alert</li>
                </ul>
              </div>

              {/* Plan 3 - Upgrade */}
              <div className="p-5 rounded-xl border border-[#e5eeff] bg-white space-y-3 hover:border-purple-300 transition-colors">
                <span className="text-[11px] font-bold text-purple-700 uppercase">Bisnis + AI Advisor</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0b1c30]">Rp 149.000</span>
                  <span className="text-xs text-[#525e7d]">/ bulan</span>
                </div>
                <p className="text-xs text-[#525e7d]">Untuk maklon dan custom workshop skala menengah.</p>
                <ul className="text-xs text-[#0b1c30] space-y-1.5 pt-2 border-t border-[#e5eeff]">
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
                  className="w-full mt-2 py-2 rounded-lg bg-[#0b1c30] text-white text-xs font-bold hover:bg-black transition-all"
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
