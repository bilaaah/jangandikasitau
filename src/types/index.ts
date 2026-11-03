// src/types/index.ts
//
// Shared global types re-exported for UI and AI.
// Import from "@/types" instead of deep engine/schema paths.

export type {
  FeasibilityStatus,
  CapacityEngineInput,
  CapacityEngineResult,
  ResourceAnalysis,
  MaterialAnalysis,
  Bottleneck,
} from "@/engine/types";

export type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "@/schemas/orders.schema";

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type {
  WhatIfAdjustments,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
} from "@/engine/simulation/types";

export type {
  AiOrderAdvice,
  OperationalActionItem,
  RiskLevel,
  WhatIfAiInsight,
} from "@/ai/types";
