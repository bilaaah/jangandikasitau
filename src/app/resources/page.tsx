"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";

interface WorkerItem {
  id: string;
  name: string;
  role: string;
  contractType: "Tetap (Full-time)" | "Borongan / Lepas" | "Musiman";
  dailyHours: number;
  committedHours: number;
  utilization: number;
  status: string;
}

interface MachineItem {
  id: string;
  name: string;
  type: string;
  dailyHours: number;
  committedHours: number;
  utilization: number;
  status: string;
}

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock?: number;
  unitCost?: number;
  committed: number;
  unit: string;
  status: string;
}

const INITIAL_WORKERS: WorkerItem[] = [
  { id: "w-1", name: "Siti Rahma", role: "Head Baker & Adonan", contractType: "Tetap (Full-time)", dailyHours: 8, committedHours: 6.5, utilization: 81, status: "Optimal" },
  { id: "w-2", name: "Budi Santoso", role: "Operator Deck Oven & Baking", contractType: "Tetap (Full-time)", dailyHours: 8, committedHours: 5.5, utilization: 68, status: "Aman" },
  { id: "w-3", name: "Dewi Lestari", role: "Specialist Packaging & Hampers", contractType: "Borongan / Lepas", dailyHours: 8, committedHours: 7.8, utilization: 97, status: "Overload (Kritis)" },
  { id: "w-4", name: "Ahmad Fauzi", role: "Finishing & QC Packaging", contractType: "Borongan / Lepas", dailyHours: 8, committedHours: 7.2, utilization: 90, status: "Hampir Limit" },
];

const INITIAL_MACHINES: MachineItem[] = [
  { id: "m-1", name: "Rotary Deck Oven #1 (4 Deck)", type: "Oven Utama / Pemanggang", dailyHours: 8, committedHours: 6.0, utilization: 75, status: "Optimal" },
  { id: "m-2", name: "Rotary Deck Oven #2 (2 Deck)", type: "Oven Pendukung", dailyHours: 8, committedHours: 4.8, utilization: 60, status: "Aman" },
  { id: "m-3", name: "Spiral Dough Mixer 40kg", type: "Mesin Adonan / Mixer", dailyHours: 8, committedHours: 3.5, utilization: 44, status: "Leluasa" },
  { id: "m-4", name: "Continuous Band Sealer Machine", type: "Mesin Packaging & Sealer", dailyHours: 8, committedHours: 7.4, utilization: 92, status: "Bottleneck" },
];

const INITIAL_MATERIALS: MaterialItem[] = [
  { id: "mat-1", name: "Hardbox Rigid Satin (Hampers)", category: "Packaging & Box", stock: 250, minStock: 100, unitCost: 35000, committed: 300, unit: "box", status: "Defisit 50 box" },
  { id: "mat-2", name: "Pita Satin Emas 2.5cm", category: "Aksesoris & Branding", stock: 600, minStock: 200, unitCost: 1500, committed: 600, unit: "meter", status: "Stok Pas-pasan" },
  { id: "mat-3", name: "Jar Kaca Silinder 350ml", category: "Wadah Primer", stock: 1200, minStock: 300, unitCost: 4500, committed: 900, unit: "pcs", status: "Aman (+300 pcs)" },
  { id: "mat-4", name: "Dark Cocoa Powder 100%", category: "Bahan Baku Utama", stock: 80, minStock: 25, unitCost: 95000, committed: 30, unit: "kg", status: "Aman (+50 kg)" },
  { id: "mat-5", name: "Kain Katun Combed 30s", category: "Bahan Baku Utama", stock: 15, minStock: 5, unitCost: 110000, committed: 4, unit: "roll", status: "Aman (+11 roll)" },
  { id: "mat-6", name: "Kertas Art Paper 260gsm (A3+)", category: "Bahan Habis Pakai / Cetak", stock: 8, minStock: 3, unitCost: 280000, committed: 2, unit: "rim", status: "Aman (+6 rim)" },
];

const PRESET_MATERIAL_CATEGORIES = [
  "Bahan Baku Utama",
  "Bahan Penolong & Bumbu / Tambahan",
  "Packaging & Box",
  "Wadah Primer (Toples, Botol, Pouch)",
  "Aksesoris & Branding (Pita, Stiker, Label)",
  "Bahan Habis Pakai / Cetak",
  "Lainnya",
];

const PRESET_UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "pcs", label: "Pieces / Buah (pcs)" },
  { value: "box", label: "Box / Dus (box)" },
  { value: "meter", label: "Meter (m)" },
  { value: "roll", label: "Roll / Gulung (roll)" },
  { value: "lembar", label: "Lembar / Sheet (lbr)" },
  { value: "pack", label: "Pack / Bungkus (pack)" },
  { value: "liter", label: "Liter (L)" },
  { value: "rim", label: "Rim (rim - 500 lbr)" },
  { value: "lusin", label: "Lusin (12 pcs)" },
  { value: "yard", label: "Yard (yd)" },
  { value: "Lainnya", label: "Lainnya (Ketik Sendiri)..." },
];

const PRESET_MACHINE_TYPES = [
  "Oven Utama / Pemanggang",
  "Oven Pendukung",
  "Mesin Adonan / Mixer / Pengaduk",
  "Mesin Jahit / Bordir / Obras (Tekstil)",
  "Mesin Cetak / Sablon / Heat Press",
  "Mesin Packaging & Sealer",
  "Alat Pemotong / Laser / Cetak / Die-cut",
  "Lainnya",
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"workers" | "machines" | "materials">("workers");
  const [workers, setWorkers] = useState<WorkerItem[]>(INITIAL_WORKERS);
  const [machines, setMachines] = useState<MachineItem[]>(INITIAL_MACHINES);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);

  // Synchronize tab with URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "machines" || tabParam === "materials" || tabParam === "workers") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Search & Filter
  const [materialSearch, setMaterialSearch] = useState("");
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState("Semua");

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "worker" | "machine" | "material";
    id: string;
    name: string;
  } | null>(null);

  // Restock Modal State
  const [restockMaterial, setRestockMaterial] = useState<MaterialItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);
  const [restockMode, setRestockMode] = useState<"add" | "set">("add");

  // Form states: Worker
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [workerContract, setWorkerContract] = useState<WorkerItem["contractType"]>("Tetap (Full-time)");
  const [workerHours, setWorkerHours] = useState(8);

  // Form states: Machine
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState(PRESET_MACHINE_TYPES[0]);
  const [customMachineType, setCustomMachineType] = useState("");
  const [machineHours, setMachineHours] = useState(8);

  // Form states: Material
  const [materialName, setMaterialName] = useState("");
  const [materialCategory, setMaterialCategory] = useState(PRESET_MATERIAL_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [materialStock, setMaterialStock] = useState(100);
  const [materialMinStock, setMaterialMinStock] = useState(20);
  const [materialUnitCost, setMaterialUnitCost] = useState("");
  const [materialUnit, setMaterialUnit] = useState("kg");
  const [customUnit, setCustomUnit] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // HANDLERS
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim()) return;

    const newWorker: WorkerItem = {
      id: `w-${Date.now()}`,
      name: workerName.trim(),
      role: workerRole.trim() || "Staf Produksi Umum",
      contractType: workerContract,
      dailyHours: Number(workerHours) || 8,
      committedHours: 0,
      utilization: 0,
      status: "Tersedia Penuh (0%)",
    };

    setWorkers([newWorker, ...workers]);
    setWorkerName("");
    setWorkerRole("");
    setWorkerHours(8);
    setIsModalOpen(false);
    showToast(`Tenaga kerja "${newWorker.name}" berhasil ditambahkan!`);
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineName.trim()) return;

    const finalType = machineType === "Lainnya" && customMachineType.trim() ? customMachineType.trim() : machineType;

    const newMachine: MachineItem = {
      id: `m-${Date.now()}`,
      name: machineName.trim(),
      type: finalType,
      dailyHours: Number(machineHours) || 8,
      committedHours: 0,
      utilization: 0,
      status: "Siap Operasi (0%)",
    };

    setMachines([newMachine, ...machines]);
    setMachineName("");
    setCustomMachineType("");
    setMachineHours(8);
    setIsModalOpen(false);
    showToast(`Mesin/alat "${newMachine.name}" berhasil didaftarkan!`);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    const finalCategory = materialCategory === "Lainnya" && customCategory.trim() ? customCategory.trim() : materialCategory;
    const finalUnit = materialUnit === "Lainnya" && customUnit.trim() ? customUnit.trim() : materialUnit;
    const stockNum = Number(materialStock) || 0;

    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: materialName.trim(),
      category: finalCategory,
      stock: stockNum,
      minStock: Number(materialMinStock) || 0,
      unitCost: materialUnitCost ? Number(materialUnitCost) : undefined,
      committed: 0,
      unit: finalUnit,
      status: `Aman (+${stockNum} ${finalUnit})`,
    };

    setMaterials([newMat, ...materials]);
    setMaterialName("");
    setCustomCategory("");
    setCustomUnit("");
    setMaterialUnitCost("");
    setMaterialStock(100);
    setIsModalOpen(false);
    showToast(`Bahan baku "${newMat.name}" berhasil ditambahkan ke stok gudang!`);
  };

  // RESTOCK HANDLER
  const handleApplyRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMaterial) return;

    const amount = Number(restockAmount) || 0;
    const newStock = restockMode === "add" ? restockMaterial.stock + amount : amount;

    setMaterials(
      materials.map((m) => {
        if (m.id === restockMaterial.id) {
          const balance = newStock - m.committed;
          const statusText = balance < 0 ? `Defisit ${Math.abs(balance)} ${m.unit}` : balance === 0 ? "Stok Pas-pasan" : `Aman (+${balance} ${m.unit})`;
          return {
            ...m,
            stock: newStock,
            status: statusText,
          };
        }
        return m;
      })
    );

    showToast(`Stok "${restockMaterial.name}" berhasil diperbarui menjadi ${newStock} ${restockMaterial.unit}!`);
    setRestockMaterial(null);
  };

  // DELETE HANDLERS
  const handleDeleteWorker = (id: string, name: string) => {
    setDeleteTarget({ type: "worker", id, name });
  };

  const handleDeleteMachine = (id: string, name: string) => {
    setDeleteTarget({ type: "machine", id, name });
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    setDeleteTarget({ type: "material", id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "worker") {
      setWorkers((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      showToast(`Tenaga kerja "${deleteTarget.name}" telah dihapus.`);
    } else if (deleteTarget.type === "machine") {
      setMachines((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      showToast(`Mesin "${deleteTarget.name}" telah dihapus.`);
    } else if (deleteTarget.type === "material") {
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      showToast(`Bahan baku "${deleteTarget.name}" telah dihapus.`);
    }
    setDeleteTarget(null);
  };

  // Filtered materials
  const filteredMaterials = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(materialSearch.toLowerCase()) || m.category.toLowerCase().includes(materialSearch.toLowerCase());
    const matchCat = selectedMaterialCategory === "Semua" || m.category.includes(selectedMaterialCategory);
    return matchSearch && matchCat;
  });

  return (
    <DashboardShell>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Floating Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span>Data Usaha</span>
              <span>/</span>
              <span className="text-[#0F172A] font-semibold">Staf, Mesin & Bahan Baku</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] mt-1">
              Data Produksimu
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Di sini kamu daftarkan siapa yang bekerja, mesin apa yang kamu punya, dan stok bahan bakumu — agar sistem bisa hitung pesanan secara akurat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>
                {activeTab === "workers" && "Tambah Staf"}
                {activeTab === "machines" && "Tambah Mesin / Alat"}
                {activeTab === "materials" && "Tambah Bahan Baku"}
              </span>
            </button>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0F172A] text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Cek Pesanan Baru</span>
            </Link>
          </div>
        </div>

        {/* Banner Penjelasan Konteks */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">info</span>
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-900">Kenapa harus isi data ini?</p>
              <p className="text-xs text-emerald-700 mt-0.5">Semakin lengkap datamu, semakin akurat sistem menghitung apakah kamu bisa terima pesanan atau tidak.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:ml-auto text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span><strong>Staf</strong> → jam kerja tersedia</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">precision_manufacturing</span>
              <span><strong>Mesin</strong> → kapasitas alat</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span><strong>Bahan</strong> → stok tersedia</span>
            </div>
          </div>
        </div>

        {/* 3 Interactive Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("workers")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === "workers"
                  ? "bg-[#1D4ED8] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#e2e8f0]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>👷 Staf ({workers.length} orang)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("machines")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === "machines"
                  ? "bg-[#1D4ED8] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#e2e8f0]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
              <span>⚙️ Mesin & Alat ({machines.length} unit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === "materials"
                  ? "bg-[#1D4ED8] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#e2e8f0]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>📦 Bahan & Stok ({materials.length} item)</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-[#64748B] bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
            {activeTab === "workers" && `Total jam tersedia: ${workers.reduce((acc, w) => acc + w.dailyHours, 0)} jam/hari`}
            {activeTab === "machines" && `Total jam mesin: ${machines.reduce((acc, m) => acc + m.dailyHours, 0)} jam/hari`}
            {activeTab === "materials" && `${materials.length} jenis bahan terdaftar`}
          </div>
        </div>

        {/* TAB 1: WORKERS */}
        {activeTab === "workers" && (
          workers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#94a3b8]">group_off</span>
              <h4 className="text-sm font-bold text-[#0F172A]">Belum Ada Data Staf / Pekerja</h4>
              <p className="text-xs text-[#64748B]">Daftarkan staf atau tenaga kerja lepas untuk menghitung kapasitas shift produksi.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Tambah Staf Pertama</span>
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.map((w) => (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all group relative"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {w.contractType}
                      </span>
                      <h4 className="font-bold text-base text-[#0F172A] mt-1.5">{w.name}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">{w.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWorker(w.id, w.name)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                      title="Hapus Staf"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Utilisasi Shift:</span>
                      <strong className="font-mono text-[#0F172A]">{w.utilization}%</strong>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          w.utilization > 90
                            ? "bg-rose-500"
                            : w.utilization > 75
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.max(w.utilization, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#64748B] flex justify-between items-center">
                  <span>Kapasitas Kerja:</span>
                  <strong className="text-[#0F172A] font-mono">
                    {w.committedHours} / {w.dailyHours} Jam/Hari
                  </strong>
                </div>
              </div>
            ))}
          </div>
          )
        )}

        {/* TAB 2: MACHINES */}
        {activeTab === "machines" && (
          machines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#94a3b8]">precision_manufacturing</span>
              <h4 className="text-sm font-bold text-[#0F172A]">Belum Ada Data Mesin / Oven</h4>
              <p className="text-xs text-[#64748B]">Daftarkan peralatan produksi (oven, mixer, sealer, dll) untuk menghitung kapasitas mesin.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Tambah Mesin Pertama</span>
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {machines.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.type}
                      </span>
                      <h4 className="font-bold text-base text-[#0F172A] mt-1.5">{m.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMachine(m.id, m.name)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                      title="Hapus Mesin"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Beban Operasi:</span>
                      <strong className="font-mono text-[#0F172A]">{m.utilization}%</strong>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          m.utilization > 90 ? "bg-rose-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.max(m.utilization, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#64748B] flex justify-between items-center">
                  <span>Kapasitas Operasional:</span>
                  <strong className="text-[#0F172A] font-mono">
                    {m.committedHours} / {m.dailyHours} Jam/Hari
                  </strong>
                </div>
              </div>
            ))}
          </div>
          )
        )}

        {/* TAB 3: MATERIALS (Enhanced for UMKM) */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {["Semua", "Bahan Baku", "Packaging", "Wadah", "Aksesoris", "Cetak"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMaterialCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedMaterialCategory === cat
                        ? "bg-[#1D4ED8] text-white shadow-xs"
                        : "bg-[#f8fafc] text-[#64748B] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-2 text-[#94a3b8] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari bahan, kemasan, stiker..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                />
              </div>
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#94a3b8]">inventory_2</span>
                <h4 className="text-sm font-bold text-[#0F172A]">Tidak Ada Bahan Baku yang Sesuai</h4>
                <p className="text-xs text-[#64748B]">Coba ubah kata kunci pencarian atau kategori bahan baku di atas.</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Tambah Bahan Baku</span>
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => {
                const isLowStock = mat.minStock && mat.stock <= mat.minStock;
                return (
                  <div
                    key={mat.id}
                    className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-all group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded">
                            {mat.category}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F172A] mt-2">{mat.name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              mat.status.includes("Defisit")
                                ? "bg-rose-100 text-rose-800"
                                : isLowStock
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isLowStock ? "Mendekati Batas Aman" : mat.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all ml-1"
                            title="Hapus Bahan"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Stock stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] mt-3">
                        <div>
                          <span className="block text-[10px] text-[#64748B]">Stok Fisik Gudang:</span>
                          <strong className="font-mono text-sm text-[#0F172A]">
                            {mat.stock} {mat.unit}
                          </strong>
                          {mat.minStock && (
                            <span className="block text-[9px] text-[#94a3b8]">Min: {mat.minStock} {mat.unit}</span>
                          )}
                        </div>
                        <div>
                          <span className="block text-[10px] text-[#64748B]">Terikat Order:</span>
                          <strong className="font-mono text-sm text-[#0F172A]">
                            {mat.committed} {mat.unit}
                          </strong>
                          {mat.unitCost && (
                            <span className="block text-[9px] text-emerald-700 font-semibold">
                              Rp {mat.unitCost.toLocaleString("id-ID")}/{mat.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Action */}
                    <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        Tersedia: <strong>{Math.max(0, mat.stock - mat.committed)} {mat.unit}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRestockMaterial(mat);
                          setRestockAmount(50);
                          setRestockMode("add");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] text-xs font-bold transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>Update Stok</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* RESTOCK / UPDATE STOK MODAL */}
        {restockMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Perbarui Stok Bahan Baku</h3>
                  <p className="text-xs text-[#64748B]">{restockMaterial.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRestockMaterial(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleApplyRestock} className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl text-xs text-[#1D4ED8] flex justify-between items-center">
                  <span>Stok Tercatat Saat Ini:</span>
                  <strong className="font-mono text-sm">{restockMaterial.stock} {restockMaterial.unit}</strong>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Metode Penyesuaian</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRestockMode("add")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        restockMode === "add"
                          ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                          : "bg-white text-[#64748B] border-[#e2e8f0]"
                      }`}
                    >
                      + Tambah Pasokan Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestockMode("set")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        restockMode === "set"
                          ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                          : "bg-white text-[#64748B] border-[#e2e8f0]"
                      }`}
                    >
                      Koreksi Total Fisik
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">
                    {restockMode === "add" ? `Jumlah yang Masuk (${restockMaterial.unit})` : `Total Fisik Sebenarnya (${restockMaterial.unit})`}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    {restockMode === "add"
                      ? `Stok akhir akan menjadi: ${restockMaterial.stock + Number(restockAmount || 0)} ${restockMaterial.unit}`
                      : `Stok akhir akan disesuaikan menjadi: ${Number(restockAmount || 0)} ${restockMaterial.unit}`}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                  <button
                    type="button"
                    onClick={() => setRestockMaterial(null)}
                    className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748B]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Simpan Perubahan Stok
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD RESOURCE MODAL (With Comprehensive UMKM Inputs) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">
                    {activeTab === "workers" && "Tambah Tenaga Kerja Baru"}
                    {activeTab === "machines" && "Tambah Mesin / Peralatan Baru"}
                    {activeTab === "materials" && "Tambah Bahan Baku / Kemasan Baru"}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Data ini akan langsung memperluas kapasitas hitung Decision Support System UMKM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* FORM: WORKERS */}
              {activeTab === "workers" && (
                <form onSubmit={handleAddWorker} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Nama Lengkap Staf *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Posisi / Peran *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Penjahit / Baker / Packing"
                        value={workerRole}
                        onChange={(e) => setWorkerRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Tipe Hubungan Kerja</label>
                      <select
                        value={workerContract}
                        onChange={(e) => setWorkerContract(e.target.value as WorkerItem["contractType"])}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 bg-white"
                      >
                        <option value="Tetap (Full-time)">Tetap (Full-time)</option>
                        <option value="Borongan / Lepas">Borongan / Lepas</option>
                        <option value="Musiman">Musiman (Peak Season)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Kapasitas Jam Kerja Harian (Jam/Hari)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      value={workerHours}
                      onChange={(e) => setWorkerHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                    />
                    <p className="text-[11px] text-[#64748B]">Standar shift kerja UMKM adalah 8 jam/hari (Senin–Jumat).</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748B] hover:bg-[#f8fafc]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Simpan Tenaga Kerja
                    </button>
                  </div>
                </form>
              )}

              {/* FORM: MACHINES */}
              {activeTab === "machines" && (
                <form onSubmit={handleAddMachine} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Nama Mesin / Peralatan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Mesin Jahit High-Speed / Convection Oven"
                      value={machineName}
                      onChange={(e) => setMachineName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Tipe Kategori Mesin</label>
                    <select
                      value={machineType}
                      onChange={(e) => setMachineType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 bg-white"
                    >
                      {PRESET_MACHINE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {machineType === "Lainnya" && (
                      <input
                        type="text"
                        required
                        placeholder="Tulis jenis mesin Anda (misal: Mesin Cutting Laser Akrilik)"
                        value={customMachineType}
                        onChange={(e) => setCustomMachineType(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl border border-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Maksimal Jam Operasional Harian (Jam/Hari)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      value={machineHours}
                      onChange={(e) => setMachineHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748B] hover:bg-[#f8fafc]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Simpan Mesin
                    </button>
                  </div>
                </form>
              )}

              {/* FORM: MATERIALS (Flexible UMKM Modal) */}
              {activeTab === "materials" && (
                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Nama Bahan Baku / SKU Kemasan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kain Katun Combed / Hardbox Foil Gold / Tepung Komachi"
                      value={materialName}
                      onChange={(e) => setMaterialName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                    />
                  </div>

                  {/* Kategori Bahan Fleksibel */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Kategori Bahan</label>
                    <select
                      value={materialCategory}
                      onChange={(e) => setMaterialCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 bg-white"
                    >
                      {PRESET_MATERIAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {materialCategory === "Lainnya" && (
                      <input
                        type="text"
                        required
                        placeholder="Tulis nama kategori kustom Anda (misal: Bahan Kimia & Sablon)"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl border border-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    )}
                  </div>

                  {/* Satuan & Stok Awal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Satuan Takaran *</label>
                      <select
                        value={materialUnit}
                        onChange={(e) => setMaterialUnit(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 bg-white"
                      >
                        {PRESET_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>

                      {materialUnit === "Lainnya" && (
                        <input
                          type="text"
                          required
                          placeholder="Ketik satuan (mis: ikat, batang, derigen)"
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          className="w-full mt-2 px-3 py-1.5 rounded-xl border border-blue-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Stok Awal Fisik Saat Ini</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={materialStock}
                        onChange={(e) => setMaterialStock(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                      />
                    </div>
                  </div>

                  {/* Field Tambahan UMKM: Safety Stock & Estimasi Biaya */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#f1f5f9]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Batas Minimum Aman (Safety Stock)</label>
                      <input
                        type="number"
                        min={0}
                        value={materialMinStock}
                        onChange={(e) => setMaterialMinStock(Number(e.target.value))}
                        placeholder="Contoh: 20"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                      />
                      <p className="text-[10px] text-[#64748B]">Beri notifikasi waspada bila stok di bawah angka ini.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Biaya Beli per Satuan (Opsional)</label>
                      <input
                        type="number"
                        min={0}
                        value={materialUnitCost}
                        onChange={(e) => setMaterialUnitCost(e.target.value)}
                        placeholder="Rp / satuan"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 font-mono"
                      />
                      <p className="text-[10px] text-[#64748B]">Membantu perhitungan HPP saat menyusun resep BOM.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748B] hover:bg-[#f8fafc]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Simpan Bahan Baku
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-[#0F172A]">Konfirmasi Hapus</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong className="text-[#0F172A]">"{deleteTarget.name}"</strong>? Data yang dihapus akan dikeluarkan dari kalkulasi kapasitas.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#64748B] hover:bg-[#f8fafc] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
