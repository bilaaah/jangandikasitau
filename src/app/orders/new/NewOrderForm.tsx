"use client";

// src/app/orders/new/NewOrderForm.tsx
//
// Interactive Order Creation Form with Live Capacity Feasibility Preview.
// Provides instantaneous DSS evaluation of constraints before committing to an order.

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrder, checkFeasibilityPreview } from "@/features/orders/actions";
import type { CapacityEngineResult } from "@/features/capacity/types";
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

export function NewOrderForm({ products }: NewOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    // Default to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");

  // DSS preview states
  const [previewResult, setPreviewResult] = useState<CapacityEngineResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const selectedProduct = products.find((p) => p.id === productId);

  // Live feasibility test handler
  async function handleCheckFeasibility() {
    if (!productId || quantity <= 0 || !deliveryDate) {
      setErrorMsg("Please select a product, enter quantity > 0, and choose a delivery date.");
      return;
    }

    setIsPreviewLoading(true);
    setErrorMsg(null);

    try {
      const res = await checkFeasibilityPreview(
        productId,
        quantity,
        new Date(deliveryDate).toISOString(),
      );

      if (res.success && res.data) {
        setPreviewResult(res.data);
      } else {
        setErrorMsg(res.error || "Failed to check capacity feasibility.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute DSS preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  }

  // Submit order handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

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
        router.push(`/orders/${res.data.orderId}`);
      } else {
        setErrorMsg(res.error || "Order creation failed.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  }

  // Min delivery date: tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Column */}
      <div className="lg:col-span-5 bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Order Specifications</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Input customer requirements to test against current workforce, machinery, and material commitments.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Acme Catering Ltd."
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
            />
            {fieldErrors.customerName && (
              <p className="text-xs text-rose-500">{fieldErrors.customerName[0]}</p>
            )}
          </div>

          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Product *
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setPreviewResult(null); // reset preview on product change
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.workerHoursPerUnit}h worker, {p.machineHoursPerUnit}h machine)
                </option>
              ))}
            </select>
          </div>

          {/* Product Requirements Chip */}
          {selectedProduct && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1 text-muted-foreground">
              <div className="font-semibold text-foreground">Unit Specifications:</div>
              <div>
                Labor: <span className="font-mono text-foreground">{selectedProduct.workerHoursPerUnit} hrs/unit</span>
                {" &bull; "}
                Machine: <span className="font-mono text-foreground">{selectedProduct.machineHoursPerUnit} hrs/unit</span>
              </div>
              <div>
                Materials:{" "}
                {selectedProduct.materials.map((m, i) => (
                  <span key={i} className="font-mono text-foreground mr-1.5">
                    {m.material.name} ({m.quantityPerUnit} {m.material.unit})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity (Units) *
              </label>
              <span className="text-xs text-muted-foreground">Whole integer</span>
            </div>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => {
                setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                setPreviewResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
            />
          </div>

          {/* Delivery Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requested Delivery Date *
              </label>
              <span className="text-xs text-muted-foreground">Mon–Fri working days</span>
            </div>
            <input
              type="date"
              min={minDateStr}
              required
              value={deliveryDate}
              onChange={(e) => {
                setDeliveryDate(e.target.value);
                setPreviewResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Internal Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Special packing or priority rush order..."
              className="w-full px-3.5 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCheckFeasibility}
              disabled={isPreviewLoading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isPreviewLoading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )}
              Run Live DSS Test
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 px-4 rounded-xl bg-foreground hover:opacity-90 text-background text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              Confirm & Save Order
            </button>
          </div>
        </form>
      </div>

      {/* Live DSS Analysis Preview Column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Real-time Decision Support Engine
            </h3>
          </div>
          {previewResult && (
            <span className="text-xs text-muted-foreground font-mono">
              Tested for {quantity} units
            </span>
          )}
        </div>

        {previewResult ? (
          <FeasibilityCard analysis={previewResult} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/80 text-muted-foreground mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h4 className="font-semibold text-foreground">Interactive Capacity Simulation Ready</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click <strong>&quot;Run Live DSS Test&quot;</strong> to evaluate worker hours, machine capacity, raw stock, and buffer days before committing to customer deadlines.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
