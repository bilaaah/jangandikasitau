"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface DashboardShellProps {
  children: React.ReactNode;
  activeCount?: number;
}

export function DashboardShell({ children, activeCount = 18 }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <AppSidebar
        activeCount={activeCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <AppHeader
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        isHelpOpen={helpOpen}
        onOpenHelp={() => setHelpOpen(true)}
        onCloseHelp={() => setHelpOpen(false)}
      />

      {/* ── Main content area: offset for sidebar on lg, header on all ── */}
      <div className="pl-0 lg:pl-64 pt-16 min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>

        {/* ── Subtle Small Text Footer at Bottom of Page ── */}
        <footer className="border-t border-[#e5eeff] py-5 px-4 sm:px-8 mt-auto text-[11px] text-[#737686]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[#0b1c30]">BizCapacity v2.4</span>
              <span>•</span>
              <span>Sistem Keputusan Kapasitas UMKM</span>
            </div>
            <div>
              © 2026 BizCapacity Indonesia • Hak Cipta Dilindungi
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
