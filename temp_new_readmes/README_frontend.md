# Talangin - Frontend

Ini adalah repositori Frontend untuk aplikasi **Talangin** (PWA Bill Splitter & Debt Tracker). Aplikasi ini dibangun dengan menggunakan React, TypeScript, dan Vite. 

Tampilan antarmuka ini dirancang untuk mensimulasikan _experience_ aplikasi _Mobile-First_ bergaya perbankan modern yang elegan, minimalis, dan mudah dioperasikan.

## Teknologi Utama

- **Vite**: Sebagai _bundler_ utama, memberikan waktu _build_ dan HMR (*Hot Module Replacement*) yang sangat cepat.
- **React + TypeScript**: Kombinasi untuk penulisan komponen UI dengan kapabilitas pengecekan _type_ secara statis.
- **React Query (`@tanstack/react-query`)**: Digunakan secara ekstensif untuk mengelola status data yang diambil dari server (API), _caching_, sinkronisasi, serta fitur *infinite scrolling*.
- **Tailwind CSS**: Digunakan untuk gaya (styling) komponen secara cepat. Konfigurasi khusus di `tailwind.config.js` memanfaatkan ekstensi warna berbasis variabel CSS `RGB` agar mendukung utilitas `opacity` (`<alpha-value>`).
- **Lucide React**: Sebagai penyedia ikon konsisten dengan gaya desain modern.
- **Vite PWA Plugin**: Menyediakan konfigurasi _manifest_ dan manajemen _Service Worker_ untuk membuat aplikasi ini dapat diinstal (Add to Homescreen) dan mendukung fungsionalitas _offline caching_.

## Arsitektur Folder

Semua penulisan kode berada di dalam folder `src/`. Berikut adalah struktur folder yang menjadi standar repositori ini:

- `src/components/`: Kumpulan blok komponen _Presentational_ yang dapat dipakai ulang (seperti `Button`, `Modal`, `PageHeader`, dll).
- `src/pages/`: Berisi semua Halaman (Views) dari aplikasi. Halaman di sini tidak boleh memiliki logika pengambilan data secara langsung (hindari _Fat Component_).
- `src/hooks/`: Berisi semua _Custom Hooks_ (contoh: `useAuth`, `useExpenses`) yang menangani panggilan `React Query` (`useQuery`, `useMutation`). Logika aplikasi dipusatkan di sini.
- `src/lib/`: Setup pustaka pihak ketiga seperti instansiasi global `axios` (termasuk *interceptor* untuk _Token_ autentikasi) dan `QueryClient`.
- `src/utils/`: Fungsi-fungsi bantuan (seperti `errorHandler` untuk standardisasi format error yang muncul di popup/toast).
- `src/types/`: Definisi Antarmuka (_Interfaces_) TypeScript global (seperti `User`, `Group`, `Expense`, dll).

## Aturan Gaya Penulisan (Styling)

Karena aplikasi memiliki fitur **Dark Mode**, semua penetapan warna yang dikustomisasi di dalam `index.css` diwajibkan menggunakan format tipe data **RGB murni (tanpa embel-embel teks rgb)**:

```css
/* BENAR */
--color-primary: 0 91 170;

/* SALAH */
--color-primary: #005baa;
--color-primary: rgb(0 91 170);
```

Aturan ini dibuat agar Tailwind dapat dengan sukses memanipulasi _alpha value_ (seperti `bg-primary/50`). Jika Anda membutuhkan penetapan `color` atau `backgroundColor` secara inline di atribut HTML / React, wajib untuk membungkus variabel tersebut dengan fungsi rgb, contoh: `color="rgb(var(--color-primary))"`.

## Cara Menjalankan Aplikasi

1. Pastikan Node.js terinstal.
2. Buka folder ini di terminal.
3. Instal semua dependensi:
   ```bash
   npm install
   ```
4. Jalankan _development server_:
   ```bash
   npm run dev
   ```
5. Akses aplikasi di browser melalui tautan `http://localhost:5173`. (Server Backend disarankan sudah berjalan pada saat ini agar fungsionalitas API berjalan lancar).