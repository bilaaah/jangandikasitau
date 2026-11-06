"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  deactivateResourceAction,
  saveMachineAction,
  saveMaterialAction,
  saveWorkerAction,
  updateMaterialStockAction,
} from "@/actions/resources.actions";

type Worker = { id: string; name: string; dailyAvailableHours: number };
type Machine = { id: string; name: string; dailyAvailableHours: number };
type Material = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  stockUpdatedAt: Date;
};
type Tab = "workers" | "machines" | "materials";
type EditableResource = Worker | Machine | Material;
type Freshness = { label: string; className: string };

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30";

function getFreshness(updatedAt: Date): Freshness {
  const ageHours = Math.max(0, Date.now() - new Date(updatedAt).getTime()) / 3_600_000;
  if (ageHours <= 24) return { label: "Terkini · < 24 jam", className: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" };
  if (ageHours <= 24 * 7) return { label: "Perlu diperbarui · < 7 hari", className: "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400" };
  return { label: "Usang · lebih dari 7 hari", className: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" };
}

export function ResourceManagementView({
  initialWorkers,
  initialMachines,
  initialMaterials,
  initialTab = "workers",
}: {
  initialWorkers: Worker[];
  initialMachines: Machine[];
  initialMaterials: Material[];
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [editing, setEditing] = useState<EditableResource | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("8");
  const [unit, setUnit] = useState("pcs");
  const [stock, setStock] = useState("0");
  const [restockMaterial, setRestockMaterial] = useState<Material | null>(null);
  const [restockMode, setRestockMode] = useState<"add" | "set">("add");
  const [restockQuantity, setRestockQuantity] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();
  const isOwner = session?.user?.role !== "MEMBER";

  function openForm(item?: EditableResource) {
    setEditing(item ?? null);
    setName(item?.name ?? "");
    if (activeTab === "workers" || activeTab === "machines") {
      setHours(String(item && "dailyAvailableHours" in item ? item.dailyAvailableHours : 8));
    } else {
      setUnit(item && "unit" in item ? item.unit : "pcs");
      setStock(String(item && "currentStock" in item ? item.currentStock : 0));
    }
    setError(null);
    setIsFormOpen(true);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        activeTab === "workers"
          ? await saveWorkerAction({
              ...(editing ? { id: editing.id } : {}),
              name,
              dailyAvailableHours: Number(hours),
            })
          : activeTab === "machines"
            ? await saveMachineAction({
                ...(editing ? { id: editing.id } : {}),
                name,
                dailyAvailableHours: Number(hours),
              })
            : await saveMaterialAction({
                ...(editing ? { id: editing.id } : {}),
                name,
                unit,
                currentStock: Number(stock),
              });

      if (!result.success) {
        setError(result.error);
        return;
      }
      setIsFormOpen(false);
      setEditing(null);
    });
  }

  function handleDeactivate(item: EditableResource) {
    if (!window.confirm(`Nonaktifkan "${item.name}"? Data historis tetap tersimpan.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deactivateResourceAction(activeTab === "workers" ? "worker" : activeTab === "machines" ? "machine" : "material", { id: item.id });
      if (!result.success) setError(result.error);
    });
  }

  function handleUpdateStock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!restockMaterial) return;
    setError(null);
    startTransition(async () => {
      const result = await updateMaterialStockAction({
        materialId: restockMaterial.id,
        mode: restockMode,
        quantity: Number(restockQuantity),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRestockMaterial(null);
    });
  }

  const tabItems: { key: Tab; label: string; count: number }[] = [
    { key: "workers", label: "Pekerja", count: initialWorkers.length },
    { key: "machines", label: "Mesin", count: initialMachines.length },
    { key: "materials", label: "Bahan Baku", count: initialMaterials.length },
  ];

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Data Usaha / Sumber Daya</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">Data Produksi</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Kelola kapasitas pekerja dan mesin serta snapshot stok bahan baku usaha.
          </p>
        </div>
        {(isOwner || activeTab === "materials") && (
          <button type="button" onClick={() => openForm()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 dark:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 dark:hover:bg-blue-700">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Tambah {activeTab === "workers" ? "Pekerja" : activeTab === "machines" ? "Mesin" : "Bahan Baku"}
          </button>
        )}
      </header>

      {!isOwner && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Akses Staf: Anda dapat mencatat dan memperbarui stok bahan baku fisik. Data mesin & pekerja dikelola oleh Owner.</span>
        </div>
      )}

      {error && <p role="alert" className="rounded-xl bg-rose-50 dark:bg-rose-900/30 p-3 text-sm text-rose-700 dark:text-rose-400">{error}</p>}

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2" aria-label="Jenis sumber daya">
        {tabItems.map((tab) => (
          <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); setIsFormOpen(false); setRestockMaterial(null); setError(null); }} className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === tab.key ? "bg-blue-700 dark:bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50"}`}>
            {tab.label} <span className="ml-1 opacity-75">({tab.count})</span>
          </button>
        ))}
      </nav>

      {activeTab === "workers" && (
        <ResourceList
          emptyText="Belum ada pekerja aktif."
          items={initialWorkers}
          onEdit={openForm}
          onDeactivate={handleDeactivate}
          isPending={isPending}
          isOwner={isOwner}
          renderDetails={(item) => <p className="text-sm text-slate-600">Kapasitas: <strong>{item.dailyAvailableHours} jam/hari</strong></p>}
        />
      )}
      {activeTab === "machines" && (
        <ResourceList
          emptyText="Belum ada mesin aktif."
          items={initialMachines}
          onEdit={openForm}
          onDeactivate={handleDeactivate}
          isPending={isPending}
          isOwner={isOwner}
          renderDetails={(item) => <p className="text-sm text-slate-600">Kapasitas: <strong>{item.dailyAvailableHours} jam/hari</strong></p>}
        />
      )}
      {activeTab === "materials" && (
        initialMaterials.length === 0 ? (
          <EmptyState text="Belum ada bahan baku aktif." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialMaterials.map((item) => {
              const freshness = getFreshness(item.stockUpdatedAt);
              return (
                <article key={item.id} className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-slate-50">{item.name}</h2>
                      <p className="mt-1 text-xs text-slate-500">Satuan: {item.unit}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${freshness.className}`}>{freshness.label}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
                    <p className="text-xs text-slate-500">Stok tercatat</p>
                    <p className="mt-0.5 font-mono text-xl font-extrabold text-slate-900 dark:text-slate-50">{item.currentStock} <span className="text-sm font-semibold">{item.unit}</span></p>
                    <p className="mt-1 text-[10px] text-slate-500">Diperbarui: {new Date(item.stockUpdatedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                    <button type="button" onClick={() => { setRestockMaterial(item); setRestockMode("add"); setRestockQuantity("0"); setError(null); }} className="rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">Perbarui stok</button>
                    {isOwner && (
                      <>
                        <button type="button" onClick={() => openForm(item)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Ubah</button>
                        <button type="button" disabled={isPending} onClick={() => handleDeactivate(item)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50">Nonaktifkan</button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
          <form onSubmit={handleSave} className="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold uppercase text-blue-700">{editing ? "Ubah data" : "Data baru"}</p>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                {activeTab === "workers" ? "Pekerja" : activeTab === "machines" ? "Mesin" : "Bahan Baku"}
              </h2>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama
              <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
            </label>
            {activeTab === "materials" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Satuan
                    <input required maxLength={32} value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="kg, pcs, liter..." className={inputClass} />
                  </label>
                  <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Snapshot stok
                    <input required type="number" min="0" step="any" value={stock} onChange={(event) => setStock(event.target.value)} className={inputClass} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Menyimpan jumlah stok akan memperbarui waktu keterbaruan snapshot.</p>
              </>
            ) : (
              <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jam tersedia per hari
                <input required type="number" min="0.001" max="24" step="any" value={hours} onChange={(event) => setHours(event.target.value)} className={inputClass} />
              </label>
            )}
            {error && <p role="alert" className="rounded-lg bg-rose-50 dark:bg-rose-900/30 p-3 text-xs text-rose-700 dark:text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
              <button type="submit" disabled={isPending} className="rounded-xl bg-blue-700 dark:bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{isPending ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {restockMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleUpdateStock} className="w-full max-w-md space-y-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold uppercase text-blue-700">Snapshot Stok</p>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">{restockMaterial.name}</h2>
              <p className="text-xs text-slate-500">Stok saat ini: {restockMaterial.currentStock} {restockMaterial.unit}</p>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Metode penyesuaian
              <select value={restockMode} onChange={(event) => setRestockMode(event.target.value as "add" | "set")} className={inputClass}>
                <option value="add">Tambah stok masuk</option>
                <option value="set">Koreksi ke jumlah fisik</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {restockMode === "add" ? `Jumlah masuk (${restockMaterial.unit})` : `Jumlah fisik (${restockMaterial.unit})`}
              <input required type="number" min="0" step="any" value={restockQuantity} onChange={(event) => setRestockQuantity(event.target.value)} className={inputClass} />
            </label>
            {error && <p role="alert" className="rounded-lg bg-rose-50 dark:bg-rose-900/30 p-3 text-xs text-rose-700 dark:text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setRestockMaterial(null)} className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
              <button type="submit" disabled={isPending} className="rounded-xl bg-blue-700 dark:bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{isPending ? "Menyimpan..." : "Simpan stok"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center text-sm text-slate-600 dark:text-slate-400">{text}</div>;
}

function ResourceList<T extends Worker | Machine>({
  items,
  emptyText,
  onEdit,
  onDeactivate,
  isPending,
  isOwner = true,
  renderDetails,
}: {
  items: T[];
  emptyText: string;
  onEdit: (item: T) => void;
  onDeactivate: (item: T) => void;
  isPending: boolean;
  isOwner?: boolean;
  renderDetails: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return <EmptyState text={emptyText} />;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-50">{item.name}</h2>
            {renderDetails(item)}
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            {isOwner ? (
              <>
                <button type="button" onClick={() => onEdit(item)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Ubah</button>
                <button type="button" disabled={isPending} onClick={() => onDeactivate(item)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50">Nonaktifkan</button>
              </>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1">Kapasitas Aktif • Dikelola Owner</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

