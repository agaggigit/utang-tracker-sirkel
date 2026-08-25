# Talangin - Backend

Ini adalah repositori Backend untuk aplikasi **Talangin** (PWA Bill Splitter & Debt Tracker). Backend ini dibangun menggunakan arsitektur monolitik yang ringan berbasis `Node.js` dan `Express`.

## Teknologi Utama

- **Express.js**: *Web framework* utama untuk menjalankan rute API RESTful.
- **Prisma ORM**: Sistem Object-Relational Mapping (ORM) yang aman (type-safe) yang dirancang untuk TypeScript. Skema database dijamin konsisten dan memudahkan manipulasi *query*.
- **PostgreSQL (Supabase)**: Skema relasional yang menaungi entitas Pengguna, Grup, Beban Pengeluaran, Pembagian, serta Pembayaran (Konfirmasi Lunas).
- **Zod**: Validasi data yang ketat terhadap objek JSON *payload* yang datang dari request *Frontend* agar mencegah anomali pada database.

## Struktur Database Dasar

Sistem mengadopsi 5 pilar relasi utama:
1. **User**: Menyimpan data autentikasi dan profil (*Google Sign-In ready*).
2. **Group**: Merepresentasikan *Sirkel*. Memiliki kode undangan (*Invite Code*).
3. **GroupMember**: Memetakan koneksi relasi *Many-to-Many* antara Grup dan Pengguna.
4. **Expense**: Objek tunggal untuk setiap transaksi/patungan yang dicatat oleh seseorang.
5. **ExpenseShare**: Menggambarkan berapa persen porsi kewajiban yang ditanggung (Split Bill) oleh masing-masing individu untuk *Expense* tertentu.
6. **Payment**: Objek konfirmasi/pengajuan pembayaran ketika anggota melunasi utangnya.

## Persiapan Server (Setup)

1. Pastikan Anda telah menginstal `Node.js` dan membuat instansi database PostgreSQL.
2. Unduh *dependencies*:
   ```bash
   npm install
   ```
3. Konfigurasikan File Variabel Lingkungan (`.env`). Gunakan berkas yang sama dengan `.env.example` lalu atur kredensial Anda, seperti `DATABASE_URL` untuk koneksi Supabase Anda.
4. Migrasikan skema basis data dengan Prisma:
   ```bash
   npx prisma db push
   # atau npx prisma migrate dev (jika perlu)
   ```
5. Mulai *server* Express:
   ```bash
   npm run dev
   ```
6. API akan aktif secara *default* pada *port* yang Anda tentukan (umumnya: `http://localhost:3000`).