"use client";

// src/app/orders/[id]/OrderStatusSelect.tsx
//
// Client component allowing real-time status transitions (DRAFT -> CONFIRMED -> IN_PROGRESS -> COMPLETED / CANCELLED).

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/orders.actions";
import type { OrderStatus } from "@/types";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUS_OPTIONS: Record<OrderStatus, { value: OrderStatus; label: string }[]> = {
  DRAFT: [
    { value: "DRAFT", label: "DRAFT" },
    { value: "CONFIRMED", label: "Accept (rechecks capacity)" },
    { value: "CANCELLED", label: "Cancel" },
  ],
  CONFIRMED: [
    { value: "CONFIRMED", label: "CONFIRMED (capacity reserved)" },
    { value: "IN_PROGRESS", label: "Start production" },
    { value: "CANCELLED", label: "Cancel (release capacity)" },
  ],
  IN_PROGRESS: [
    { value: "IN_PROGRESS", label: "IN_PROGRESS (capacity reserved)" },
    { value: "COMPLETED", label: "Complete order" },
    { value: "CANCELLED", label: "Cancel (release capacity)" },
  ],
  COMPLETED: [{ value: "COMPLETED", label: "COMPLETED" }],
  CANCELLED: [{ value: "CANCELLED", label: "CANCELLED" }],
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const executeStatusChange = (newStatus: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        status: newStatus,
      });
      if (!result.success) {
        setFeedback({ error: true, message: result.error || "Status update failed." });
        return;
      }

      setFeedback({ error: false, message: "Order status updated." });
      router.refresh();
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "CANCELLED") {
      setShowCancelModal(true);
      return;
    }
    executeStatusChange(newStatus);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Lifecycle Status:
          </span>
          <select
            value={currentStatus}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold tracking-wider shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {STATUS_OPTIONS[currentStatus].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isPending && (
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          )}
        </div>
        {feedback && (
          <p
            role={feedback.error ? "alert" : "status"}
            className={`max-w-xs text-xs ${feedback.error ? "text-rose-600" : "text-emerald-700"}`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {/* Modal Konfirmasi Pembatalan Pesanan */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Batalkan Pesanan Ini?
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tindakan ini akan membatalkan pesanan. Semua komitmen jam kerja staf dan mesin yang sebelumnya terkunci akan otomatis dilepaskan untuk pesanan lain.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowCancelModal(false);
                  executeStatusChange("CANCELLED");
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Ya, Batalkan Pesanan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
