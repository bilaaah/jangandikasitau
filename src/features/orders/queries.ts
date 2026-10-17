// src/features/orders/queries.ts
//
// Read-only database queries for orders and capacity commitments.
// All queries require businessId for strict multi-tenant isolation.

import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

/**
 * Retrieves all orders for a business with their latest capacity analysis and line items.
 */
export async function getOrders(businessId: string) {
  return db.order.findMany({
    where: { businessId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      capacityAnalyses: {
        orderBy: { analyzedAt: "desc" },
        take: 1,
        include: {
          bottlenecks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retrieves a single order with its items, product details, and all capacity analyses.
 */
export async function getOrderById(orderId: string, businessId: string) {
  return db.order.findFirst({
    where: { id: orderId, businessId },
    include: {
      items: {
        include: {
          product: {
            include: {
              materials: {
                include: {
                  material: true,
                },
              },
            },
          },
        },
      },
      capacityAnalyses: {
        orderBy: { analyzedAt: "desc" },
        include: {
          bottlenecks: true,
        },
      },
    },
  });
}

/**
 * Calculates current active commitments for all CONFIRMED and IN_PROGRESS orders.
 * Sums up:
 *  - Worker hours committed
 *  - Machine hours committed
 *  - Material quantities committed
 */
export async function getActiveCommitments(businessId: string) {
  const activeOrders = await db.order.findMany({
    where: {
      businessId,
      status: {
        in: [OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS],
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              materials: true,
            },
          },
        },
      },
    },
  });

  let workerHoursCommitted = 0;
  let machineHoursCommitted = 0;
  const materialCommitmentsMap = new Map<string, number>();

  for (const order of activeOrders) {
    for (const item of order.items) {
      const qty = item.quantity;
      workerHoursCommitted += qty * item.product.workerHoursPerUnit;
      machineHoursCommitted += qty * item.product.machineHoursPerUnit;

      for (const pm of item.product.materials) {
        const currentTotal = materialCommitmentsMap.get(pm.materialId) ?? 0;
        materialCommitmentsMap.set(
          pm.materialId,
          currentTotal + qty * pm.quantityPerUnit,
        );
      }
    }
  }

  const materialCommitments = Array.from(materialCommitmentsMap.entries()).map(
    ([materialId, quantityCommitted]) => ({
      materialId,
      quantityCommitted,
    }),
  );

  return {
    workerHoursCommitted,
    machineHoursCommitted,
    materialCommitments,
  };
}
