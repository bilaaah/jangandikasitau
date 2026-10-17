# BizCapacity

> **Tagline:** *Know Your Capacity Before You Promise.*  
> **Product Type:** Decision Support System (DSS) for Make-to-Order SMEs (UMKM).

BizCapacity helps manufacturing and make-to-order businesses evaluate customer orders against active worker hours, machine capacity, raw material stock, and delivery deadlines.

---

## 🚀 Core Features (Milestone 1)

1. **Deterministic Capacity Engine (`src/features/capacity/engine.ts`)**:
   - Pure, mathematical calculation functions (no database I/O inside the engine).
   - Evaluates pooled worker hours, machine hours, raw material stock, and available Mon–Fri working days.
   - Calculates resource gap and utilization percentages.
2. **Feasibility Verdicts**:
   - `FEASIBLE`: All constraints satisfied within safety margins.
   - `AT_RISK`: Hard constraints met, but utilization >85% or buffer ≤ 1 working day.
   - `NOT_FEASIBLE`: Material deficit, insufficient labor/machine hours, or unachievable deadline.
3. **Interactive DSS Simulation Preview (`/orders/new`)**:
   - SME owners can simulate order quantities and delivery dates in real time *before* creating the order.
4. **Order Lifecycle & Bottlenecks Log (`/orders` & `/orders/[id]`)**:
   - Tracks `DRAFT`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - Only `CONFIRMED` and `IN_PROGRESS` orders consume pooled capacity commitments.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router with Server Actions)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS
- **Database ORM:** Prisma 6 with PostgreSQL
- **Schema Validation:** Zod
- **Architecture:** Feature-driven modular layout (`src/features/orders`, `src/features/capacity`, `src/features/resources`)

---

## 👥 Team Collaboration Contract

- **Member A (UI/UX & Frontend):**  
  Owns `src/app/`, `src/components/`, and consumes Server Actions & types from B.
- **Member B (Core Engine & Backend):**  
  Owns `prisma/schema.prisma`, `src/features/capacity/`, `src/features/orders/actions.ts`, and `src/features/orders/queries.ts`.
- **Member C (Simulation & AI - Milestone 3):**  
  Will build what-if scenario overrides and AI explanations consuming `CapacityEngineResult`.

---

## 🏁 Quickstart & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your PostgreSQL `DATABASE_URL` (e.g. Supabase or Neon).

### 3. Generate Prisma Client & Run Migrations
```bash
npm run db:generate
npm run db:migrate --name init
```

### 4. Seed Development Data
```bash
npm run db:seed
```
Copy the generated `DEV_BUSINESS_ID` into your `.env.local` file.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
