# Bill Splitter & Debt Tracker PWA

Aplikasi pencatat keuangan dan patungan (*split bill*) modern yang dirancang dengan pendekatan *offline-first*. Aplikasi ini mengintegrasikan pelacakan utang satu-lawan-satu (*one-to-one debt*) dan patungan kelompok (*multi-group split bill*) ke dalam satu model *ledger* yang efisien dan konsisten.

## 🚀 Fitur Utama

- **Unified Ledger System:** Mengelola utang pribadi maupun patungan kelompok dalam satu logika database yang sama (utang biasa dianggap sebagai *split bill* dengan satu partisipan).
- **Offline-First Capabilities:** Pengguna tetap dapat mencatat transaksi meskipun sedang tidak ada koneksi internet (misalnya di basement atau area minim sinyal). Data akan disinkronkan otomatis saat kembali *online*.
- **Multi-Group Ready:** Arsitektur database yang sudah mendukung skalabilitas multi-grup sejak awal untuk menghindari migrasi data yang rumit di masa depan.
- **Settle Up Tracking:** Pemisahan yang jelas antara histori transaksi belanja (*expenses*) dan transaksi pelunasan (*payments*).

---

## 🛠️ Tech Stack

### Frontend & PWA Layer
- **Core Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Cepat, ringan, dan modern)
- **PWA Builder:** [@vite-pwa/plugin](https://vite-pwa-org.netlify.app/) dengan Workbox untuk manajemen *Service Worker* dan *caching* otomatis aset statis.
- **Client-Side Database:** [Dexie.js](https://dexie.org/) (Wrapper berbasis IndexedDB) untuk penyimpanan data transaksional yang aman dan persisten di sisi browser saat *offline*.
- **Server State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest) untuk *caching* data dari API dan otomatisasi sinkronisasi ulang saat jaringan terhubung kembali.

### Backend & API Layer
- **Runtime Environment:** [Node.js](https://nodejs.org/) dengan **TypeScript** untuk menjaga tipe data yang konsisten dari backend hingga frontend.
- **Web Framework:** Express.js / Fastify.
- **Architecture Style:** **Vertical Slice Architecture** — Struktur folder diorganisasikan berdasarkan fitur/kapabilitas bisnis (bukan berdasarkan lapisan teknis seperti controller/service terpisah) untuk meningkatkan modularitas dan kemudahan *maintenance*.

### Database & Storage
- **Database Utama:** [PostgreSQL](https://www.postgresql.org/) — Dipilih karena ketangguhannya dalam menangani skema data relasional kompleks dan performa tinggi untuk *query* agregasi saldo antar-pengguna.

---

## 🗒️ Keputusan Desain yang Sudah Final
Topik |	Keputusan
--- | ---
Auth	| Email + password (Google OAuth bisa ditambah nanti)
Join grup	| Kode publik, host bisa toggle perlu approval
Role grup	| host dan member
Arsip grup |	Skip untuk MVP
Notifikasi |	In-app only (no push notification)
Urutan timeline |	Berdasarkan expenseDate, grouped per hari
Payment |	PR-style: 1 payment per 1 ExpenseShare
Reject & resubmit |	Payment lama tetap rejected, buat Payment baru
Integrasi pembayaran |	Tidak ada — pakai app luar, cukup klaim manual
