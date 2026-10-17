// src/features/orders/schema.ts
//
// Zod validation schemas for order-related inputs.
// These schemas are the single source of truth for order data shape.
// They are used in:
//   - Server Actions (server-side validation before DB write)
//   - Client forms (via react-hook-form + zodResolver, Milestone 1 UI)
//
// Member B owns this file. Member A imports these schemas for form validation.

import { z } from "zod";

/**
 * Schema for creating a new order.
 * Validated server-side in the createOrder Server Action.
 */
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

/**
 * Schema for updating an order's status.
 */
export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
