# Panduan Prefix Commit Message

Format yang sudah kamu pakai (`feat:`, `fix:`, `chore:`) berasal dari standar bernama **Conventional Commits**.

## Format dasar

```
<prefix>(<scope opsional>): <deskripsi singkat>

<body opsional: penjelasan kenapa>
```

Contoh:
```
fix(frontend): correct token import path in api client
```

## Daftar prefix

| Prefix | Kapan dipakai | Contoh dari proyekmu |
|---|---|---|
| `feat` | Fitur baru yang terlihat oleh pengguna | `feat: add settle up for net balance between two users` |
| `fix` | Perbaikan bug | `fix: correct token import path in api client` |
| `refactor` | Ubah struktur kode **tanpa** mengubah perilaku | `refactor: extract computeBalances into balance.ts` |
| `test` | Tambah atau ubah tes saja | `test: add cases for two-way debt netting` |
| `chore` | Pekerjaan pemeliharaan yang tidak menyentuh logika aplikasi | `chore: untrack build artifacts, env, and test uploads` |
| `docs` | Hanya dokumentasi | `docs: remove offline mode claim from README` |
| `style` | Format kode saja (spasi, titik koma, indentasi) | `style: format payments folder with prettier` |
| `perf` | Peningkatan performa | `perf: add index on expense_shares.user_id` |
| `build` | Sistem build atau dependency | `build: add vitest as dev dependency` |
| `ci` | Konfigurasi CI | `ci: run tests on pull request` |

Catatan: setup Vitest bisa ditulis sebagai `chore:` atau `build:`. Keduanya umum dipakai. Pilih satu lalu konsisten.

## Scope (opsional)

Scope adalah kata dalam kurung yang menunjukkan bagian kode mana yang diubah. Untuk monorepo seperti proyekmu, scope ini berguna:

```
feat(backend): ...
fix(frontend): ...
refactor(groups): ...
fix(payments): prevent double approval on concurrent requests
```

## Aturan menulis deskripsi

1. **Pakai kalimat perintah** (imperative): `add`, `fix`, `remove`. Hindari `added`, `fixes`, atau `adding`. Trik untuk mengeceknya: kalimat *"If applied, this commit will ___"* harus terbaca natural.
2. **Huruf kecil di awal, tanpa titik di akhir.**
3. **Pendek**, idealnya di bawah sekitar 72 karakter.
4. **Tulis *apa* yang berubah, bukan *cara* mengubahnya.** Detail teknis sudah terlihat di diff.
   - ❌ `fix: remember me feature, fix singular . to .. for backtrack the folder`
   - ✅ `fix: correct token import path in api client`
5. **Konsisten dalam satu bahasa.** Commit-commitmu sejauh ini berbahasa Inggris, jadi pertahankan.

## Body: kapan perlu

Tambahkan body (setelah satu baris kosong) kalau **alasannya tidak terlihat dari kode**:

```
fix(payments): prevent double approval on concurrent requests

Two approve requests arriving at the same time could both pass the
status check. Use updateMany with status: 'pending' as a condition
and check the affected count instead.
```

## Breaking change

Kalau perubahanmu merusak kompatibilitas (misalnya bentuk response API berubah sehingga frontend lama akan rusak), tandai dengan `!`:

```
feat(api)!: change balance response to include settlement suggestions
```

## Cara memilih prefix yang tepat

Tanyakan berurutan:
1. Apakah perilaku aplikasi berubah bagi pengguna? Kalau ada yang tadinya rusak lalu jadi benar, pakai **`fix`**. Kalau ada kemampuan baru, pakai **`feat`**.
2. Apakah kodenya berubah tapi perilakunya sama? Pakai **`refactor`**.
3. Apakah yang berubah hanya tes, dokumentasi, atau format? Pakai **`test`**, **`docs`**, atau **`style`**.
4. Kalau bukan semuanya (config, dependency, `.gitignore`), pakai **`chore`** atau **`build`**.

**Kalau satu commit butuh dua prefix**, misalnya `refactor` sekaligus `fix`, itu tanda commit-nya perlu **dipecah**. Ini alasan yang sama kenapa aku menyarankan refactor `computeBalances` dan perbaikan bug `Number()` dipisah.

## Contoh rangkaian commit untuk pekerjaan yang sedang kamu kerjakan

```
build(backend): add vitest and test script
refactor(groups): extract computeBalances into balance.ts
test(groups): add unit tests for computeBalances
fix(groups): avoid floating point errors in balance calculation
```

Dari empat baris itu saja, orang yang membaca `git log` sudah bisa memahami alur kerjamu tanpa membuka kodenya.