import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BizCapacity — Know Your Capacity Before You Promise",
  description:
    "Decision Support System for make-to-order SMEs to evaluate order feasibility against worker hours, machine capacity, stock, and delivery deadlines.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-indigo-500/20 selection:text-indigo-600">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
          <div className="container max-w-7xl mx-auto px-4">
            BizCapacity &copy; 2026 &bull; Decision Support System for Make-To-Order SMEs &bull; Milestone 1
          </div>
        </footer>
      </body>
    </html>
  );
}
