// src/app/orders/page.tsx
//
// Orders listing page.
// Displays active orders, customer deadlines, and latest capacity feasibility statuses.

import Link from "next/link";
import { getBusinessId } from "@/lib/context";
import { getOrders } from "@/features/orders/queries";
import { FeasibilityBadge } from "@/components/feasibility/FeasibilityBadge";
import { formatDate } from "@/lib/utils";


export default async function OrdersPage() {
  let businessId: string | null = null;
  let errorMsg: string | null = null;
  let orders: any[] = [];

  try {
    businessId = await getBusinessId();
    orders = await getOrders(businessId);
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Summary counts
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ["CONFIRMED", "IN_PROGRESS"].includes(o.status)).length;
  const feasibleCount = orders.filter(
    (o) => o.capacityAnalyses[0]?.status === "FEASIBLE",
  ).length;
  const atRiskCount = orders.filter(
    (o) => o.capacityAnalyses[0]?.status === "AT_RISK",
  ).length;
  const notFeasibleCount = orders.filter(
    (o) => o.capacityAnalyses[0]?.status === "NOT_FEASIBLE",
  ).length;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Orders & Capacity Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor incoming customer orders, delivery deadlines, and deterministic feasibility ratings.
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 transition-all shadow-md shadow-indigo-500/20"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Evaluate New Order
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 stroke-current fill-none stroke-2 mt-0.5" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <span className="font-bold">Setup Required: </span>
            {errorMsg}
            <div className="mt-2 text-xs font-mono bg-background/50 p-2 rounded">
              Run: <code>npm run db:seed</code> then add <code>DEV_BUSINESS_ID=...</code> to <code>.env.local</code>.
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-xs">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Orders
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{totalOrders}</span>
            <span className="text-xs text-muted-foreground">({activeOrders} active)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 shadow-xs">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Feasible
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{feasibleCount}</span>
            <span className="text-xs text-muted-foreground">safe to produce</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20 shadow-xs">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            At Risk
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{atRiskCount}</span>
            <span className="text-xs text-muted-foreground">&gt;85% load or tight buffer</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-rose-500/5 border-rose-500/20 shadow-xs">
          <span className="text-xs font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Not Feasible
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">{notFeasibleCount}</span>
            <span className="text-xs text-muted-foreground">deficit / overload</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">Order Log & Decisions</h2>
          <span className="text-xs text-muted-foreground font-mono">{orders.length} records</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">No orders recorded yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                Begin by evaluating your first incoming customer order against current production capacity.
              </p>
            </div>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl bg-foreground text-background px-4 py-2 hover:opacity-90 transition"
            >
              Evaluate New Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3.5">Customer / Order</th>
                  <th className="px-6 py-3.5">Item & Qty</th>
                  <th className="px-6 py-3.5">Delivery Deadline</th>
                  <th className="px-6 py-3.5">Order Status</th>
                  <th className="px-6 py-3.5">DSS Feasibility</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => {
                  const item = order.items[0];
                  const analysis = order.capacityAnalyses[0];

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {order.id.slice(0, 8)}... &bull; {formatDate(order.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item ? (
                          <div>
                            <span className="font-medium text-foreground">{item.product.name}</span>
                            <span className="ml-2 text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              &times;{item.quantity}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No items</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {formatDate(order.requiredDeliveryDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.requiredDeliveryDate) < new Date() ? (
                            <span className="text-rose-500 font-semibold">Overdue</span>
                          ) : (
                            <span>Upcoming</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border/40">
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {analysis ? (
                          <FeasibilityBadge status={analysis.status} />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not analyzed</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <span>View DSS</span>
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
