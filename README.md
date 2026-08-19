# Talangin
**A PWA Bill Splitter & Debt Tracker for Friend Groups**

Aplikasi ini adalah platform pencatatan utang (patungan) yang dirancang khusus untuk sirkel pertemanan yang suka lupa utang satu sama lain. Aplikasi ini dibuat simpel dan minim fitur kompleks, sehingga *user* dapat dengan mudah menavigasinya. Aplikasi ini juga memiliki dukungan *Progressive Web App* (PWA) dan kapabilitas integrasi mode *offline*, menjadikannya sangat andal kapan pun dibutuhkan.

---

## Main Features

- **Sirkel (Group Management):** Fitur untuk membuat dan bergabung dengan kelompok pertemanan/patungan. Undang teman menggunakan kode rahasia unik (beserta fitur *Admin Approval*). Di dalam Sirkel inilah riwayat transaksi akan berlangsung.
- **Chronological Feed:** Riwayat transaksi dibuat mirip *feeds social media* dengan sistem *infinite scroll* (dapat digulir sampai ujung transaksi paling awal), sehingga sangat mudah dan intuitif untuk dipantau.
- **Smart Calculator:** Kamu tidak perlu bolak-balik buka aplikasi kalkulator. Form input nominal mendukung operasi hitung-hitungan langsung (contoh: ketik `50000+15000` di kolom input).
- **Auto-Accumulation:** Informasi penting seperti total utang yang tersisa, total yang sudah dibayar, dan saldo akhir akan langsung diakumulasi. *User* tidak perlu capek menghitung manual.
- **Corporate & Clean UI:** Tampilan bergaya *modern banking* (ala Livin') yang bersih dan elegan, dilengkapi dengan notifikasi halus (*React Hot Toast*) dan popup (*SweetAlert2*).
- **Notification:** Sistem notifikasi terpusat untuk memberitahu jika ada tagihan baru atau jika utang telah dilunasi.
- **Profile:** Profil yang dapat dikustomisasi, terintegrasi dengan Google Login (OAuth).

---

## Tech Stack

### Frontend & PWA Layer
- **Core Framework:** React 19 + Vite
- **Styling:** Vanilla CSS Variables (untuk kebebasan kustomisasi *theme*) + Lucide React (Icons)
- **PWA Builders:** Vite PWA
- **Client-Side Database:** Dexie.js (untuk kapabilitas *offline*)
- **Server State Management:** TanStack Query (React Query) untuk *caching* data dari API dan sinkronisasi otomatis.
- **UX Enhancements:** React Hot Toast & SweetAlert2 (Notifikasi & Popup)

### Backend & API Layer
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js + TypeScript
- **Architecture Style:** Vertical Slice Architecture
- **Authentication:** JWT (JSON Web Tokens) & Google OAuth
- **Validation:** Zod

### Database & Storage
- **Database Utama:** PostgreSQL
- **ORM:** Prisma

---

## Prerequisites

Sebelum menjalankan proyek ini, pastikan sistem kamu memiliki:
- **Node.js** (versi 18 atau lebih baru)
- **PostgreSQL** (pastikan *service database* berjalan)
- **Git**

---

## How to run for yourself in localhost

### 1. Clone Repositories
```bash
git clone https://github.com/agaggigit/utang-tracker-sirkel.git
cd utang-tracker-sirkel
```

### 2. Setup Backend
Masuk ke folder `backend`, instal dependensi, atur variabel lingkungan (*environment*), dan jalankan *database migration*.
```bash
cd backend
npm install

# Buat file .env berdasarkan .env.example (atau sesuaikan dengan database kamu)
# Isi DATABASE_URL, JWT_SECRET, dll.

# Sinkronkan skema Prisma dengan Database
npx prisma generate
npx prisma db push

# Jalankan server (biasanya akan berjalan di port 3000)
npm run dev
```

### 3. Setup Frontend
Buka terminal baru, masuk ke folder `frontend`, instal dependensi, lalu jalankan.
```bash
cd frontend
npm install

# Jalankan Vite server (biasanya akan berjalan di port 5173)
npm run dev
```

Aplikasi siap diakses melalui `http://localhost:5173` di *browser* kamu!

---

## 🧪 Testing Account & Group

Gunakan akun berikut jika kamu ingin langsung menguji coba tanpa perlu registrasi ulang:

#### Account 1
- **Email:** `test01@test01.com`
- **Password:** `test01@@`

#### Account 2
- **Email:** `test02@test02.com`
- **Password:** `test02@@`

#### Account 3
- **Email:** `test03@test03.com`
- **Password:** `test03@@`

#### Account 4
- **Email:** `test04@test04.com`
- **Password:** `test04@@`

#### Group 1 (Contoh Data)
- **Host:** Login menggunakan Akun Google Pribadi (atau test akun di atas)
- **Name:** Sirkel1NoHostPerm
- **Code:** `07a372cb`

---
*Dibuat dengan penuh dedikasi untuk mengatasi krisis memori di sirkel pertemanan.*
