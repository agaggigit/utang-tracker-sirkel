# Talangin
**A PWA Bill Splitter & Debt Tracker for Friend Groups**

Aplikasi ini adalah platform pencatatan utang (patungan) yang dirancang khusus untuk sirkel pertemanan yang suka lupa utang satu sama lain. Aplikasi ini dibuat simpel dan minim fitur kompleks, sehingga *user* dapat dengan mudah menavigasinya. Aplikasi ini juga memiliki dukungan *Progressive Web App* (PWA) dan kapabilitas integrasi mode *offline*, menjadikannya sangat andal kapan pun dibutuhkan.

---

## Fitur Utama (Main Features)

- **Sirkel (Group Management):** Fitur untuk membuat dan bergabung dengan kelompok pertemanan/patungan. Undang teman menggunakan kode rahasia unik (beserta fitur *Admin Approval*). Di dalam Sirkel inilah riwayat transaksi akan berlangsung.
- **Chronological Feed:** Riwayat transaksi dibuat mirip *feeds social media* dengan sistem *infinite scroll* (dapat digulir sampai ujung transaksi paling awal), sehingga sangat mudah dan intuitif untuk dipantau.
- **Smart Calculator:** Kamu tidak perlu bolak-balik buka aplikasi kalkulator. Form input nominal mendukung operasi hitung-hitungan langsung (contoh: ketik `50000+15000` di kolom input).
- **Auto-Accumulation:** Informasi penting seperti total utang yang tersisa, total yang sudah dibayar, dan saldo akhir akan langsung diakumulasi. *User* tidak perlu capek menghitung manual.
- **Corporate & Clean UI:** Tampilan bergaya *modern banking* (ala Livin') yang bersih dan elegan, dilengkapi dengan notifikasi halus (*React Hot Toast*) dan popup (*SweetAlert2*).
- **Notification:** Sistem notifikasi terpusat untuk memberitahu jika ada tagihan baru atau jika utang telah dilunasi.
- **Profile:** Profil yang dapat dikustomisasi, terintegrasi dengan Google Login (OAuth).

---

## Tech Stack & Architecture

Aplikasi ini mengadopsi tumpukan teknologi modern untuk skalabilitas dan performa yang optimal:

### Frontend
- **React + TypeScript + Vite**: Pondasi utama yang sangat cepat dengan bantuan *Hot Module Replacement* (HMR).
- **Tailwind CSS**: Framework CSS berbasis utility. Semua warna kustom diatur menggunakan **format RGB dengan sintaks `<alpha-value>`** agar mendukung *opacity modifier* Tailwind (contoh: `bg-primary/50`).
- **React Query (@tanstack/react-query)**: Menangani *server state management*, *caching*, dan sinkronisasi data yang reaktif (seperti *infinite scrolling*).
- **Custom Hooks Architecture**: Semua logika *fetching* API dan mutasi data **wajib dipisahkan** dari komponen UI (Presentational) dan dienkapsulasi di dalam folder `src/hooks`. Tidak boleh ada halaman (*Page*) yang menjadi *Fat Component*.
- **PWA (Progressive Web App)**: Didukung oleh `vite-plugin-pwa` untuk *offline caching*, instalasi *Home Screen*, dan integrasi PWA bawaan browser.

### Backend
- **Node.js + Express**: Framework minimalis namun andal untuk menangani _routing_ dan _middleware_.
- **Prisma ORM**: Menangani relasi *database* secara *type-safe* yang langsung terhubung ke sistem TypeScript.
- **Supabase (PostgreSQL)**: Sebagai layanan *database* utama karena keandalannya dalam menangani skema relasional kompleks (Users, Groups, Expenses, Shares, Payments).
- **Zod**: Validasi skema _payload_ API yang kuat.

---

## Standardisasi Kode (Code Conventions)

> [!IMPORTANT]
> Kontributor yang ingin berpartisipasi diharapkan mematuhi aturan berikut:

1. **Strict Null Checks (TypeScript)**: TypeScript dikonfigurasi sangat ketat. Hindari penggunaan tipe `any`. Gunakan **Optional Chaining (`?.`)** dan **Nullish Coalescing (`??`)** untuk memastikan aplikasi tidak *crash* jika menemukan data *undefined*.
2. **Error Handling Terpusat**: Semua penanganan *error* dari Axios atau sistem **wajib** diproses menggunakan fungsi pembantu `getErrorMessage` yang ada di `frontend/src/utils/errorHandler.ts` agar pesan error tampil seragam.
3. **Pemisahan Logika (Separation of Concerns)**: Komponen UI (React Component) hanya bertugas untuk **merender tampilan**. Logika bisnis, _fetching_, dan pengiriman formulir diserahkan sepenuhnya kepada *Custom Hooks*.

---

## Cara Menjalankan Aplikasi (Development)

Proyek ini terdiri dari dua folder utama: `frontend` dan `backend`. Keduanya harus dijalankan secara paralel.

**Langkah-langkah umum:**
1. _Clone_ repositori ini.
2. Masuk ke direktori `backend`, atur file `.env` (lihat `backend/README.md`), jalankan `npm install`, dan mulai server dengan `npm run dev`.
3. Di terminal terpisah, masuk ke direktori `frontend`, jalankan `npm install`, dan mulai aplikasi dengan `npm run dev`.
