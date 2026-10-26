// src/queries/resources.queries.ts
//
// Read-only database queries for business resources (Workers, Machines, Materials, Products).
// Owned by Backend & Engine Lead (Anggota 2).

import { db } from "@/lib/db";

export async function getManagedResources(businessId: string) {
  const [workers, machines, materials] = await Promise.all([
    db.worker.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    db.machine.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    db.material.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { workers, machines, materials };
}

export async function getManagedProducts(businessId: string) {
  return db.product.findMany({
    where: { businessId, isActive: true },
    include: {
      materials: {
        include: { material: true },
        orderBy: { material: { name: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Retrieves all active resources for a given business to construct the Capacity Engine input.
 */
export async function getBusinessResources(businessId: string) {
  const [workers, machines, materials] = await Promise.all([
    db.worker.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, dailyAvailableHours: true },
    }),
    db.machine.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, dailyAvailableHours: true },
    }),
    db.material.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, currentStock: true, unit: true, stockUpdatedAt: true },
    }),
  ]);

  return { workers, machines, materials };
}

/**
 * Retrieves active products with their required materials for order creation and calculations.
 */
export async function getProducts(businessId: string) {
  return db.product.findMany({
    where: { businessId, isActive: true },
    include: {
      materials: {
        include: {
          material: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Retrieves a single product with its material bill of materials.
 */
export async function getProductById(productId: string, businessId: string) {
  return db.product.findFirst({
    where: { id: productId, businessId, isActive: true },
    include: {
      materials: {
        include: {
          material: true,
        },
      },
    },
  });
}
