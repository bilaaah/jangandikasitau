# BizCapacity 🏭

> **Tagline:** *Sistem Keputusan Kapasitas UMKM*  
> **Tipe Produk:** Decision Support System (DSS) untuk UMKM berbasis Make-to-Order

BizCapacity membantu bisnis manufaktur dan *make-to-order* mengevaluasi pesanan pelanggan terhadap jam kerja aktif, kapasitas mesin, ketersediaan bahan baku, dan tenggat pengiriman — sebelum komitmen atau konfirmasi pesanan diberikan kepada pelanggan.

---

## 🎯 Visi Produk

Banyak pelaku UMKM manufaktur dan bakery menerima pesanan secara intuitif tanpa mengetahui apakah kapasitas produksi mereka mampu memenuhinya, yang sering berujung pada lembur berbiaya tinggi, keterlambatan pengiriman, atau penolakan pesanan yang sebenarnya menguntungkan. 

BizCapacity hadir sebagai sistem pendukung keputusan (*Decision Support System*) yang memberikan jawaban berbasis data matematis secara real-time: **FEASIBLE**, **AT_RISK**, atau **NOT_FEASIBLE**.

---

## 🚀 Fitur Utama

### 1. Mesin Kapasitas Deterministik (Deterministic Capacity Engine)
- Kalkulasi matematis murni (*pure function*) tanpa I/O database di dalam komputasi engine.
- Evaluasi komprehensif 4 dimensi kapasitas: jam kerja pekerja (*pooled*), kapasitas mesin/oven, ketersediaan stok bahan baku (*Bill of Materials*), dan hari kerja aktif (Senin–Jumat).
- Menghitung utilisasi sumber daya, buffer waktu pengiriman, dan identifikasi *bottleneck* secara presisi.

### 2. Tiga Vonis Kelayakan DSS (Feasibility Verdict)

| Vonis | Kondisi Logika DSS |
|---|---|
| ✅ **FEASIBLE** | Semua batasan (*constraints*) terpenuhi dalam margin aman (utilisasi pekerja & mesin ≤85%, buffer waktu >1 hari kerja, stok bahan mencukupi). |
| ⚠️ **AT_RISK** | Hard constraints terpenuhi, tetapi utilisasi sumber daya tinggi (>85%) atau buffer pengiriman tipis (≤1 hari kerja). |
| ❌ **NOT_FEASIBLE** | Terjadi defisit bahan baku, total jam kerja atau mesin tidak mencukupi, atau tenggat pengiriman tidak realistis. |

### 3. Simulasi Interaktif & Analisis What-If (`/simulations`)
- Pemilik UMKM dan staf dapat menggeser *slider* kuantitas pesanan & tenggat pengiriman secara interaktif untuk melihat perubahan kelayakan secara seketika (*real-time*).
- Menghitung potensi omzet yang terlindungi (*Protected Revenue*).
- Rekomendasi mitigasi cerdas: **Split Delivery** (pengiriman bertahap), negosiasi tenggat, atau opsi *outsource*.
- Fitur salin ringkasan simulasi ke clipboard untuk koordinasi cepat antar-tim.

### 4. Rekomendasi AI Generatif (Google Gemini via Vercel AI SDK)
- Analisis natural language berbasis konteks matematis DSS (bukan sekadar saran umum).
- Menghasilkan naskah negosiasi ramah pelanggan (*customer negotiation script*) dan alternatif solusi taktis.
- Dilengkapi mekanisme pertahanan *Local Fallback Rule-Based* jika kuota API habis atau jaringan bermasalah.

### 5. Manajemen Pesanan & Komitmen Kapasitas Atomik (`/orders`)
- Siklus hidup pesanan: `DRAFT` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
- Hanya pesanan berstatus `CONFIRMED` dan `IN_PROGRESS` yang mengunci kapasitas produksi. Pembatalan (`CANCELLED`) secara atomik melepas kembali kapasitas.
- Antarmuka detail pesanan yang ramah pengguna dengan nomor referensi PO ringkas, ringkasan BOM, dan notifikasi konfirmasi.

### 6. Jadwal & Perencanaan Produksi (`/production-planning`)
- Visualisasi kalender dan Gantt bar per *workstation*.
- Deteksi dini penumpukan jadwal dan indikator peringatan utilisasi (>85%).

### 7. Manajemen Produk, Bahan Baku & Sumber Daya (`/products`, `/resources`)
- CRUD produk beserta komposisi bahan baku (*Bill of Materials* - BOM).
- Snapshot stok bahan baku dengan penanda keterbaruan (*freshness indicator*): Terkini vs Usang (>7 hari).
- Manajemen data pekerja dan mesin operasional dengan status aktif/nonaktif untuk menjaga integritas riwayat.

### 8. Desain Dual Theme & Modern Glassmorphism
- Mendukung penuh **Light Mode** dan **Dark Mode** melalui Tailwind CSS v4.
- Desain modern, bersih, kontras tinggi, dan responsif optimal di perangkat mobile maupun desktop.

---

## 🛠️ Technology Stack

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 16 (App Router + Server Actions) | SSR & Server Actions mutasi data |
| **Bahasa** | TypeScript 5 (Strict Mode) | Kontrak tipe aman antar lapisan |
| **Styling** | Tailwind CSS v4 | Glassmorphism & dual light/dark theme |
| **Database ORM** | Prisma 6 + PostgreSQL (Supabase) | Multi-tenant UMKM context |
| **Validasi Schema** | Zod | Validasi ketat input form & respon AI |
| **AI / LLM** | Google Gemini 2.5 Flash via Vercel AI SDK | Rekomendasi DSS & naskah negosiasi |
| **Autentikasi** | Auth.js v5 (NextAuth) Credentials | Role-Based Access Control (`OWNER`, `STAFF`) |
| **Testing** | Vitest | 41 pengujian unit, skenario, dan integrasi |

---

## 👥 Role-Based Access Control (RBAC) & Akun Demo

Aplikasi mengelompokkan otorisasi ke dalam 2 peran pengguna:

| Peran | Email Demo | Wewenang Utama |
|---|---|---|
| 👑 **OWNER** | `owner@sweetdelights.dev` | Akses penuh: konfirmasi pesanan (`CONFIRMED`), kelola master data (produk, pekerja, mesin, bahan), dan pengaturan bisnis. |
| 🧑‍🍳 **STAFF** | `staff@sweetdelights.dev` | Akses operasional: melihat dashboard, melakukan simulasi kelayakan (*What-If*), melihat status pesanan & jadwal produksi. |

### Skenario Data Demo Resmi: *Sweet Delights Bakery (Demo)*
- **3 Produk Unggulan & BOM:**
  - *Chocolate Brownie Box (24 pcs)*: 2 jam kerja, 1 jam mesin (Flour, Butter, Dark Chocolate, Eggs)
  - *Sourdough Loaf*: 3 jam kerja, 1.5 jam mesin (Flour, Yeast)
  - *Custom Wedding Cake*: 8 jam kerja, 2 jam mesin (Flour, Butter, Eggs)
- **Sumber Daya:** 3 Pekerja (Budi - 8 jam, Rina - 4 jam, Siti - 8 jam) & 2 Mesin (Commercial Oven 1 - 10 jam, Commercial Oven 2 - 8 jam).
- **4 Skenario Pesanan Uji:**
  1. `PT Amanah` (*DRAFT*, 10 Sourdough, tenggat +4 hari kerja)
  2. `PT ibu imut` (*CONFIRMED*, 10 Sourdough, tenggat +14 hari kerja — mengunci kapasitas aktif)
  3. `Budi Wedding (Existing)` (*CANCELLED* — pesanan lampau dibatalkan agar kapasitas jam kerja & mesin bersih)
  4. `Demo What-if` (*DRAFT*, 44 Sourdough, tenggat +8 hari kerja — skenario simulasi batas kapasitas ~82.5% dan uji rekomendasi Split Delivery AI)

---

## 📁 Struktur Proyek

```
src/
├── app/                     # Next.js App Router (pages & layouts)
│   ├── page.tsx             # Landing page (public)
│   ├── dashboard/           # Dashboard analitik & ringkasan utilisasi
│   ├── orders/              # Manajemen pesanan (list, new, [id] detail)
│   ├── simulations/         # Simulasi kapasitas DSS & What-if analysis
│   ├── production-planning/ # Perencanaan produksi & visual jadwal
│   ├── products/            # Manajemen produk & Bill of Materials (BOM)
│   ├── resources/           # Manajemen sumber daya (pekerja, mesin, bahan baku)
│   ├── analytics/           # Analitik mendalam utilisasi & tren
│   ├── settings/            # Pengaturan profil bisnis
│   ├── login/               # Halaman masuk (multi-role)
│   └── register/            # Halaman registrasi usaha baru
│
├── components/              # Komponen antarmuka React
│   ├── brand/               # Komponen logo & identitas BizCapacity
│   ├── layout/              # AppHeader, AppSidebar, DashboardShell, ThemeToggle
│   ├── ai/                  # AI recommendation card & interactive prompt
│   ├── analytics/           # Visualisasi chart & metrik KPI
│   ├── feasibility/         # FeasibilityCard, FeasibilityBadge, detail bottleneck
│   ├── orders/              # Order list, form input pesanan, modal aksi
│   ├── planning/            # ProductionPlanningView & timeline bar
│   ├── simulation/          # SimulationsView, slider kontrol & what-if panel
│   └── products/            # Modal & form produk serta bahan
│
├── actions/                 # Next.js Server Actions (mutasi aman ke DB)
│   ├── order.actions.ts     # CRUD pesanan & komitmen kapasitas atomik
│   ├── simulation.actions.ts# Eksekusi kalkulasi simulasi what-if
│   ├── feasibility.actions.ts # Analisis kelayakan pesanan real-time
│   └── ai.actions.ts        # Generator rekomendasi AI Google Gemini
│
├── engine/                  # Core Business Logic (Pure Math Engine, Tanpa DB)
│   └── capacity/
│       ├── calculator.ts    # Algoritma deterministik 4 dimensi kapasitas
│       ├── types.ts         # Definisi tipe input/output engine
│       └── utils.ts         # Kalkulasi hari kerja (Senin–Jumat) & interval
│
├── ai/                      # Integrasi LLM & Skema AI
│   └── gemini.ts            # Handler Gemini dengan validasi skema Zod & fallback
│
├── queries/                 # Kueri database Prisma teroptimasi
├── schemas/                 # Zod validation schemas
├── types/                   # Definisi tipe global TypeScript
└── lib/                     # Utilitas pendukung (db.ts, auth.ts, utils.ts)
```

---

## 🏁 Panduan Menjalankan Secara Lokal

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd bizcapacity
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Pastikan variabel lingkungan terisi:
```env
DATABASE_URL="postgresql://user:password@host:5432/postgres"
AUTH_SECRET="your-generated-auth-secret-key"
GOOGLE_GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Generate Prisma Client
```bash
npm run db:generate    # Generate Prisma Client
npm run db:migrate:deploy # Terapkan migrasi yang sudah dikomit
npm run db:seed        # Seed data awal
```
Seed membuat atau memperbarui data demo Sweet Delights Bakery, tiga produk
beserta BOM, pekerja, mesin, bahan baku, akun Owner dan Staff, serta empat
pesanan contoh tanpa menghapus data usaha atau pesanan lain. Pesanan Budi
Wedding disimpan sebagai `CANCELLED` agar tidak lagi mengunci kapasitas; order
`Demo What-if` tetap menjadi draf untuk pengujian simulasi. Akun demo:
`owner@sweetdelights.dev` dan `staff@sweetdelights.dev`. Saat akun baru dibuat,
kata sandi acak dicetak di terminal; seed tidak mengubah kata sandi akun yang
sudah ada. Lead time pemasok pada bahan baru dimulai dari 0 hari kerja; isi
nilai sesuai pemasok lewat Data Produksi karena seed tidak menimpa nilai yang
sudah diatur.

Perubahan schema disimpan di `prisma/migrations` dan diterapkan berurutan.
Untuk database bersama yang sudah dibuat sebelum baseline migrasi tersedia,
pastikan schema lama sudah cocok dengan baseline, lalu tandai baseline tersebut
satu kali sebelum menerapkan migrasi berikutnya:

```bash
npx prisma migrate resolve --applied 20261109170000_baseline
npm run db:migrate:deploy
```

Jangan jalankan perintah baseline pada database baru; `db:migrate:deploy`
menerapkan baseline dan migrasi berikutnya secara otomatis.

### 4. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser di **[http://localhost:3000](http://localhost:3000)**.  
Halaman login: **[http://localhost:3000/login](http://localhost:3000/login)**.

---

## 🧪 Pengujian Otomatis (Testing)

Proyek ini dilengkapi rangkaian pengujian unit dan integrasi otomatis menggunakan **Vitest** untuk menjamin akurasi mesin matematis dan keandalan sistem DSS:

```bash
npm test
```

**Cakupan Pengujian (41 Tests Passed):**
- **Engine Capacity Calculator:** Pengujian 100% deterministik untuk skenario *FEASIBLE*, *AT_RISK*, dan *NOT_FEASIBLE*.
- **Constraint Handling:** Validasi defisit bahan baku, batas utilisasi jam kerja pooled (>85%), dan batas jam mesin.
- **Outsource & Split Delivery:** Pengujian logika pemecahan pengiriman bertahap dan toleransi kapasitas.
- **AI Schema & Fallback:** Validasi kepatuhan skema Zod dan uji ketahanan fallback lokal saat API Google Gemini tidak tersedia/gagal jaringan.

---

## 🌿 Alur Kolaborasi Git

| Branch | Fungsi |
|---|---|
| `main` | Branch produksi yang stabil dan siap dipresentasikan. |
| `dev` | Branch integrasi utama tempat seluruh fitur digabungkan dan diuji bersama. |
| `feature/*` | Feature branch mandiri untuk penambahan modul atau fitur baru. |
| `fix/*` | Bug fix branch untuk perbaikan isu spesifik. |

Lihat panduan lengkap di [`ALUR_KOLABORASI_GIT.md`](ALUR_KOLABORASI_GIT.md).

---

## 📊 Status Pengembangan

| Milestone | PIC | Status | Deskripsi |
|---|---|---|---|
| **Frontend UI & UX Dashboard** | Nabilah (Frontend Lead) | ✅ **Selesai** | Seluruh 10 halaman responsif, glassmorphism, dual light/dark mode, real-time feasibility cards, what-if sliders, dan route metadata. |
| **Core Engine & Backend** | Syuja (Backend Lead) | ✅ **Selesai** | Mesin kapasitas deterministik, database Prisma PostgreSQL (Supabase), komitmen kapasitas atomik, dan RBAC (`OWNER`/`STAFF`). |
| **AI Decision Advisory** | AI Engineer | ✅ **Selesai** | Integrasi Google Gemini 2.5 Flash, ekstraksi konteks kapasitas, naskah negosiasi, rekomendasi split delivery, dan local fallback. |
| **QA & DSS Validation** | QA | ✅ **Selesai** | 41 pengujian otomatis Vitest lulus 100%, validasi skenario demo proposal, dan pengujian batas beban kapasitas. |

---

## 📄 Lisensi

MIT License — Tim Jangan Dikasih Tau © 2026
