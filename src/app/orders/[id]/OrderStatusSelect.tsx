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

  const handleStatusChange = (newStatus: string) => {
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

  return (
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
  );
}
