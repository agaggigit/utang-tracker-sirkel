# Struktur Backend Server (src)

Direktori utama berjalannya logika *Business Rules* server Express. Aplikasi Backend ini dirancang berdasarkan konsep *Modular Monolith*. Setiap fungsionalitas besar (Grup, Pengeluaran, Notifikasi) dikelompokkan ke dalam direktorinya masing-masing untuk mencegah *Spaghetti Code*.

- `expenses/`: Endpoint, logika rute, dan manipulasi *database* terkait pengeluaran, tagihan, dan rincian alokasi tagihan (*Split Bill*).
- `groups/`: Memiliki tanggung jawab melayani pembuatan grup, mekanisme masuk grup dengan kode (*Invite Code*), manajemen anggota, serta sistem persetujuan masuk.
- `middleware/`: Berkas pembantu penengah siklus HTTP. Tempat validasi _token JWT_ (*Authentication*) dan _error handlers_ tingkat aplikasi ditangani.
- `notifications/`: Menyediakan data *feed* notifikasi kepada masing-masing pengguna.
- `payments/`: Memproses alur konfirmasi lunasnya suatu transaksi/tagihan di dalam aplikasi.
- `users/`: Menyediakan endpoint pendaftaran, otentikasi login, serta profil pribadi anggota.