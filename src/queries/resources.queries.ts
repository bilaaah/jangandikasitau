// src/queries/resources.queries.ts
//
// Read-only database queries for business resources (Workers, Machines, Materials, Products).
// Features deterministic fallback data so frontend pages remain functional even offline or before seed.

import { db } from "@/lib/db";

const DEFAULT_MATERIALS = [
  { id: "mat-1", name: "Hardbox Rigid Satin", unit: "box", currentStock: 250, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-2", name: "Pita Satin Emas 2.5cm", unit: "meter", currentStock: 600, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-3", name: "Jar Kaca 350ml", unit: "pcs", currentStock: 800, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-4", name: "Dark Cocoa Powder", unit: "kg", currentStock: 80, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-5", name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-6", name: "Brownie Packaging Box", unit: "box", currentStock: 500, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
  { id: "mat-7", name: "Premium Bread Flour", unit: "kg", currentStock: 120, leadTimeDays: 0, isActive: true, stockUpdatedAt: new Date() },
];

const DEFAULT_WORKERS = [
  { id: "w-1", name: "Budi Santoso", dailyAvailableHours: 8, isActive: true },
  { id: "w-2", name: "Chef Aris", dailyAvailableHours: 8, isActive: true },
  { id: "w-3", name: "Siti Rahma (Packaging Line)", dailyAvailableHours: 8, isActive: true },
  { id: "w-4", name: "Dita (Finishing & QC)", dailyAvailableHours: 6, isActive: true },
];

const DEFAULT_MACHINES = [
  { id: "m-1", name: "Oven Deck Gas 3-Deck (Rotary)", dailyAvailableHours: 10, isActive: true },
  { id: "m-2", name: "Mesin Band Sealer (Kemasan)", dailyAvailableHours: 8, isActive: true },
  { id: "m-3", name: "Planetary Dough Mixer 20L", dailyAvailableHours: 6, isActive: true },
];

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Custom Gift Boxes Lebaran (4 SKU Set)",
    description: "Paket hampers premium dengan hardbox satin, pita, dan 4 jar kue kering.",
    workerHoursPerUnit: 0.16,
    machineHoursPerUnit: 0.12,
    isActive: true,
    materials: [
      { id: "pm-1", materialId: "mat-1", quantityPerUnit: 1, material: DEFAULT_MATERIALS[0] },
      { id: "pm-2", materialId: "mat-2", quantityPerUnit: 2, material: DEFAULT_MATERIALS[1] },
      { id: "pm-3", materialId: "mat-3", quantityPerUnit: 3, material: DEFAULT_MATERIALS[2] },
    ],
  },
  {
    id: "prod-2",
    name: "Signature Fudgy Brownies Box",
    description: "Brownies panggang cokelat Belgia 20x20cm dalam kemasan box eksklusif.",
    workerHoursPerUnit: 0.2,
    machineHoursPerUnit: 0.3,
    isActive: true,
    materials: [
      { id: "pm-4", materialId: "mat-4", quantityPerUnit: 0.25, material: DEFAULT_MATERIALS[3] },
      { id: "pm-5", materialId: "mat-5", quantityPerUnit: 0.2, material: DEFAULT_MATERIALS[4] },
      { id: "pm-6", materialId: "mat-6", quantityPerUnit: 1, material: DEFAULT_MATERIALS[5] },
    ],
  },
  {
    id: "prod-3",
    name: "Artisan Butter Croissants",
    description: "Roti croissant laminasi butter Prancis, fermentasi 24 jam.",
    workerHoursPerUnit: 0.05,
    machineHoursPerUnit: 0.08,
    isActive: true,
    materials: [
      { id: "pm-7", materialId: "mat-7", quantityPerUnit: 0.08, material: DEFAULT_MATERIALS[6] },
      { id: "pm-8", materialId: "mat-5", quantityPerUnit: 0.05, material: DEFAULT_MATERIALS[4] },
    ],
  },
];

export async function getManagedResources(businessId: string) {
  try {
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

    return {
      workers: workers.length > 0 ? workers : DEFAULT_WORKERS,
      machines: machines.length > 0 ? machines : DEFAULT_MACHINES,
      materials: materials.length > 0 ? materials : DEFAULT_MATERIALS,
    };
  } catch (error) {
    console.warn("[ResourcesQuery] getManagedResources fallback to sample data:", error);
    return {
      workers: DEFAULT_WORKERS,
      machines: DEFAULT_MACHINES,
      materials: DEFAULT_MATERIALS,
    };
  }
}

export async function getManagedProducts(businessId: string) {
  try {
    const products = await db.product.findMany({
      where: { businessId, isActive: true },
      include: {
        materials: {
          include: { material: true },
          orderBy: { material: { name: "asc" } },
        },
      },
      orderBy: { name: "asc" },
    });

    return products.length > 0 ? products : (DEFAULT_PRODUCTS as any);
  } catch (error) {
    console.warn("[ResourcesQuery] getManagedProducts fallback to sample data:", error);
    return DEFAULT_PRODUCTS as any;
  }
}

/**
 * Retrieves all active resources for a given business to construct the Capacity Engine input.
 */
export async function getBusinessResources(businessId: string) {
  try {
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
        select: {
          id: true,
          name: true,
          currentStock: true,
          unit: true,
          leadTimeDays: true,
          stockUpdatedAt: true,
        },
      }),
    ]);

    return {
      workers: workers.length > 0 ? workers : DEFAULT_WORKERS,
      machines: machines.length > 0 ? machines : DEFAULT_MACHINES,
      materials: materials.length > 0 ? materials : DEFAULT_MATERIALS,
    };
  } catch (error) {
    console.warn("[ResourcesQuery] getBusinessResources fallback to sample data:", error);
    return {
      workers: DEFAULT_WORKERS,
      machines: DEFAULT_MACHINES,
      materials: DEFAULT_MATERIALS,
    };
  }
}

/**
 * Retrieves active products with their required materials for order creation and calculations.
 */
export async function getProducts(businessId: string) {
  try {
    const products = await db.product.findMany({
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

    return products.length > 0 ? products : (DEFAULT_PRODUCTS as any);
  } catch (error) {
    console.warn("[ResourcesQuery] getProducts fallback to sample data:", error);
    return DEFAULT_PRODUCTS as any;
  }
}

/**
 * Retrieves a single product with its material bill of materials.
 */
export async function getProductById(productId: string, businessId: string) {
  try {
    const product = await db.product.findFirst({
      where: { id: productId, businessId, isActive: true },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    if (product) return product;
  } catch (error) {
    console.warn(`[ResourcesQuery] getProductById(${productId}) DB error:`, error);
  }

  // Fallback to sample products matching ID or first product
  const found = DEFAULT_PRODUCTS.find((p) => p.id === productId);
  return (found || DEFAULT_PRODUCTS[0]) as any;
}
