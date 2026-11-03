"use client";

import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "sidebar";
}

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const handler = () => {
      const darkNow = document.documentElement.classList.contains("dark");
      setTheme(darkNow ? "dark" : "light");
    };

    window.addEventListener("theme-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("theme-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("bizcapacity_theme", "dark");
      } catch {
        /* storage guard */
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("bizcapacity_theme", "light");
      } catch {
        /* storage guard */
      }
    }

    window.dispatchEvent(new Event("theme-changed"));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    if (variant === "sidebar") {
      return (
        <div className={`h-8 w-full rounded-xl bg-slate-100 dark:bg-white/[0.04] opacity-40 animate-pulse ${className}`} />
      );
    }
    if (variant === "pill") {
      return (
        <div className={`h-8 w-28 rounded-full bg-slate-100 dark:bg-white/[0.04] opacity-40 animate-pulse ${className}`} />
      );
    }
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-slate-800/50 opacity-40 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Sidebar Row Toggle Variant
  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all group ${
          theme === "dark"
            ? "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-[17px] transition-transform duration-300 ${
              theme === "dark" ? "text-amber-300 rotate-180" : "text-blue-600"
            }`}
          >
            {theme === "dark" ? "dark_mode" : "light_mode"}
          </span>
          <span className="text-[12px]">{theme === "dark" ? "Mode Gelap" : "Mode Terang"}</span>
        </div>
        <div
          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center ${
            theme === "dark" ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              theme === "dark" ? "translate-x-3.5" : "translate-x-0"
            }`}
          />
        </div>
      </button>
    );
  }

  // Pill Variant
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer active:scale-95 ${
          theme === "dark"
            ? "bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700/90 hover:border-slate-600"
            : "bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200"
        } ${className}`}
      >
        <span
          className={`material-symbols-outlined text-[17px] transition-transform duration-300 ${
            theme === "dark" ? "rotate-180 text-amber-300" : "text-amber-500"
          }`}
        >
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
        <span className="text-[11.5px]">{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>
      </button>
    );
  }

  // Modern Icon Button (Default)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      title={theme === "dark" ? "Mode Gelap aktif (Klik untuk Mode Terang)" : "Mode Terang aktif (Klik untuk Mode Gelap)"}
      className={`relative w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center border shadow-xs cursor-pointer active:scale-90 ${
        theme === "dark"
          ? "bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600 hover:text-amber-200 shadow-black/20"
          : "bg-white/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-blue-600 shadow-slate-200/50"
      } ${className}`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-all duration-300 ${
          theme === "dark" ? "text-amber-300 rotate-180" : "text-slate-700 hover:text-blue-600"
        }`}
      >
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
