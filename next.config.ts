import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Core options */
  cacheComponents: true,
  partialPrefetching: true,

  /* Laptop dev server memory optimization */
  onDemandEntries: {
    maxInactiveAge: 15 * 1000, // Dispose inactive pages from memory after 15s
    pagesBufferLength: 2,       // Keep at most 2 pages buffered in dev server RAM
  },
  cacheMaxMemorySize: 25 * 1024 * 1024, // 25 MB max in-memory cache
  serverExternalPackages: ["@prisma/client", "prisma"],

  experimental: {
    turbopackMemoryEviction: "auto",
  },
};

export default nextConfig;
