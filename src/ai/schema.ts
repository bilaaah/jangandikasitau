import { z } from "zod";

export const ACTION_CATEGORIES = ["WORKFORCE", "MACHINERY", "MATERIAL", "DEADLINE", "STRATEGY"] as const;
export const ACTION_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

/** Validasi di sisi server. riskAssessment sengaja tidak ada: ditentukan engine, bukan AI. */
export const adviceSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  actionItems: z
    .array(
      z.object({
        category: z.enum(ACTION_CATEGORIES),
        priority: z.enum(ACTION_PRIORITIES),
        action: z.string().min(1),
        impact: z.string().min(1),
      }),
    )
    .min(1)
    .max(6),
  customerNegotiationTip: z.string().optional(),
});

/** Skema yang dikirim ke Gemini agar keluaran dipaksa sesuai daftar nilai. */
export const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING" },
    summary: { type: "STRING" },
    actionItems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING", enum: [...ACTION_CATEGORIES] },
          priority: { type: "STRING", enum: [...ACTION_PRIORITIES] },
          action: { type: "STRING" },
          impact: { type: "STRING" },
        },
        required: ["category", "priority", "action", "impact"],
      },
    },
    customerNegotiationTip: { type: "STRING" },
  },
  required: ["headline", "summary", "actionItems"],
};