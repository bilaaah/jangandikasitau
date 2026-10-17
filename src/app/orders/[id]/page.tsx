// src/app/orders/[id]/page.tsx
//
// Order detail view displaying customer specs, lifecycle status, and the DSS Capacity Feasibility analysis.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessId } from "@/lib/context";
import { getOrderById } from "@/features/orders/queries";
import { FeasibilityCard } from "@/components/feasibility/FeasibilityCard";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { formatDate } from "@/lib/utils";
import type { CapacityEngineResult } from "@/features/capacity/types";


interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const businessId = await getBusinessId();
  const order = await getOrderById(id, businessId);

  if (!order) {
    notFound();
  }

  const item = order.items[0];
  const latestAnalysis = order.capacityAnalyses[0];

  // Reconstruct CapacityEngineResult shape from persisted record for FeasibilityCard
  let analysisResult: CapacityEngineResult | null = null;

  if (latestAnalysis) {
    const totalWorkerHours = latestAnalysis.availableWorkDays * 20; // fallback aggregate
    analysisResult = {
      status: latestAnalysis.status as any,
      availableWorkDays: latestAnalysis.availableWorkDays,
      estimatedProductionDays: latestAnalysis.estimatedProductionDays,
      bufferDays: latestAnalysis.bufferDays,
      workerAnalysis: {
        totalAvailableHours: totalWorkerHours,
        committedHours: 0,
        requiredHours: (item?.quantity ?? 0) * (item?.product.workerHoursPerUnit ?? 0),
        freeHours: 0,
        gap: 0,
        utilizationPercent: latestAnalysis.workerUtilizationPercent,
      },
      machineAnalysis: {
        totalAvailableHours: latestAnalysis.availableWorkDays * 18,
        committedHours: 0,
        requiredHours: (item?.quantity ?? 0) * (item?.product.machineHoursPerUnit ?? 0),
        freeHours: 0,
        gap: 0,
        utilizationPercent: latestAnalysis.machineUtilizationPercent,
      },
      materialAnalysis: (item?.product.materials ?? []).map((pm) => ({
        materialId: pm.material.name,
        unit: pm.material.unit,
        requiredQuantity: (item?.quantity ?? 0) * pm.quantityPerUnit,
        currentStock: pm.material.currentStock,
        committedQuantity: 0,
        effectiveAvailable: pm.material.currentStock,
        gap: pm.material.currentStock - (item?.quantity ?? 0) * pm.quantityPerUnit,
      })),
      bottlenecks: latestAnalysis.bottlenecks.map((b) => ({
        resourceType: b.resourceType as any,
        resourceId: b.resourceId ?? undefined,
        description: b.description,
        severity: b.severity as any,
      })),
      reasoning: (latestAnalysis.reasoning as string[]) || [],
    };
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/orders" className="hover:text-foreground transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Order {order.id.slice(0, 8)}...</span>
      </div>

      {/* Header and Status Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {order.customerName}
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
              #{order.id.slice(0, 8)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created on {formatDate(order.createdAt)} &bull; Deadline:{" "}
            <strong className="text-foreground">{formatDate(order.requiredDeliveryDate)}</strong>
          </p>
        </div>

        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order & Product Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Order Line Items
            </h3>

            {item ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-base">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.product.description || "No description"}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-foreground text-background">
                      {item.quantity} units
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <div>
                      <span>Worker labor: </span>
                      <strong className="text-foreground font-mono">
                        {item.quantity * item.product.workerHoursPerUnit}h
                      </strong>
                    </div>
                    <div>
                      <span>Machine time: </span>
                      <strong className="text-foreground font-mono">
                        {item.quantity * item.product.machineHoursPerUnit}h
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Materials required */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bill of Materials Required
                  </h5>
                  <div className="divide-y divide-border/40 rounded-xl border bg-background text-xs">
                    {item.product.materials.map((pm) => (
                      <div key={pm.id} className="p-2.5 flex items-center justify-between">
                        <span>{pm.material.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {item.quantity * pm.quantityPerUnit} {pm.material.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No item details available.</p>
            )}

            {order.notes && (
              <div className="pt-2 border-t border-border/40 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Notes:</span>
                <p className="text-xs italic text-foreground bg-muted/30 p-2.5 rounded-lg">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: DSS Feasibility Report */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              DSS Feasibility Snapshot
            </h3>
            {latestAnalysis && (
              <span className="text-xs text-muted-foreground">
                Analyzed at {new Date(latestAnalysis.analyzedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {analysisResult ? (
            <FeasibilityCard analysis={analysisResult} />
          ) : (
            <div className="rounded-2xl border p-8 text-center text-muted-foreground bg-card">
              No feasibility snapshot found for this order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
