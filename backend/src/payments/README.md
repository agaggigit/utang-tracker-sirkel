# Payments Module

Modul ini bertanggung jawab atas sistem pelunasan (pembayaran utang) antar anggota di dalam grup. Transaksi yang dicatat tidak memindahkan uang sungguhan, melainkan hanya mengubah catatan utang (*ledger*) di dalam aplikasi.

## Struktur File

| File | Fungsi Utama |
|------|-------------|
| `createPayment.ts` | Mengajukan pembayaran dari satu *User* (yang berutang) ke *User* lain (yang diutangi). Status awal pembayaran adalah PENDING. |
| `getIncomingPayments.ts` | Mengambil daftar pembayaran yang diajukan oleh orang lain kepada pengguna yang sedang *login* (menunggu konfirmasi). |
| `approvePayment.ts` | Endpoint bagi penerima dana untuk mengonfirmasi bahwa mereka **sudah menerima uangnya**. Status berubah menjadi APPROVED. |
| `rejectPayment.ts` | Endpoint bagi penerima dana untuk menolak pengajuan pembayaran (misal jika nominal tidak sesuai atau uang belum masuk). Status berubah menjadi REJECTED. |

## API Endpoints

- `POST /payments` : Mengajukan/mencatat pembayaran baru.
- `GET /payments/incoming` : Melihat daftar uang masuk yang menunggu konfirmasi.
- `PATCH /payments/:id/approve` : Menerima pembayaran.
- `PATCH /payments/:id/reject` : Menolak pembayaran.

## Alur Data (Data Flow)

Berikut adalah *State Diagram* yang menunjukkan siklus hidup *(lifecycle)* sebuah catatan pembayaran.

```mermaid
stateDiagram-v2
    [*] --> PENDING : User A klik "Bayar" (POST /payments)
    
    state PENDING {
        note right of PENDING
            Uang dianggap sedang "Di jalan".
            Saldo utang (balance) BELUM berubah.
        end note
    }
    
    PENDING --> APPROVED : User B klik "Konfirmasi" (PATCH .../approve)
    PENDING --> REJECTED : User B klik "Tolak" (PATCH .../reject)
    
    state APPROVED {
        note right of APPROVED
            Utang User A ke User B LUNAS/BERKURANG.
            Perubahan masuk ke catatan Balance Grup.
        end note
    }
    
    state REJECTED {
        note right of REJECTED
            Pembayaran dibatalkan.
            Utang kembali seperti semula.
        end note
    }
    
    APPROVED --> [*]
    REJECTED --> [*]
```