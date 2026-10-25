"use client";

// src/app/orders/[id]/OrderStatusSelect.tsx
//
// Client component allowing real-time status transitions (DRAFT -> CONFIRMED -> IN_PROGRESS -> COMPLETED / CANCELLED).

import React, { useTransition } from "react";
import { updateOrderStatus } from "@/actions/orders.actions";
import { OrderStatus } from "@prisma/client";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus | string;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus({
        orderId,
        status: newStatus,
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Lifecycle Status:
      </span>
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold uppercase tracking-wider shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <option value="DRAFT">DRAFT</option>
        <option value="CONFIRMED">CONFIRMED (Consumes Capacity)</option>
        <option value="IN_PROGRESS">IN_PROGRESS (Consumes Capacity)</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      {isPending && (
        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
      )}
    </div>
  );
}
