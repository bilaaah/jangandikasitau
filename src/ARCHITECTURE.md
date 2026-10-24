# Arsitektur folder BizCapacity

Satu pohon folder. Jangan menghidupkan kembali `src/features/`.

## Kepemilikan

| Folder | Anggota | Isi |
|---|---|---|
| `src/app/`, `src/components/` | 1 — UI | Rute App Router dan komponen tampilan |
| `prisma/`, `src/actions/` (kecuali AI), `src/queries/`, `src/schemas/`, `src/engine/` | 2 — Backend & engine | DB, Server Actions, query, Zod, kalkulasi murni |
| `src/ai/`, `src/actions/ai.actions.ts`, `src/engine/simulation/` | 3 — AI & simulasi | Prompt, Gemini, what-if |
| `src/engine/types.ts` | bersama | Kontrak `CapacityEngineInput` / `CapacityEngineResult`. **Jangan diubah sepihak.** |
| `src/lib/` | bersama (hati-hati) | `db.ts` hanya server; `utils.ts` boleh UI |

## Arah dependensi

```
app / components  →  actions, types, components
actions           →  queries, schemas, engine, ai, lib
queries           →  lib/db
ai                →  engine types, Gemini (tanpa Prisma)
engine            →  types + constants saja (tanpa Next, Prisma, actions, AI)
```

## Konvensi nama

| Lapisan | File | Export |
|---|---|---|
| Server Actions | `orders.actions.ts` | `createOrderAction`, alias form `createOrder` |
| Queries | `orders.queries.ts` | `getOrders`, `getOrderById` |
| Schemas | `orders.schema.ts` | `CreateOrderSchema` |
| Engine | `capacity/calculator.ts` | `runCapacityEngine` |
| AI | `ai.actions.ts`, `prompts/*.prompt.ts` | `generateAdviceAction` |
| UI | `components/<domain>/PascalCase.tsx` | named export |

## Aturan import

- **Client UI** hanya `@/actions/<file>.actions`, `@/components/*`, `@/types`, dan `@/ai/types` untuk props.
- **Server Components (page.tsx)** boleh `@/queries/*` dan `@/lib/context`.
- Dilarang dari UI: `@/lib/db`, implementasi engine (`calculator`, `scenario`), `@/ai/gemini`, `@/ai/service`, barrel `@/actions` / `@/ai` / `@/engine`.
- Engine dilarang import `next`, `@prisma/client`, `@/actions`, `@/ai`, `@/queries`.
- AI dilarang import `@/lib/db` dan `@/queries`.

## Dev server di laptop

```bash
npm run dev
```

Jangan jalankan `npm run db:studio` bersamaan dengan `dev` di RAM 8GB. Seed/migrate hanya saat skema berubah.
