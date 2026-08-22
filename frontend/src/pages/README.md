# Direktori Halaman (`pages`)

Direktori ini berisi komponen-komponen React level atas (Top-level Components) yang mewakili satu layar atau halaman secara utuh. Komponen di sini memiliki logika bisnis yang lebih berat, melakukan pemanggilan API (*data fetching*), dan mengelola alur data (State Management) sebelum dilempar ke komponen UI yang lebih kecil.

## Daftar File dan Fungsinya

### 1. Autentikasi & Profil (User Management)
- **`Login.tsx`**: Halaman bagi pengguna untuk masuk ke dalam sistem, baik menggunakan kredensial manual (email/password) maupun fitur Login with Google OAuth. Mengembalikan Token JWT dan menyimpannya ke `localStorage`.
- **`Register.tsx`**: Halaman pembuatan akun baru, mencakup pengisian nama, email, serta konfirmasi password ganda.
- **`Profile.tsx`**: Halaman manajemen profil. Pengguna dapat mengubah nama lengkap dan URL avatar foto profil mereka.

### 2. Dasbor & Manajemen Sirkel (Group Management)
- **`Dashboard.tsx`**: Halaman utama (beranda) paska login. Bertugas menarik seluruh data grup yang diikuti pengguna serta memaparkan ringkasan "Utang/Piutang" global.
- **`CreateGroup.tsx`**: Halaman dengan form sederhana untuk membuat grup sirkel baru (hanya butuh nama).
- **`JoinGroup.tsx`**: Halaman form bagi pengguna untuk menempelkan *Invite Code* (Kode Undangan) demi bisa ikut bergabung ke grup teman.
- **`GroupDetail.tsx`**: Panel "Admin" (Hanya untuk Host Grup). Digunakan untuk mengubah konfigurasi grup (seperti menyalakan fitur persetujuan admin saat join), me-reset kode undangan, serta menyetujui (Approve) atau menolak (Reject) user yang sedang antre masuk (Join Request).

### 3. Manajemen Tagihan (Expense Engine)
- **`GroupExpenses.tsx`**: **Halaman Paling Esensial.** Ini adalah halaman utama sebuah grup. Menampilkan riwayat daftar seluruh tagihan menggunakan konsep **Infinite Scroll** (memuat data per 10 item). Dilengkapi dengan fitur Pencarian Text, Filter Status (Belum Lunas/Nalangin), Filter Waktu, dan Tombol Pintasan ke Panel Ringkasan.
- **`CreateExpense.tsx`**: Halaman pencatatan tagihan kompleks. User memasukkan total nota, lalu merincikan daftar utang perorangan, siapa yang ikut makan, dan apakah jumlah utang dibagi rata (Equal) atau diinput manual.
- **`EditExpense.tsx`**: Kembaran dari CreateExpense, namun dengan fungsi menarik data lama terlebih dahulu agar bisa direvisi.
- **`ExpenseDetail.tsx`**: Halaman rincian spesifik satu tagihan. Menampilkan daftar nama anak-anak yang berpartisipasi beserta status indikator (hijau=lunas, merah=belum). Menyediakan tombol eksekusi untuk mencatat bahwa uang sudah diserahkan (Ajukan Pelunasan) bagi yang berutang, atau tombol hapus seluruh tagihan.

### 4. Kotak Masuk
- **`Notifications.tsx`**: Halaman notifikasi dan *approval*. Terdiri dari tiga aliran data sekaligus:
  - Notifikasi Info (Teks biasa seperti "Si Budi telah bergabung").
  - Pengajuan Gabung Grup (Perlu aksi terima/tolak).
  - Pengajuan Pembayaran (Paling Krusial: Saat A bayar ke B, B harus me-review nominalnya di halaman ini lalu menekan "Terima" agar utang A dianggap sah lunas).