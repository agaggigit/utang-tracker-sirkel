# Backend Layer

Direktori ini adalah pusat dari seluruh logika server, API, dan basis data (*database*) untuk aplikasi Talangin. Lingkungan eksekusinya menggunakan Node.js dengan kerangka kerja Express.js dan TypeScript.

## Struktur Direktori & File

Berikut adalah fungsi dari masing-masing folder dan file utama yang ada di *root* direktori `backend` ini:

| File / Folder | Fungsi Utama |
|---------------|-------------|
| **`src/`** | Direktori terpenting. Berisi seluruh kode sumber (API, Middleware, Router) yang dibangun dengan *Vertical Slice Architecture*. (Lihat [`src/README.md`](./src/README.md) untuk detailnya). |
| **`prisma/`** | Berisi skema basis data (`schema.prisma`) dan riwayat migrasi struktur tabel. Di sinilah arsitektur *Database* PostgreSQL didefinisikan secara deklaratif menggunakan Prisma ORM. |
| **`node_modules/`** | (Dibuat otomatis) Tempat penyimpanan semua *library* dan dependensi pihak ketiga (seperti `express`, `bcrypt`, `zod`, dll) yang diinstal melalui *npm*. |
| **`package.json`** | Daftar identitas proyek dan dependensi *library* (beserta versi persisnya) yang dibutuhkan oleh *backend* ini. Juga berisi *scripts* untuk menjalankan server (`npm run dev`). |
| **`package-lock.json`** | Catatan versi pasti dari setiap dependensi dan sub-dependensi untuk memastikan lingkungan *backend* identik di semua komputer *developer*. |
| **`prisma.config.ts`** | Konfigurasi tambahan untuk Prisma (jika dibutuhkan untuk menyesuaikan *environment*). |
| **`.env.example`** | *Template* contoh untuk variabel lingkungan (*Environment Variables*). *Developer* baru wajib meng-kopi file ini menjadi `.env` lalu mengisi *key* rahasiaya (seperti `DATABASE_URL` dan `JWT_SECRET`). |

## Cara Menjalankan (Development)

Pastikan kamu sudah berada di dalam folder `backend`, lalu jalankan:

1. **Instal Dependensi:**
   ```bash
   npm install
   ```

2. **Sinkronisasi Database:** (Pastikan `.env` sudah diisi)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Jalankan Server Lokal:**
   ```bash
   npm run dev
   ```
   *Server akan menyala dengan fitur Auto-Restart (menggunakan `tsx watch`) dan siap mendengarkan request dari Frontend.*