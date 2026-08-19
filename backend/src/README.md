# Core Source (src)

Direktori `src` ini adalah jantung (*Source Code*) dari Backend aplikasi **Talangin** (Catatan Utang BC). Arsitektur yang digunakan di dalam direktori ini adalah **Vertical Slice Architecture**, yang artinya kode tidak dipisah berdasarkan tipe file (seperti Controllers, Services, Models), melainkan **dipisah berdasarkan Fitur (Domain)**.

## Indeks Modul (Fitur)

Setiap folder di bawah ini mewakili satu fitur utuh dari aplikasi. Kamu bisa masuk ke setiap foldernya untuk membaca dokumentasi detail beserta diagram alur kerjanya (*Data Flow*).

| Direktori Modul | Deskripsi Singkat |
|-----------------|------------------|
| **[`/users`](./users/README.md)** | Fitur autentikasi (Login, Daftar, OAuth Google) dan manajemen Profil. |
| **[`/groups`](./groups/README.md)** | Fitur pembuatan kelompok patungan (Sirkel), validasi kode rahasia masuk grup, hingga rekapan *balance* (saldo) setiap anggotanya. |
| **[`/expenses`](./expenses/README.md)** | Fitur utama pencatatan tagihan pengeluaran dan pemecahannya (*split bill*) ke masing-masing anggota. |
| **[`/payments`](./payments/README.md)** | Fitur pelunasan utang, mulai dari pelaporan transfer uang, hingga persetujuan (konfirmasi) oleh penerima dana. |
| **[`/notifications`](./notifications/README.md)** | Fitur lonceng notifikasi (pesan masuk, tagihan baru, persetujuan gabung grup). |
| **[`/middleware`](./middleware/README.md)** | Fungsi perantara sistem (validasi token JWT, dan pengaman *error* agar aplikasi tidak mati total saat terjadi kesalahan). |

## File Inti (Root Files)

| File | Fungsi |
|------|--------|
| `index.ts` | Titik masuk utama aplikasi (*Entry Point*). Di sinilah *server* Express dinyalakan dan rute-rute (*Endpoints*) dari berbagai modul di atas diregistrasikan/dihubungkan. |
| `db.ts` | Konfigurasi *Connection Pool* ke *Database* (PostgreSQL) menggunakan konektor **Prisma Client**. Modul-modul lain akan meng-import file ini untuk berbicara dengan *Database*. |