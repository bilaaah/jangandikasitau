import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Core options */
  cacheComponents: true,
  partialPrefetching: true,

  /* Dev server cache optimization for instant navigation */
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // Keep compiled pages cached for 1 hour
    pagesBufferLength: 15,          // Buffer all sidebar pages in memory for instant switching
  },
  serverExternalPackages: ["@prisma/client", "prisma"],

  experimental: {
    turbopackMemoryEviction: "auto",
  },
};

export default nextConfig;
