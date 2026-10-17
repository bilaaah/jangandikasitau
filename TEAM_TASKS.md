# 👥 PANDUAN KERJA TIM — BIZCAPACITY

> **Produk:** BizCapacity — *Know Your Capacity Before You Promise*  
> **Tipe:** Decision Support System (DSS) untuk UMKM Make-to-Order  
> **Status Proyek:** Fondasi Arsitektur & Shared Contract Selesai (Siap Kolaborasi di GitHub)

Dokumen ini adalah panduan pembagian tugas resmi untuk tim pengembang BizCapacity. Semua anggota tim wajib membaca dokumen ini sebelum mulai menulis kode.

---

## 🧭 Struktur Peran Tim

| Anggota | Peran Utama | Fokus File & Modul |
|---|---|---|
| **Anggota 1 (Ketua / Lead)** | **Project Lead & Frontend / UX** | `src/app/`, `src/components/`, alur navigasi & form UI |
| **Anggota 2** | **Backend & Core Capacity Engine** | `prisma/`, `src/features/capacity/`, `src/features/orders/`, `src/features/resources/` |
| **Anggota 3** | **AI Integration & DSS Simulation** | `src/features/ai/`, `src/features/simulation/`, prompt engineering LLM |

---

## 📌 Aturan Emas Kolaborasi (Wajib Dipatuhi)

1. **JANGAN UBAH [`src/features/capacity/types.ts`](file:///d:/jangandikasihtau/src/features/capacity/types.ts) SECARA SEPIHAK!**  
   File ini adalah **kontrak tipe bersama** yang dipakai oleh Frontend, Backend, dan AI. Perubahan pada file ini akan menyebabkan error di kode anggota lain. Jika ada tipe yang perlu ditambah/diubah, harus dibahas dan disetujui bersama di grup.
2. **STRATEGI BRANCH GIT:**
   - Branch `main`: Branch rilis/produksi yang stabil.
   - Branch `dev`: Branch integrasi bersama.
   - Setiap anggota membuat branch fitur sendiri dari `dev`:
     - Anggota 1: `feature/ui-order-form`
     - Anggota 2: `feature/db-capacity-engine`
     - Anggota 3: `feature/ai-dss-simulation`
3. **FILE RAHASIA:**  
   File `.env.local` **JANGAN PERNAH DI-PUSH KE GITHUB**. Hanya `.env.example` yang boleh di-commit.

---

## 📋 Checklist Tugas Masing-Masing Anggota

### 👑 ANGGOTA 1 (Ketua / Frontend & UX Lead)

**Tanggung Jawab:** Memimpin arsitektur aplikasi, memastikan tampilan antarmuka interaktif, estetis, responsif, dan mudah dipahami oleh pemilik UMKM.

- [ ] **Langkah Awal (Push ke GitHub):**
  1. Inisialisasi git lokal: `git init`
  2. Tambahkan semua file: `git add .`
  3. Commit pertama: `git commit -m "feat: initial architecture, contracts, and scaffolding"`
  4. Hubungkan remote repository GitHub dan push ke branch `main` / `dev`.
- [ ] **Tugas Pengembangan:**
  - [ ] **Desain & Form Pesanan (`src/app/orders/new/`):**
    - Sempurnakan pengalaman input pesanan (`NewOrderForm.tsx`), tambahkan validasi visual yang ramah pengguna.
    - Uji coba tombol *"Run Live DSS Test"* untuk memastikan preview hasil kalkulasi muncul mulus.
  - [ ] **Visualisasi Dashboard & Detail Pesanan (`src/app/orders/[id]/`):**
    - Perbagus kartu visualisasi kapasitas di `FeasibilityCard.tsx` (progress bar jam kerja, status utilisasi mesin, dan daftar defisit material).
    - Pastikan badge status (`FEASIBLE`, `AT_RISK`, `NOT_FEASIBLE`) terlihat kontras dan jelas maknanya.
  - [ ] **Landing Page (`src/app/page.tsx`):**
    - Poles tampilan landing page agar memberikan impresi juri yang profesional (jelaskan keunggulan DSS dibanding spreadsheet biasa).
  - [ ] **Integrasi Review PR:**
    - Mereview dan melakukan *merge* Pull Request (PR) dari Anggota 2 dan Anggota 3 ke branch `dev`.

---

### ⚙️ ANGGOTA 2 (Backend & Core Capacity Engine)

**Tanggung Jawab:** Database PostgreSQL, migrasi data, perhitungan matematis kapasitas (deterministic pure logic), dan Server Actions.

- [ ] **Langkah Awal (Clone & Setup):**
  1. Clone repository dari GitHub: `git clone <url-repo>`
  2. Masuk folder dan jalankan: `npm install`
  3. Buat file `.env.local` dari `.env.example`:
     - Isi `DATABASE_URL` dengan database PostgreSQL (bisa menggunakan cloud gratis seperti [Neon.tech](https://neon.tech) atau [Supabase](https://supabase.com)).
  4. Jalankan migrasi skema Prisma:
     ```bash
     npx prisma migrate dev --name init
     ```
  5. Jalankan seed data contoh bisnis UMKM:
     ```bash
     npm run db:seed
     ```
  6. Salin UUID bisnis yang muncul di terminal ke variabel `DEV_BUSINESS_ID` di file `.env.local`.
- [ ] **Tugas Pengembangan:**
  - [ ] **Evaluasi Formula Engine (`src/features/capacity/engine.ts`):**
    - Cek apakah formula jam kerja (`totalDailyWorkerHours * availableWorkDays`), utilisasi mesin, dan hari kerja (Senin–Jumat) sudah sesuai dengan spesifikasi kasus UMKM Anda.
    - Pastikan fungsi tetap berupa *pure function* (tidak melakukan query DB langsung di dalam file `engine.ts`).
  - [ ] **Queries & Komitmen Aktif (`src/features/orders/queries.ts`):**
    - Pastikan fungsi `getActiveCommitments()` menghitung pesanan berstatus `CONFIRMED` dan `IN_PROGRESS` secara akurat agar tidak terjadi *double booking* kapasitas.
  - [ ] **Server Actions (`src/features/orders/actions.ts`):**
    - Pastikan transaksi penyimpanan `createOrder` menyimpan data ke tabel `orders`, `order_items`, `capacity_analyses`, dan `bottlenecks` dengan tepat.

---

### 🤖 ANGGOTA 3 (AI Integration & DSS Simulation — Milestone 3)

**Tanggung Jawab:** Menerjemahkan output kalkulasi teknis engine menjadi saran bisnis bernilai tinggi dengan AI (LLM), serta membangun skenario simulasi *What-If*.

- [ ] **Langkah Awal (Clone & Setup):**
  1. Clone repository dari GitHub dan jalankan `npm install`.
  2. Minta salinan string koneksi database development dan `DEV_BUSINESS_ID` ke Anggota 2/1.
  3. Dapatkan API Key LLM (disarankan **Google Gemini API** via Google AI Studio / Gemini 1.5/2.0 Flash yang cepat dan hemat kuota).
  4. Tambahkan `GEMINI_API_KEY="AIzaSy..."` di file `.env.local`.
- [ ] **Tugas Pengembangan:**
  - [ ] **Modul Rekomendasi AI (`src/features/ai/`):**
    - Buat modul Server Action / Route Handler yang menerima payload `CapacityEngineResult` (dari `src/features/capacity/types.ts`).
    - Buat prompt engineering terstruktur:
      - *Konteks:* "Anda adalah asisten konsultan operasional UMKM."
      - *Input:* Status kelayakan, utilisasi jam pekerja, mesin, defisit bahan baku, dan sisa hari kerja.
      - *Output:* Bahasa manusia yang solutif (Contoh: *"Pesanan ini kekurangan 10 kg tepung dan kelebihan jam kerja 4 jam. Saran: Beli tepung sebelum hari Kamis dan jadwalkan lembur 1 jam selama 4 hari."*).
    - Tampilkan hasil rekomendasi AI ini di halaman detail pesanan (`/orders/[id]`).
  - [ ] **Modul Simulasi What-If (`src/features/simulation/`):**
    - Buat fungsi yang memungkinkan pemilik bisnis menguji skenario hipotetis sebelum menerima pesanan:
      - *Skenario A:* "Bagaimana jika menambah 1 pekerja lepas (freelance)?"
      - *Skenario B:* "Bagaimana jika tanggal kirim dinegosiasikan mundur 3 hari?"
    - Jalankan ulang fungsi `runCapacityEngine()` dengan data modifikasi tanpa menyimpannya ke database riil.

---

## 🛠️ Perintah Berguna Sehari-hari

```bash
# Menjalankan development server lokal (http://localhost:3000)
npm run dev

# Memeriksa ada/tidaknya kesalahan tipe TypeScript di seluruh proyek
npx tsc --noEmit

# Membuka Prisma Studio (GUI database berbasis web di browser)
npm run db:studio

# Menghasilkan ulang Prisma Client setelah ada perubahan schema.prisma
npm run db:generate

# Mengisi ulang data demo awal
npm run db:seed
```

---

*Disiapkan untuk Tim BizCapacity. Semangat berkolaborasi dan sukses di kompetisi!* 🚀
