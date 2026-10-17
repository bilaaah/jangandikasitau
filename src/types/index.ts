// src/types/index.ts
//
// Shared global types re-exported from feature modules.
// All components and pages can import from "@/types" instead of deep paths.

export type {
  FeasibilityStatus,
  CapacityEngineInput,
  CapacityEngineResult,
  ResourceAnalysis,
  MaterialAnalysis,
  Bottleneck,
} from "@/features/capacity/types";

export type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "@/features/orders/schema";
