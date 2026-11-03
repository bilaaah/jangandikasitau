"use client";

import { useState, useTransition } from "react";
import {
  deactivateProductAction,
  saveProductAction,
} from "@/actions/products.actions";
import type { SaveProductInput } from "@/schemas/resources.schema";

type ManagedProduct = {
  id: string;
  name: string;
  description: string | null;
  workerHoursPerUnit: number;
  machineHoursPerUnit: number;
  materials: {
    materialId: string;
    quantityPerUnit: number;
    material: { name: string; unit: string };
  }[];
};

type MaterialOption = { id: string; name: string; unit: string };
type BomRow = { materialId: string; quantityPerUnit: string };

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30";

export function ProductManagementView({
  products,
  materials,
}: {
  products: ManagedProduct[];
  materials: MaterialOption[];
}) {
  const [editing, setEditing] = useState<ManagedProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workerHours, setWorkerHours] = useState("0.5");
  const [machineHours, setMachineHours] = useState("0");
  const [bom, setBom] = useState<BomRow[]>([
    { materialId: materials[0]?.id ?? "", quantityPerUnit: "1" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openForm(product?: ManagedProduct) {
    setEditing(product ?? null);
    setName(product?.name ?? "");
    setDescription(product?.description ?? "");
    setWorkerHours(String(product?.workerHoursPerUnit ?? 0.5));
    setMachineHours(String(product?.machineHoursPerUnit ?? 0));
    setBom(
      product?.materials.map((item) => ({
        materialId: item.materialId,
        quantityPerUnit: String(item.quantityPerUnit),
      })) ?? [{ materialId: materials[0]?.id ?? "", quantityPerUnit: "1" }],
    );
    setError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setError(null);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const input: SaveProductInput = {
      ...(editing ? { id: editing.id } : {}),
      name,
      description,
      workerHoursPerUnit: Number(workerHours),
      machineHoursPerUnit: Number(machineHours),
      materials: bom.map((row) => ({
        materialId: row.materialId,
        quantityPerUnit: Number(row.quantityPerUnit),
      })),
    };

    startTransition(async () => {
      const result = await saveProductAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      closeForm();
    });
  }

  function handleDeactivate(product: ManagedProduct) {
    if (!window.confirm(`Nonaktifkan produk "${product.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deactivateProductAction({ id: product.id });
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Operasional / Katalog Produk</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Manajemen Produk &amp; BOM
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Atur kebutuhan jam kerja, jam mesin, dan bahan baku per unit produk.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Produk
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 dark:bg-rose-900/30 p-3 text-sm text-rose-700 dark:text-rose-400">{error}</p>}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center">
          <h2 className="font-bold text-slate-900 dark:text-slate-50">Belum ada produk aktif</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tambahkan produk dan susun BOM untuk mulai menghitung kapasitas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs">
              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-slate-50">{product.name}</h2>
                {product.description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{product.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Jam kerja / unit</span>
                  <strong className="font-mono text-slate-900 dark:text-slate-100">{product.workerHoursPerUnit}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Jam mesin / unit</span>
                  <strong className="font-mono text-slate-900 dark:text-slate-100">{product.machineHoursPerUnit}</strong>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">BOM ({product.materials.length})</h3>
                <ul className="space-y-1.5">
                  {product.materials.map((item) => (
                    <li key={item.materialId} className="flex justify-between gap-3 text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{item.material.name}</span>
                      <span className="shrink-0 font-mono font-semibold text-blue-700 dark:text-blue-400">
                        {item.quantityPerUnit} {item.material.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                <button type="button" onClick={() => openForm(product)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  Ubah
                </button>
                <button type="button" disabled={isPending} onClick={() => handleDeactivate(product)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50">
                  Nonaktifkan
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
          <form onSubmit={handleSave} className="my-auto max-h-[92vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">{editing ? "Ubah produk" : "Produk baru"}</p>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">Detail Produk &amp; BOM</h2>
              </div>
              <button type="button" onClick={closeForm} aria-label="Tutup formulir" className="rounded-lg px-2 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">✕</button>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama produk
              <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi
              <textarea maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} rows={2} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam kerja per unit
                <input required type="number" min="0.001" step="any" value={workerHours} onChange={(event) => setWorkerHours(event.target.value)} className={inputClass} />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam mesin per unit
                <input required type="number" min="0" step="any" value={machineHours} onChange={(event) => setMachineHours(event.target.value)} className={inputClass} />
              </label>
            </div>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Bill of Materials per unit</h3>
                <button type="button" onClick={() => setBom((rows) => [...rows, { materialId: materials[0]?.id ?? "", quantityPerUnit: "1" }])} className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  + Tambah bahan
                </button>
              </div>
              {materials.length === 0 ? (
                <p className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-3 text-xs text-amber-800 dark:text-amber-400">Daftarkan bahan baku terlebih dahulu sebelum membuat BOM.</p>
              ) : bom.map((row, index) => (
                <div key={index} className="grid grid-cols-[1fr_120px_36px] gap-2">
                  <select required value={row.materialId} onChange={(event) => setBom((rows) => rows.map((item, i) => i === index ? { ...item, materialId: event.target.value } : item))} className={inputClass}>
                    <option value="">Pilih bahan</option>
                    {materials.map((material) => <option key={material.id} value={material.id}>{material.name} ({material.unit})</option>)}
                  </select>
                  <input required aria-label="Kebutuhan bahan per unit" type="number" min="0.001" step="any" value={row.quantityPerUnit} onChange={(event) => setBom((rows) => rows.map((item, i) => i === index ? { ...item, quantityPerUnit: event.target.value } : item))} className={inputClass} />
                  <button type="button" aria-label="Hapus bahan BOM" disabled={bom.length === 1} onClick={() => setBom((rows) => rows.filter((_, i) => i !== index))} className="rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-30">✕</button>
                </div>
              ))}
            </section>
            {error && <p role="alert" className="rounded-lg bg-rose-50 dark:bg-rose-900/30 p-3 text-xs text-rose-700 dark:text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
              <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
              <button type="submit" disabled={isPending || materials.length === 0} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-blue-700">
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
