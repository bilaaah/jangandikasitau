"use client";

// src/app/orders/new/NewOrderForm.tsx
//
// Interactive Order Creation Form with Live Capacity Feasibility Preview.
// Provides instantaneous DSS evaluation of constraints before committing to an order.
// UX rules enforced:
//   1. Warning banner jika user mencoba submit sebelum uji kelayakan
//   2. Toast sukses setelah pesanan berhasil dibuat
//   3. FeasibilityCard mendapat context (productName, quantity, dll) untuk AI panel

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orders.actions";
import { checkFeasibilityPreview } from "@/actions/feasibility.actions";
import type { CapacityEngineResult } from "@/types";
import { FeasibilityCard } from "@/components/feasibility/FeasibilityCard";

interface ProductOption {
  id: string;
  name: string;
  workerHoursPerUnit: number;
  machineHoursPerUnit: number;
  materials: {
    quantityPerUnit: number;
    material: {
      name: string;
      unit: string;
      currentStock: number;
    };
  }[];
}

interface NewOrderFormProps {
  products: ProductOption[];
}

// ── Toast Notification Component ────────────────────────────────────
function SuccessToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-900/20 max-w-sm">
        <span className="material-symbols-outlined text-[22px] text-emerald-200">check_circle</span>
        <p className="text-sm font-semibold leading-tight flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

// ── Warning Banner Component ─────────────────────────────────────────
function FeasibilitySkippedWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <span className="material-symbols-outlined text-amber-600 text-[22px] flex-shrink-0 mt-0.5">
        warning
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-900">Belum Dicek Kelayakannya!</p>
        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
          Kamu belum menjalankan <strong>Uji Kelayakan Kapasitas</strong>. Sangat disarankan untuk
          cek dulu sebelum terima pesanan agar tidak ada janji yang tidak bisa ditepati.
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            Tetap lanjutkan tanpa cek
          </button>
        </div>
      </div>
    </div>
  );
}

export function NewOrderForm({ products }: NewOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Form states ──────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [minDateStr, setMinDateStr] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDeliveryDate(d.toISOString().split("T")[0]);

    const minD = new Date();
    minD.setDate(minD.getDate() + 1);
    setMinDateStr(minD.toISOString().split("T")[0]);
  }, []);

  // ── DSS preview states ───────────────────────────────────────────
  const [previewResult, setPreviewResult] = useState<CapacityEngineResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // ── UX Guard states ──────────────────────────────────────────────
  const [showFeasibilityWarning, setShowFeasibilityWarning] = useState(false);
  const [feasibilitySkippedConfirmed, setFeasibilitySkippedConfirmed] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  // ── Live feasibility check handler ───────────────────────────────
  async function handleCheckFeasibility() {
    if (!productId || quantity <= 0 || !deliveryDate) {
      setErrorMsg("Pilih produk, masukkan jumlah > 0, dan pilih tanggal kirim terlebih dahulu.");
      return;
    }

    setIsPreviewLoading(true);
    setErrorMsg(null);
    setShowFeasibilityWarning(false);

    try {
      const res = await checkFeasibilityPreview(
        productId,
        quantity,
        new Date(deliveryDate).toISOString(),
      );

      if (res.success && res.data) {
        setPreviewResult(res.data);
        setFeasibilitySkippedConfirmed(false); // reset guard setelah cek berhasil
      } else {
        setErrorMsg(res.error || "Gagal menjalankan cek kelayakan kapasitas.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi engine kapasitas.");
    } finally {
      setIsPreviewLoading(false);
    }
  }

  // ── Submit order handler ─────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // UX Guard: Warn if feasibility not checked yet
    if (!previewResult && !feasibilitySkippedConfirmed) {
      setShowFeasibilityWarning(true);
      // Scroll warning into view
      setTimeout(() => {
        document.getElementById("feasibility-warning")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }

    startTransition(async () => {
      const payload = {
        customerName,
        productId,
        quantity: Number(quantity),
        requiredDeliveryDate: new Date(deliveryDate).toISOString(),
        notes: notes || undefined,
      };

      const res = await createOrder(payload);

      if (res.success && res.data) {
        // Show success toast, then redirect
        const productLabel = selectedProduct?.name || "Pesanan";
        setSuccessMessage(`✅ ${productLabel} untuk ${customerName} berhasil didaftarkan!`);
        setShowSuccessToast(true);

        setTimeout(() => {
          router.push(`/orders/${res.data!.orderId}`);
        }, 1800);
      } else {
        setErrorMsg(res.error || "Gagal membuat pesanan. Coba lagi.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  }

  return (
    <>
      {/* ── Success Toast ──────────────────────────────────────── */}
      {showSuccessToast && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Form Column ─────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Spesifikasi Pesanan Klien</h2>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Masukkan rincian pesanan pelanggan untuk diuji langsung terhadap ketersediaan jam kerja,
              kapasitas mesin/oven, dan stok bahan baku.
            </p>
          </div>

          {/* General error */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Feasibility skipped warning */}
          {showFeasibilityWarning && (
            <div id="feasibility-warning">
              <FeasibilitySkippedWarning
                onDismiss={() => {
                  setFeasibilitySkippedConfirmed(true);
                  setShowFeasibilityWarning(false);
                  // Re-trigger submit after confirmation
                  document.getElementById("btn-submit-order")?.click();
                }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Nama Klien / Perusahaan Pemesan *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="contoh: PT Nusantara Sentosa atau Ibu Ratna"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-shadow"
              />
              {fieldErrors.customerName && (
                <p className="text-xs text-rose-500">{fieldErrors.customerName[0]}</p>
              )}
            </div>

            {/* Product Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pilih Produk / Paket *
                </label>
                <Link
                  href="/products"
                  className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
                  title="Buka menu Manajemen Produk & BOM untuk menambah produk atau resep baru"
                >
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  <span>+ Buat Produk Baru</span>
                </Link>
              </div>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setPreviewResult(null);
                  setShowFeasibilityWarning(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-shadow"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.workerHoursPerUnit}j staf, {p.machineHoursPerUnit}j oven)
                  </option>
                ))}
              </select>
            </div>

            {/* Product Requirements Chip */}
            {selectedProduct && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-1.5 text-[#64748B]">
                <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#1D4ED8]">inventory_2</span>
                  <span>Standar Produksi per 1 Unit:</span>
                </div>
                <div className="text-[#0F172A]">
                  Tenaga Kerja: <span className="font-mono font-bold text-[#1D4ED8]">{selectedProduct.workerHoursPerUnit} jam/unit</span>
                  {" • "}
                  Mesin/Oven: <span className="font-mono font-bold text-[#1D4ED8]">{selectedProduct.machineHoursPerUnit} jam/unit</span>
                </div>
                <div className="text-[11px] pt-1 border-t border-blue-100">
                  Bahan:{" "}
                  {selectedProduct.materials.map((m, i) => (
                    <span key={i} className="font-mono text-[#0F172A] mr-1.5">
                      {m.material.name} ({m.quantityPerUnit} {m.material.unit})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Jumlah Pesanan (Unit / Box) *
                </label>
                <span className="text-xs text-[#64748B]">Angka bulat</span>
              </div>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setPreviewResult(null);
                  setShowFeasibilityWarning(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-shadow"
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Target Tanggal Kirim *
                </label>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                  Sabtu-Minggu Libur Produksi
                </span>
              </div>
              <input
                type="date"
                min={minDateStr}
                required
                value={deliveryDate}
                onChange={(e) => {
                  setDeliveryDate(e.target.value);
                  setPreviewResult(null);
                  setShowFeasibilityWarning(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-shadow"
              />
              <p className="text-[11px] text-[#64748B]">
                Engine menghitung hari kerja aktif (Senin–Jumat) untuk mencegah janji deadline yang meleset.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Catatan Internal / Khusus (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="contoh: Permintaan pita emas, kartu ucapan custom..."
                className="w-full px-3.5 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-shadow resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-check-feasibility"
                onClick={handleCheckFeasibility}
                disabled={isPreviewLoading}
                className="flex-1 py-3 px-4 rounded-xl border border-[#1D4ED8]/40 bg-blue-50/70 hover:bg-blue-100 text-[#1D4ED8] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                {isPreviewLoading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                )}
                Uji Kelayakan Kapasitas
              </button>

              <button
                type="submit"
                id="btn-submit-order"
                disabled={isPending}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm
                  ${previewResult
                    ? "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-600"
                  }`}
                title={!previewResult ? "Jalankan Uji Kelayakan terlebih dahulu untuk hasil terbaik" : ""}
              >
                {isPending ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {previewResult ? "check_circle" : "edit_note"}
                  </span>
                )}
                {previewResult ? "Konfirmasi & Terima Pesanan" : "Terima Pesanan (Belum Dicek)"}
              </button>
            </div>

            {/* Hint if not yet checked */}
            {!previewResult && (
              <p className="text-center text-[11px] text-[#94a3b8]">
                💡 Disarankan: klik <strong>Uji Kelayakan</strong> dulu sebelum terima pesanan
              </p>
            )}
          </form>
        </div>

        {/* ── Live DSS Analysis Preview Column ─────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Engine Keputusan Kapasitas Real-Time
              </h3>
            </div>
            {previewResult && (
              <span className="text-xs text-[#1D4ED8] font-bold font-mono bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Hasil Simulasi: {quantity} Unit
              </span>
            )}
          </div>

          {previewResult ? (
            <FeasibilityCard
              analysis={previewResult}
              productName={selectedProduct?.name || "Produk"}
              quantity={quantity}
              customerName={customerName || "Pelanggan"}
              deliveryDateStr={deliveryDate ? new Date(deliveryDate).toISOString() : new Date().toISOString()}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-10 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] mx-auto flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">analytics</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-[#0F172A]">Simulasi Kapasitas Siap Dijalankan</h4>
                <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Klik tombol <strong>&quot;Uji Kelayakan Kapasitas&quot;</strong> di formulir sebelah kiri
                  untuk menghitung ketersediaan jam kerja operator, jam oven, stok packaging, dan buffer
                  waktu pengiriman secara presisi.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-[#64748B]">
                {["Jam Kerja Staf", "Kapasitas Oven", "Stok Bahan", "Buffer Deadline"].map((label) => (
                  <span key={label} className="px-2.5 py-1 bg-slate-100 rounded-full font-medium">
                    ⏳ {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
