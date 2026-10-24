import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/features(/.*)?$",
              message:
                "src/features telah dihapus. Gunakan @/actions, @/queries, @/engine, @/ai, atau @/types.",
            },
            {
              regex: "^@/lib/db$",
              message: "UI tidak boleh import Prisma. Panggil Server Actions atau queries dari RSC.",
            },
            {
              regex: "^@/engine/(capacity|simulation)/",
              message:
                "UI tidak boleh import implementasi engine. Pakai @/types dan @/actions.",
            },
            {
              regex: "^@/engine$",
              message: "Jangan import barrel @/engine dari UI. Tipe bersama: @/types.",
            },
            {
              regex: "^@/ai$",
              message: "Jangan import barrel @/ai. Tipe: @/ai/types. Pemanggilan: @/actions/ai.actions.",
            },
            {
              regex: "^@/ai/(gemini|service|prompts)(/.*)?$",
              message: "UI tidak boleh memanggil Gemini langsung. Gunakan @/actions/ai.actions.",
            },
            {
              regex: "^@/actions$",
              message:
                "Jangan import barrel @/actions (membengkak bundle). Import file spesifik, mis. @/actions/orders.actions.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/features(/.*)?$",
              message: "src/features telah dihapus.",
            },
            {
              regex: "^@/lib/db$",
              message: "Komponen tidak boleh import Prisma.",
            },
            {
              regex: "^@/queries(/.*)?$",
              message:
                "Komponen UI tidak boleh import queries. Server page memanggil query, lalu passing props.",
            },
            {
              regex: "^@/engine/(capacity|simulation)/",
              message: "Komponen tidak boleh import implementasi engine.",
            },
            {
              regex: "^@/engine$",
              message: "Jangan import barrel @/engine. Tipe: @/types.",
            },
            {
              regex: "^@/ai$",
              message: "Jangan import barrel @/ai. Tipe: @/ai/types.",
            },
            {
              regex: "^@/ai/(gemini|service|prompts)(/.*)?$",
              message: "Komponen tidak boleh memanggil Gemini. Gunakan @/actions/ai.actions.",
            },
            {
              regex: "^@/actions$",
              message: "Import file action spesifik, bukan barrel @/actions.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/engine/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^next(/.*)?$",
              message: "Engine harus pure: tanpa Next.js.",
            },
            {
              regex: "^(@prisma/client|prisma)$",
              message: "Engine harus pure: tanpa Prisma / I/O.",
            },
            {
              regex: "^@/actions(/.*)?$",
              message: "Engine tidak boleh import Server Actions.",
            },
            {
              regex: "^@/ai(/.*)?$",
              message: "Engine tidak boleh import modul AI.",
            },
            {
              regex: "^@/lib/db$",
              message: "Engine tidak boleh akses database.",
            },
            {
              regex: "^@/queries(/.*)?$",
              message: "Engine tidak boleh import queries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/ai/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/lib/db$",
              message: "AI tidak boleh akses Prisma. Terima hasil engine sebagai input.",
            },
            {
              regex: "^(@prisma/client|prisma)$",
              message: "AI tidak boleh import Prisma.",
            },
            {
              regex: "^@/queries(/.*)?$",
              message: "AI tidak boleh import queries.",
            },
            {
              regex: "^@/actions(/.*)?$",
              message: "AI dipanggil dari actions, bukan sebaliknya.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
