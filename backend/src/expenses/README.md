# 💸 Expenses Module

Modul ini bertugas menangani pencatatan tagihan (patungan) di dalam sebuah grup. Fitur ini memungkinkan pengguna mencatat siapa yang membayar *bill* utama (misalnya di restoran), lalu membaginya ke anggota lain yang ikut berutang.

## 📂 Struktur File

| File | Fungsi Utama |
|------|-------------|
| `createExpense.ts` | Menyimpan transaksi pengeluaran baru. Termasuk membuat entri utama `Expense` dan rincian bagian masing-masing anggota di tabel `ExpenseShare`. |
| `getExpenses.ts` | Mengambil daftar riwayat pengeluaran dari sebuah grup (biasanya disajikan secara kronologis). |
| `getExpenseDetail.ts` | Mengambil informasi sangat rinci dari satu transaksi tagihan (termasuk siapa saja yang terlibat dan berapa nominal mereka). |
| `updateExpense.ts` | Mengubah rincian tagihan (misalnya jika ada koreksi harga, atau penambahan/pengurangan anggota yang ikut patungan). |
| `deleteExpense.ts` | Menghapus catatan tagihan sepenuhnya secara permanen. |

## 🔌 API Endpoints

- `POST /groups/:id/expenses` : Menambahkan tagihan baru ke sebuah grup.
- `GET /groups/:id/expenses` : Melihat riwayat seluruh tagihan di dalam grup.
- `GET /expenses/:id` : Melihat detail spesifik satu tagihan.
- `PUT /expenses/:id` : Mengedit tagihan yang ada.
- `DELETE /expenses/:id` : Menghapus tagihan.

## 🔄 Alur Data (Data Flow)

Berikut adalah visualisasi cara kerja **Create Expense**, yang menggunakan sistem *Prisma Transaction* untuk memastikan data Konsisten (Jika `ExpenseShare` gagal disimpan, `Expense` utama otomatis batal/dihapus).

```mermaid
erDiagram
    GROUP ||--o{ EXPENSE : "memiliki"
    USER ||--o{ EXPENSE : "dibayarkan oleh"
    EXPENSE ||--|{ EXPENSE_SHARE : "dipecah menjadi"
    USER ||--o{ EXPENSE_SHARE : "berutang sejumlah"

    EXPENSE {
        uuid id PK
        string title
        decimal totalAmount
        uuid paidById FK
        uuid groupId FK
    }

    EXPENSE_SHARE {
        uuid id PK
        uuid expenseId FK
        uuid userId FK
        decimal amount
    }
```

```mermaid
flowchart TD
    A[Client Submit Form Patungan] -->|POST /groups/:id/expenses| B(API createExpense.ts)
    B --> C{Zod Validation}
    C -->|Invalid| D[400 Bad Request]
    C -->|Valid| E[(Prisma $transaction)]
    
    E --> F[1. Insert Tabel Expense]
    F --> G[2. Looping Insert Tabel ExpenseShare]
    
    G -->|Gagal Tengah Jalan| H[Rollback! Semua Batal]
    H --> I[500 Error]
    
    G -->|Berhasil Semua| J[Commit Database]
    J --> K[201 Success Created]
```