// src/app/page.tsx
//
// Landing Page for BizCapacity DSS.
// "Know Your Capacity Before You Promise."

import Link from "next/link";
import { FeasibilityBadge } from "@/components/feasibility/FeasibilityBadge";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(0,0,0,0))]" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Decision Support System for Make-To-Order SMEs
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-tight">
            Know Your Capacity{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Before You Promise.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            BizCapacity helps manufacturing and make-to-order businesses evaluate customer orders against active worker hours, machine capacity, raw material stock, and delivery deadlines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/orders/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 transition-all shadow-lg shadow-indigo-500/25 text-sm"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Analyze New Order Now</span>
            </Link>

            <Link
              href="/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 hover:bg-muted font-semibold px-6 py-3.5 transition-all text-sm text-foreground"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>View Orders & Capacity</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid */}
      <section className="py-16 md:py-20 bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Deterministic Decision Engine
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlike generic spreadsheets or blind intuition, BizCapacity runs an aggregate multi-constraint mathematical evaluation for every order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">Feasibility Verdicts</h3>
                  <FeasibilityBadge status="FEASIBLE" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant classification into <strong>FEASIBLE</strong>, <strong>AT RISK</strong> (soft thresholds &gt;85% load or ≤1 day buffer), or <strong>NOT FEASIBLE</strong>.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">Resource Pooling</h3>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Hours & Units
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aggregates daily worker hours and machine capacity across Mon–Fri working days, accounting for commitments from active orders.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">Bottleneck Detection</h3>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600">
                    Deficit Alert
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifies specific material shortages, labor hour deficits, or tight deadlines before you make promises to clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
