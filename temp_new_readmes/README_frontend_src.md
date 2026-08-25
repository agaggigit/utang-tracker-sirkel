# Kode Sumber Aplikasi (src)

Direktori `src` merupakan jantung dari aplikasi sisi klien (Frontend) Talangin. Seluruh logika aplikasi, manajemen _state_, hingga desain UI ditempatkan dan dikelompokkan secara logis di sini.

## Komposisi Direktori

Untuk mempermudah navigasi dan pembagian tugas pengembangan, direktori dipecah menjadi beberapa fungsi khusus:

1. **`components/`**
   Komponen _Presentational_ yang dapat dipakai ulang (reusable). Komponen di dalam sini dirancang agar tidak mengetahui dari mana data berasal, melainkan hanya merender apa yang diberikan melalui *Props*.
2. **`pages/`**
   Direktori tempat kumpulan halaman utama atau _Views_. Setiap file di sini mewakili sebuah _route_ URL. Berfungsi merangkai _hooks_ (pengambil data) dengan komponen-komponen presentasional di atas.
3. **`hooks/`**
   Menampung seluruh logika bisnis (pengambilan data _API_, validasi mutasi, dll). Dibuat menggunakan format _Custom Hooks_ React (seperti `useExpenses.ts`, `useGroups.ts`) yang membungkus pemanggilan React Query.
4. **`lib/`**
   Inisialisasi klien pustaka pihak ketiga. Contoh utamanya adalah instansiasi `axios` untuk melakukan permintaan HTTP yang disuntikkan secara otomatis dengan token autentikasi (JWT) pada *header*-nya.
5. **`types/`**
   Definisi antarmuka struktur tipe data (Types/Interfaces) TypeScript agar aplikasi _type-safe_ sejak tahap pengembangan.
6. **`utils/`**
   Kumpulan fungsi pembantu statis. Salah satu fungsi terpenting di sini adalah fungsi standarisasi pesan *error* (`getErrorMessage`).

## Aturan Impor

Selalu gunakan jalur relatif impor (relative import paths). Untuk komponen _layouting_, pertahankan struktur impor modul sesuai dengan urutan: _library eksternal_, komponen aplikasi lokal, _custom hooks_, lalu _utils_.