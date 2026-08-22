# Direktori Library (`lib`)

Direktori ini berisi modul pembantu (Helper / Utilities) yang menunjang aplikasi, namun tidak terkait langsung dengan merender antarmuka (UI). Logika-logika murni TypeScript biasanya disimpan di sini.

## Daftar File dan Fungsinya
- **`api.ts`**: Merupakan instansiasi library **Axios** secara terpusat (Centralized API Client). 
  - **Fungsi Utama**: Bertugas menengahi semua komunikasi HTTP dari Frontend ke Backend.
  - **Alur Kerja Interceptor**:
    1. **Request Interceptor**: Sebelum request dikirim, ia secara otomatis mengambil Token JWT dari `localStorage` dan menyisipkannya pada Header `Authorization: Bearer <token>`.
    2. **Response Interceptor**: Saat respons kembali, jika Backend mengirimkan status error HTTP `401 Unauthorized` (artinya token kedaluwarsa atau tidak valid), Axios akan otomatis menendang pengguna ke halaman `/login` dan menghapus token lama, mencegah kebocoran keamanan.
  - **Manfaat**: Halaman (Pages) tidak perlu lagi repot mengatur *Header* secara berulang-ulang setiap kali melakukan operasi *fetch*. Cukup gunakan `api.get()`, `api.post()`, dst.
