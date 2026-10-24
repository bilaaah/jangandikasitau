# 🌿 PANDUAN STRATEGI BRANCH & ALUR KERJASAMA GIT TIM BIZCAPACITY

> **Tujuan:** Mencegah kode bentrok (*merge conflict*), saling mengecek pekerjaan (*peer code review*), dan menjaga branch `main` tetap bersih serta siap dinilai kapan saja.

---

## 🌳 1. Konsep Struktur Branch

Kita menggunakan strategi industri standar yang sangat cocok untuk tim 3 orang:

```
[ main ]          ← KODE FINAL / STABIL (Hanya menerima merge dari 'dev')
   ↑
[ dev ]           ← RUANG INTEGRASI & SALING CEK (Tempat kumpul semua fitur)
   ├── feature/frontend-orders    (Anggota 1: Ketua / UI / UX)
   ├── feature/backend-engine     (Anggota 2: Database & Core Capacity Engine)
   └── feature/ai-simulation      (Anggota 3: AI Gemini & What-If Simulation)
```

### Penjelasan Fungsi Masing-Masing Branch:
1. **`main` (Production / Submission):**
   - Jangan pernah melakukan *commit* langsung ke sini.
   - Kode di sini adalah versi yang **100% jalan, tidak ada bug, dan siap didemokan ke juri kompetisi**.
2. **`dev` (Development / Integration):**
   - Ini adalah **cabang utama kerja tim**.
   - Semua branch fitur (`feature/...`) akan bermuara dan di-merge ke sini.
   - Di sini kalian bertiga saling cek hasil kerja teman sebelum dinaikkan ke `main`.
3. **`feature/...` (Fitur Mandiri Tiap Anggota):**
   - Dibuat dari cabang `dev`.
   - Tempat setiap anggota bebas bereksplorasi tanpa takut merusak pekerjaan anggota lain.

---

## 🚀 2. Langkah Awal: Setup Branch `dev` & Push Pertama (Dilakukan Ketua / Anggota 1)

Saat pertama kali mengunggah fondasi arsitektur ini ke GitHub:

```bash
# 1. Inisialisasi Git
git init

# 2. Tambahkan semua file yang sudah disiapkan
git add .

# 3. Lakukan commit fondasi awal
git commit -m "feat: initial architecture, contracts, and scaffolding"

# 4. Buat branch 'main'
git branch -M main

# 5. Hubungkan ke GitHub repository
git remote add origin https://github.com/bilaaah/jangandikasitau.git

# 6. Push branch 'main' ke GitHub
git push -u origin main

# 7. Buat branch 'dev' dari 'main' dan push ke GitHub
git checkout -b dev
git push -u origin dev
```
> ✅ **Setelah langkah ini selesai:** Di GitHub sudah ada 2 branch: `main` dan `dev`. Rekan tim Anda selanjutnya akan selalu mulai dari branch `dev`.

---

## 👥 3. Alur Kerja Harian Anggota Tim (Step-by-Step)

### 📥 Langkah A: Rekan Tim (Anggota 2 & 3) Mengambil Kode Pertama Kali
Saat Anggota 2 atau 3 baru clone repository ke laptop mereka:

```bash
# 1. Clone repository
git clone https://github.com/bilaaah/jangandikasitau.git

# 2. Masuk ke folder
cd jangandikasitau

# 3. Pindah ke branch 'dev'
git checkout dev

# 4. Install dependensi
npm install

# 5. Buat .env.local dari .env.example
cp .env.example .env.local
```

---

### 🔨 Langkah B: Mulai Mengerjakan Tugas (Bikin Branch Sendiri)
**PENTING:** Setiap kali mau mulai ngoding, pastikan buat branch fitur baru yang dicabangkan dari `dev`:

- **Anggota 1 (Ketua / Frontend)** — folder: `src/app/`, `src/components/`
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/frontend-orders
  ```

- **Anggota 2 (Backend)** — folder: `prisma/`, `src/actions/`, `src/queries/`, `src/schemas/`, `src/engine/`
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/backend-engine
  ```

- **Anggota 3 (AI & Simulasi)** — folder: `src/ai/`, `src/actions/ai.actions.ts`, `src/engine/simulation/`
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/ai-simulation
  ```

Kontrak bersama `src/engine/types.ts` hanya diubah lewat PR yang direview ketiga anggota. Detail folder: [`src/ARCHITECTURE.md`](src/ARCHITECTURE.md).

---

### 💾 Langkah C: Simpan & Push Pekerjaan ke GitHub
Setelah selesai ngoding atau di akhir hari kerja:

```bash
# 1. Cek file apa saja yang diubah
git status

# 2. Tambahkan file yang diubah
git add .

# 3. Buat commit dengan pesan yang jelas
git commit -m "feat: implement real-time order feasibility preview"

# 4. Push branch fitur Anda ke GitHub
git push -u origin feature/nama-branch-anda
```

---

## 🔍 4. Alur "Saling Cek" via GitHub Pull Request (PR)

Inilah inti dari kerjasama tim yang profesional:

```
[ Anggota selesai buat fitur di branch ]
               ↓
[ Buka GitHub → Klik "Compare & pull request" ]
               ↓
[ Pilih Base: dev ← Compare: feature/nama-branch ]
               ↓
[ Anggota lain membuka PR di GitHub, membaca kode (Files changed), & tes lokal ]
               ↓
[ Klik "Approve" & "Merge pull request" ke branch dev ]
```

### Cara Saling Cek di GitHub:
1. Setelah push branch fitur, buka repository [https://github.com/bilaaah/jangandikasitau](https://github.com/bilaaah/jangandikasitau).
2. Akan muncul tombol kuning: **"Compare & pull request"**. Klik tombol itu.
3. **Pastikan tujuannya (`base`):**
   - `base: dev` ⬅️ `compare: feature/nama-branch-anda` *(Bukan ke main!)*
4. Beri judul dan deskripsi singkat tentang apa yang baru dibuat atau diubah.
5. Di bagian kanan, pilih anggota lain sebagai **Reviewer**.
6. **Anggota yang mereview:**
   - Buka tab **"Files changed"** di GitHub.
   - Lihat baris hijau (penambahan) dan merah (pengurangan).
   - Jika ada yang aneh, bisa berikan komentar di baris tersebut.
   - Jika aman, klik **Review changes** &rarr; **Approve**.
7. Klik **"Merge pull request"**. Sekarang kode fitur tersebut sudah resmi masuk ke `dev`!

---

## 🔄 5. Menjaga Kode Lokal Tetap Paling Baru (*Syncing*)

Setelah ada fitur teman yang di-merge ke `dev`, Anda harus memperbarui branch lokal Anda agar tidak ketinggalan:

```bash
# 1. Pindah ke dev dan ambil kode terbaru
git checkout dev
git pull origin dev

# 2. Pindah kembali ke branch fitur Anda dan gabungkan update dari dev
git checkout feature/nama-branch-anda
git merge dev
```

---

## 🏆 6. Kapan Naik ke `main`?

Branch `main` diperbarui **hanya pada saat tonggak pencapaian (milestone)**:
1. Saat Milestone 1 (Frontend + Backend terhubung dan lolos tes):
   - Buat PR dari `dev` ke `main`.
   - Semua anggota tim bersama-sama menyetujui.
   - Merge `dev` ke `main`.
2. Saat Milestone 3 (AI & Simulasi selesai dan siap didemokan ke juri):
   - Buat PR lagi dari `dev` ke `main`.

Dengan cara ini, branch `main` Anda dijamin tidak pernah error atau rusak di tengah jalan! 🚀
