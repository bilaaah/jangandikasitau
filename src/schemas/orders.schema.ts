// src/schemas/orders.schema.ts
//
// Zod validation schemas for order inputs.
// Single source of truth for validation on client forms and Server Actions.

import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .max(100, "Customer name must be 100 characters or less"),

  productId: z.string().cuid("Invalid product selection"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),

  requiredDeliveryDate: z
    .string()
    .datetime({ message: "Invalid delivery date format" })
    .refine(
      (dateStr) => new Date(dateStr) > new Date(),
      "Delivery date must be in the future",
    ),

  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const OrderIdSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: OrderIdSchema.shape.orderId,
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
