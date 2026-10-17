// src/lib/db.ts
//
// Prisma client singleton.
//
// Next.js hot-reloading creates new module instances during development,
// which would create multiple Prisma client connections and exhaust the
// PostgreSQL connection pool. This pattern prevents that by reusing a
// single instance stored on the global object.
//
// Do NOT instantiate PrismaClient anywhere else in the project.
// Always import { db } from "@/lib/db".

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
