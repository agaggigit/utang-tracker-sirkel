# Direktori Komponen (`components`)

Direktori ini berfungsi sebagai tempat penyimpanan "batu bata" bangunan UI (Reusable UI Components). Semua elemen dasar UI yang digunakan berulang kali di berbagai halaman diletakkan di sini. Tujuannya adalah agar antarmuka konsisten dan mempermudah perubahan (jika butuh mengubah style tombol, cukup ubah satu file saja).

## Daftar File dan Fungsinya

- **`Button.tsx`**: Komponen tombol standar. Mendukung variasi seperti tipe `outline` (tanpa background, hanya border), `fullWidth` (lebar penuh), dan status `disabled` saat loading untuk mencegah klik ganda.
- **`Input.tsx`**: Komponen form input standar, sudah memiliki styling untuk label, border, dan *state* fokus (focus ring) yang konsisten.
- **`Switch.tsx`**: Komponen *toggle switch* mirip desain iOS/Android untuk pengaturan *boolean* (misal: aktifkan persetujuan gabung grup).
- **`ProtectedRoute.tsx`**: Komponen *wrapper* rute untuk keamanan. Jika user belum login (tidak punya token JWT yang valid), komponen ini akan mencegat navigasi dan membuang pengguna kembali ke halaman `/login`.

---

## Aturan Komponen Tambahan (Terbaru)

1. **Dumb Components**: Sebisa mungkin jangan letakkan logika pengambilan data API secara langsung di sini (jangan menggunakan `useQuery` atau `useMutation` di dalam level komponen murni).
2. **Tailwind CSS**: Desain warna mengandalkan format RGB dengan variabel (misal `rgb(var(--color-primary))`). Hindari penggunaan warna *hard-coded* HEX.