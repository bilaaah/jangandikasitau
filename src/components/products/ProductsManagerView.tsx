"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  workerHours: number;
  machineHours: number;
  unitCost: number;
  unitPrice: number;
  activeOrders: number;
  sensitivity: "Labor" | "Oven" | "Packaging" | "Balanced";
  bom: { name: string; qty: number; unit: string }[];
}

const PRESET_CATEGORIES = [
  "Garmen & Konveksi",
  "Bakery & Katering",
  "Percetakan & Packaging",
  "Kerajinan & Hampers",
  "Lainnya",
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "PROD-01",
    name: "Kemeja PDH Bordir Komunitas",
    category: "Garmen & Konveksi",
    workerHours: 0.6,
    machineHours: 0.35,
    unitCost: 65000,
    unitPrice: 135000,
    activeOrders: 12,
    sensitivity: "Labor",
    bom: [
      { name: "Kain American Drill Grade A", qty: 1.6, unit: "meter" },
      { name: "Kancing Kemeja Poly", qty: 8, unit: "pcs" },
      { name: "Benang Bordir Komputer", qty: 0.25, unit: "roll" },
      { name: "Kemasan Polybag Tebal", qty: 1, unit: "pcs" },
    ],
  },
  {
    id: "PROD-02",
    name: "Box Rigid Hardcover Foil Gold",
    category: "Percetakan & Packaging",
    workerHours: 0.25,
    machineHours: 0.15,
    unitCost: 18000,
    unitPrice: 42000,
    activeOrders: 8,
    sensitivity: "Packaging",
    bom: [
      { name: "Greyboard No. 30 Tebal", qty: 0.5, unit: "lembar" },
      { name: "Kertas Fancy Linen White", qty: 0.5, unit: "lembar" },
      { name: "Foil Hotprint Gold", qty: 1.2, unit: "meter" },
      { name: "Lem Putih Khusus Box", qty: 0.05, unit: "kg" },
    ],
  },
  {
    id: "PROD-03",
    name: "Signature Fudgy Brownies 20x20",
    category: "Bakery & Katering",
    workerHours: 0.1,
    machineHours: 0.25,
    unitCost: 45000,
    unitPrice: 85000,
    activeOrders: 4,
    sensitivity: "Oven",
    bom: [
      { name: "Dark Chocolate Couverture 70%", qty: 0.15, unit: "kg" },
      { name: "Butter Wijsman Creamery", qty: 0.08, unit: "kg" },
      { name: "Tepung Terigu Segitiga Biru", qty: 0.12, unit: "kg" },
      { name: "Box Foodgrade Ivory 20x20", qty: 1, unit: "pcs" },
    ],
  },
  {
    id: "PROD-04",
    name: "Hampers Anyaman Rotan Souvenir",
    category: "Kerajinan & Hampers",
    workerHours: 0.45,
    machineHours: 0.05,
    unitCost: 110000,
    unitPrice: 245000,
    activeOrders: 3,
    sensitivity: "Labor",
    bom: [
      { name: "Keranjang Anyaman Rotan Alami", qty: 1, unit: "pcs" },
      { name: "Kain Tile & Pita Satin 4cm", qty: 2.5, unit: "meter" },
      { name: "Toples Jar Kaca 400ml", qty: 3, unit: "pcs" },
      { name: "Hangtag Custom & Greeting Card", qty: 1, unit: "set" },
    ],
  },
  {
    id: "PROD-05",
    name: "Kaos Sablon Plastisol Combed 30s",
    category: "Garmen & Konveksi",
    workerHours: 0.3,
    machineHours: 0.2,
    unitCost: 42000,
    unitPrice: 85000,
    activeOrders: 6,
    sensitivity: "Labor",
    bom: [
      { name: "Kain Cotton Combed 30s", qty: 0.35, unit: "kg" },
      { name: "Tinta Sablon Plastisol Premium", qty: 0.04, unit: "kg" },
      { name: "Rib Leher Spandex Katun", qty: 0.05, unit: "meter" },
      { name: "Hangtag & Label Woven", qty: 1, unit: "set" },
    ],
  },
];

export function ProductsManagerView() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState(PRESET_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [newLaborHours, setNewLaborHours] = useState("0.15");
  const [newMachineHours, setNewMachineHours] = useState("0.20");
  const [newPrice, setNewPrice] = useState("75000");
  const [newBomItems, setNewBomItems] = useState<{ name: string; qty: number; unit: string }[]>([
    { name: "", qty: 1, unit: "kg" },
  ]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dynamic categories extracted from actual products
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua", ...list];
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const validBom = newBomItems
      .filter((b) => b.name.trim().length > 0)
      .map((b) => ({ ...b, name: b.name.trim(), qty: Number(b.qty) || 1 }));

    const resolvedCategory =
      newProductCategory === "Lainnya"
        ? (customCategory.trim() || "Produk Umum")
        : newProductCategory;

    const newProd: ProductItem = {
      id: `PROD-0${products.length + 1}`,
      name: newProductName.trim(),
      category: resolvedCategory,
      workerHours: parseFloat(newLaborHours) || 0.1,
      machineHours: parseFloat(newMachineHours) || 0.1,
      unitCost: Math.round(parseInt(newPrice || "50000") * 0.45),
      unitPrice: parseInt(newPrice || "50000"),
      activeOrders: 0,
      sensitivity: parseFloat(newMachineHours) > parseFloat(newLaborHours) ? "Oven" : "Labor",
      bom: validBom.length > 0 ? validBom : [
        { name: "Bahan Baku Utama Standar", qty: 1, unit: "porsi" },
        { name: "Kemasan Standar Foodgrade", qty: 1, unit: "pcs" },
      ],
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setNewProductName("");
    setCustomCategory("");
    setNewBomItems([{ name: "", qty: 1, unit: "kg" }]);
    setSuccessToast(`Resep produk "${newProd.name}" (${resolvedCategory}) berhasil ditambahkan ke katalog.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#525e7d]">
            <span>Operasional</span>
            <span>/</span>
            <span className="text-[#0b1c30] font-semibold">Katalog Produk &amp; Resep</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30] mt-1">
            Manajemen Produk &amp; BOM
          </h1>
          <p className="mt-1 text-sm text-[#525e7d]">
            Konfigurasikan jam kerja operator, jam oven/mesin, dan Bill of Materials (BOM) per unit sebagai parameter acuan Decision Support System.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#2563eb]/20 hover:bg-[#004ac6] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tambah Resep Baru</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#004ac6] text-white shadow-xs"
                  : "bg-[#f8f9ff] text-[#525e7d] hover:bg-[#eff4ff]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#737686] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari produk atau hampers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-[#004ac6] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#dbe1ff]">
                  {p.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.sensitivity === "Packaging"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : p.sensitivity === "Oven"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  Sensitif {p.sensitivity}
                </span>
              </div>

              <h3 className="font-extrabold text-[#0b1c30] text-base mt-2.5 group-hover:text-[#004ac6] transition-colors">
                {p.name}
              </h3>
              <p className="text-xs text-[#525e7d] mt-0.5">
                Harga Jual: <strong className="text-[#0b1c30]">Rp {p.unitPrice.toLocaleString("id-ID")}</strong> / unit
              </p>
            </div>

            {/* Capacity Footprint */}
            <div className="grid grid-cols-2 gap-2 text-xs text-[#525e7d] bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#737686]">Labor / Unit</span>
                <strong className="text-[#0b1c30] font-mono text-[13px]">{p.workerHours} jam</strong>
                <span className="block text-[10px] text-[#94a3b8]">Operator kerja</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#737686]">Machine / Unit</span>
                <strong className="text-[#0b1c30] font-mono text-[13px]">{p.machineHours} jam</strong>
                <span className="block text-[10px] text-[#94a3b8]">Oven &amp; mesin</span>
              </div>
            </div>

            {/* BOM summary & actions */}
            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
              <span className="text-[#525e7d] font-medium">
                {p.bom.length} bahan baku (BOM)
              </span>
              <button
                onClick={() => setActiveModalProduct(p)}
                className="text-[#004ac6] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Spek BOM</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOM Detail Inspection Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5eeff] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <span className="text-xs font-bold text-[#004ac6] uppercase">
                  {activeModalProduct.id} • {activeModalProduct.category}
                </span>
                <h3 className="text-lg font-extrabold text-[#0b1c30]">
                  {activeModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="w-8 h-8 rounded-lg bg-[#f1f5f9] text-[#525e7d] hover:bg-[#e2e8f0] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] text-xs">
                <div>
                  <span className="text-[#737686] text-[10px] uppercase font-bold block">Operator Labor</span>
                  <strong className="text-[#0b1c30] text-sm">{activeModalProduct.workerHours} Jam / Pcs</strong>
                </div>
                <div>
                  <span className="text-[#737686] text-[10px] uppercase font-bold block">Oven / Mesin</span>
                  <strong className="text-[#0b1c30] text-sm">{activeModalProduct.machineHours} Jam / Pcs</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase mb-2">
                  Daftar Resep &amp; Bill of Materials (BOM)
                </h4>
                <div className="divide-y divide-[#f1f5f9] border border-[#e5eeff] rounded-xl overflow-hidden">
                  {activeModalProduct.bom.map((b, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <span className="text-[#0b1c30] font-medium">{b.name}</span>
                      <span className="font-mono font-bold text-[#004ac6]">
                        {b.qty} {b.unit} / pcs
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dbe1ff] text-xs text-[#004ac6] space-y-1">
                <span className="font-bold block">Integrasi DSS Kapasitas:</span>
                <p className="text-[#525e7d]">
                  Setiap kali pesanan masuk di modul Orders, engine otomatis mengalikan kuantitas PO dengan koefisien waktu dan bahan baku di atas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setActiveModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold hover:bg-[#003ca2] transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5eeff] space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <span className="text-xs font-bold text-[#004ac6] uppercase">Tambah Resep Baru</span>
                <h3 className="text-lg font-extrabold text-[#0b1c30]">
                  Formulir Resep &amp; Beban Kapasitas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f1f5f9] text-[#525e7d] hover:bg-[#e2e8f0] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Nama Produk / Hampers</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Premium Nastar Golden Butter"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Kategori Produk</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[#0b1c30] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {newProductCategory === "Lainnya" && (
                    <input
                      type="text"
                      required
                      placeholder="Ketik kategori baru (misal: Kue Kering, Katering)"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full mt-2 h-8 px-2.5 rounded-lg border border-blue-300 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Harga Jual (Rp/unit)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Jam Staf / Labor (Jam/unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newLaborHours}
                    onChange={(e) => setNewLaborHours(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0b1c30] mb-1">Jam Oven/Mesin (Jam/unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMachineHours}
                    onChange={(e) => setNewMachineHours(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              {/* Dynamic BOM (Bill of Materials) */}
              <div className="pt-2 border-t border-[#f1f5f9] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#0b1c30]">
                    Kebutuhan Bahan Baku per 1 Unit (BOM)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewBomItems([...newBomItems, { name: "", qty: 1, unit: "kg" }])}
                    className="text-[#004ac6] hover:underline font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>+ Tambah Bahan</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {newBomItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nama bahan (mis: Dark Choco)"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...newBomItems];
                          updated[idx].name = e.target.value;
                          setNewBomItems(updated);
                        }}
                        className="flex-1 h-8 px-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...newBomItems];
                          updated[idx].qty = parseFloat(e.target.value) || 0;
                          setNewBomItems(updated);
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] text-xs font-mono text-[#0b1c30]"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => {
                          const updated = [...newBomItems];
                          updated[idx].unit = e.target.value;
                          setNewBomItems(updated);
                        }}
                        className="w-16 h-8 px-1.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] text-xs text-[#0b1c30]"
                      >
                        <option value="kg">kg</option>
                        <option value="gram">g</option>
                        <option value="pcs">pcs</option>
                        <option value="box">box</option>
                        <option value="meter">m</option>
                        <option value="liter">L</option>
                      </select>
                      {newBomItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewBomItems(newBomItems.filter((_, i) => i !== idx))}
                          className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#e5eeff] text-xs font-bold text-[#525e7d] hover:bg-[#f8f9ff]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold hover:bg-[#003ca2] shadow-sm transition-all"
              >
                Simpan Resep Produk
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
