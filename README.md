# BizCapacity 🏭

> **Tagline:** *Sistem Keputusan Kapasitas UMKM*
> **Tipe Produk:** Decision Support System (DSS) untuk UMKM berbasis Make-to-Order

BizCapacity membantu bisnis manufaktur dan make-to-order mengevaluasi pesanan pelanggan terhadap jam kerja aktif, kapasitas mesin, stok bahan baku, dan deadline pengiriman — sebelum konfirmasi diberikan.

---

## 🎯 Visi Produk

UMKM seringkali menerima pesanan tanpa mengetahui apakah kapasitas produksi mereka mampu memenuhinya. BizCapacity hadir sebagai sistem pendukung keputusan yang memberikan jawaban berbasis data: **FEASIBLE**, **AT_RISK**, atau **NOT_FEASIBLE** — secara real-time.

---

## 🚀 Fitur Utama

### 1. Mesin Kapasitas Deterministik
- Kalkulasi matematis murni tanpa database I/O di dalam engine
- Evaluasi jam kerja pooled, jam mesin, stok bahan baku, dan hari kerja (Senin–Jumat)
- Output: gap resource dan persentase utilisasi

### 2. Vonis Kelayakan (Feasibility Verdict)

| Vonis | Kondisi |
|-------|---------|
| ✅ **FEASIBLE** | Semua constraint terpenuhi dalam safety margin |
| ⚠️ **AT_RISK** | Hard constraint terpenuhi, tapi utilisasi >85% atau buffer ≤1 hari kerja |
| ❌ **NOT_FEASIBLE** | Defisit material, jam kerja/mesin tidak cukup, atau deadline tidak realistis |

### 3. Simulasi DSS Interaktif (`/simulations`)
- Pemilik UMKM bisa mensimulasikan kuantitas pesanan & tanggal pengiriman secara real-time *sebelum* membuat order
- Didukung rekomendasi AI (Milestone 3)

### 4. Manajemen Order & Log Bottleneck (`/orders`)
- Lifecycle: `DRAFT` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`
- Hanya order `CONFIRMED` dan `IN_PROGRESS` yang mengkonsumsi kapasitas terpooling
- Pembuatan order menyimpan snapshot analisis secara atomik; saat diterima, kapasitas dicek ulang dan dikunci lewat status `CONFIRMED`. Pembatalan melepas komitmen kapasitas.

### 5. Dashboard Analytics (`/dashboard`)
- Ringkasan utilisasi kapasitas real-time
- Grafik trend pesanan dan produksi
- KPI cards: Total Order, Pendapatan, Utilisasi Mesin, dll.

### 6. Perencanaan Produksi (`/production-planning`)
- Penjadwalan kapasitas untuk order-order mendatang
- Deteksi konflik kapasitas antar order

### 7. Data Produk & Sumber Daya (`/products`, `/resources`)
- CRUD produk beserta BOM yang tersimpan dan divalidasi terhadap bahan aktif milik usaha.
- CRUD snapshot stok bahan baku dengan penanda keterbaruan (terkini, perlu diperbarui, atau usang).
- CRUD pekerja dan mesin; data yang dinonaktifkan tetap disimpan untuk menjaga riwayat.

---

## 🛠️ Technology Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Framework** | Next.js 16 (App Router + Server Actions) |
| **Bahasa** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **Database ORM** | Prisma 6 + PostgreSQL |
| **Validasi Schema** | Zod |
| **AI/ML** | Vercel AI SDK (Google Gemini) |
| **Auth** | Auth.js v5 Credentials + JWT Session |

---

## 📁 Struktur Proyek

```
src/
├── app/                     # Next.js App Router (pages & layouts)
│   ├── page.tsx             # Landing page (public)
│   ├── dashboard/           # Dashboard analytics
│   ├── orders/              # Manajemen order (list, new, detail)
│   ├── simulations/         # Simulasi kapasitas DSS
│   ├── production-planning/ # Perencanaan produksi
│   ├── products/            # Manajemen produk
│   ├── resources/           # Manajemen sumber daya (mesin, pekerja)
│   ├── analytics/           # Analytics lanjutan
│   ├── settings/            # Pengaturan bisnis
│   ├── login/               # Halaman login
│   └── register/            # Halaman registrasi
│
├── components/              # React Components (reusable)
│   ├── brand/               # BrandLogo, branding elements
│   ├── layout/              # AppHeader, AppSidebar, DashboardShell
│   ├── ai/                  # AI chat & recommendation components
│   ├── analytics/           # Chart & analytics components
│   ├── feasibility/         # FeasibilityCard, FeasibilityBadge
│   ├── orders/              # Order-related components
│   ├── planning/            # Production planning components
│   ├── products/            # Product components
│   └── settings/            # Settings form components
│
├── actions/                 # Server Actions (Next.js)
│   ├── order.actions.ts     # CRUD order
│   ├── simulation.actions.ts# Kalkulasi simulasi
│   └── ai.actions.ts        # AI recommendations
│
├── engine/                  # Business Logic (Pure Functions, tanpa DB)
│   └── capacity/
│       ├── calculator.ts    # Mesin kapasitas deterministik
│       └── types.ts         # Types untuk engine
│
├── ai/                      # AI/ML Integration
│   └── gemini.ts            # Google Gemini integration
│
├── queries/                 # Database Queries (Prisma)
├── schemas/                 # Zod Schemas (validasi input)
├── types/                   # TypeScript types global
└── lib/                     # Utilities (db.ts, utils.ts)
```

---

## 👥 Tim & Pembagian Tugas

Lihat detail di [`TEAM_TASKS.md`](TEAM_TASKS.md) dan [`ALUR_KOLABORASI_GIT.md`](ALUR_KOLABORASI_GIT.md).

### Ringkasan Tugas Per Role:

**🎨 Frontend (UI/UX)**
- Owns: `src/app/`, `src/components/`
- Konsumsi: Server Actions dari `src/actions/`, Types dari `src/types/`
- Jangan ubah: `src/engine/`, `src/ai/`, `src/queries/`

**⚙️ Backend (Core Engine & Database)**
- Owns: `prisma/schema.prisma`, `src/engine/`, `src/actions/` (non-AI), `src/queries/`, `src/schemas/`
- Jangan ubah: `src/app/`, `src/components/`
- API Contract: Semua perubahan di `src/types/index.ts` harus dikoordinasikan dengan Frontend

**🤖 AI Engineer**
- Owns: `src/ai/`, `src/actions/ai.actions.ts`
- Konsumsi: Output dari `src/engine/capacity/calculator.ts` (tipe `CapacityEngineResult`)
- Input ke Frontend: `src/components/ai/` components untuk chat & rekomendasi

**🧪 QA**
- Test entry points: `src/engine/capacity/calculator.ts` (unit test), Server Actions (integration), `/simulations` page (E2E)
- Coverage target: engine 100%, actions 80%

---

## 🏁 Setup & Menjalankan Lokal

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd bizcapacity
npm install
```

### 2. Environment Variables
Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi variabel berikut:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="generate-a-unique-random-secret"
GOOGLE_GEMINI_API_KEY="your-gemini-key"
```

### 3. Setup Database
```bash
npm run db:generate    # Generate Prisma Client
npm run db:migrate -- --name init # Buat/jalankan migrasi awal
npm run db:seed        # Seed data awal
```
Seed membuat atau memperbarui data demo Sweet Delights Bakery, tiga produk
beserta BOM, pekerja, mesin, bahan baku, akun Owner dan Staff, serta empat
pesanan contoh tanpa menghapus data usaha atau pesanan lain. Pesanan Budi
Wedding disimpan sebagai `CANCELLED` agar tidak lagi mengunci kapasitas; order
`Demo What-if` tetap menjadi draf untuk pengujian simulasi. Akun demo:
`owner@sweetdelights.dev` dan `staff@sweetdelights.dev`. Saat akun baru dibuat,
kata sandi acak dicetak di terminal; seed tidak mengubah kata sandi akun yang
sudah ada.

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000). Masuk melalui
[http://localhost:3000/login](http://localhost:3000/login).

> ⚠️ Jangan jalankan `npm run db:studio` bersamaan dengan `npm run dev` di mesin dengan RAM 8GB.

---

## 🌿 Git Workflow

| Branch | Fungsi |
|--------|--------|
| `main` | Production-ready, deploy otomatis |
| `dev` | Integration branch, semua fitur merge ke sini dulu |
| `feat/*` | Feature branch per fitur/task |
| `fix/*` | Bug fix branch |

**Alur kerja:**
```
feat/nama-fitur → dev → (PR & review) → main
```

Lihat detail di [`ALUR_KOLABORASI_GIT.md`](ALUR_KOLABORASI_GIT.md).

---

## 📐 Arsitektur Frontend

### Layout System
- **`DashboardShell`**: Wrapper utama semua halaman authenticated. Berisi `AppSidebar` + `AppHeader`.
- **`AppSidebar`**: Navigasi sidebar dengan `z-[70]` untuk mobile drawer. Backdrop di `z-[60]`.
- **`AppHeader`**: Header dengan user profile, notifikasi, dan breadcrumb. Responsive di mobile.

### Responsive Design
- Mobile-first dengan Tailwind CSS breakpoints (`sm:`, `md:`, `lg:`)
- Mobile: hamburger menu + sidebar drawer overlay
- Desktop: sidebar permanen di sisi kiri

### Branding
- Logo: `public/logo.png` (juga `src/app/icon.png` untuk favicon App Router)
- Komponen: `src/components/brand/BrandLogo.tsx`
- Tagline: *"Sistem Keputusan Kapasitas UMKM"*

---

## 🔌 API Contract (Frontend ↔ Backend)

### Server Actions yang dikonsumsi Frontend:
```typescript
// src/actions/order.actions.ts
getOrders(): Promise<Order[]>
createOrder(data: CreateOrderInput): Promise<Order>
updateOrderStatus(id: string, status: OrderStatus): Promise<Order>

// src/actions/simulation.actions.ts
runSimulation(input: SimulationInput): Promise<SimulationResult>

// src/actions/ai.actions.ts
getAIRecommendation(context: CapacityEngineResult): Promise<string>
```

### Types yang harus konsisten (`src/types/index.ts`):
```typescript
type FeasibilityVerdict = 'FEASIBLE' | 'AT_RISK' | 'NOT_FEASIBLE'
type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
```

---

## 📊 Status Pengembangan

| Milestone | PIC | Status | Deskripsi |
|-----------|-----|--------|-----------|
| Frontend UI & Dashboard | Frontend | 🔄 In Progress | Responsive UI, semua halaman, branding |
| Core Engine & Backend | Backend | 📋 Planned | Capacity calculator, database, server actions |
| AI Integration | AI Engineer | 📋 Planned | Gemini recommendations & advisory |
| QA & Testing | QA | 📋 Planned | Unit + integration + E2E tests |

---

## 📄 Lisensi

MIT License — Tim Jangan Dikasih Tau © 2026
