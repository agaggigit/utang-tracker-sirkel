# Bill Splitter & Debt Tracker PWA

Aplikasi pencatat keuangan dan patungan (*split bill*) modern yang dirancang dengan pendekatan *offline-first*. Aplikasi ini mengintegrasikan pelacakan utang satu-lawan-satu (*one-to-one debt*) dan patungan kelompok (*multi-group split bill*) ke dalam satu model *ledger* yang efisien dan konsisten.

## 🚀 Fitur Utama

- **Unified Ledger System:** Mengelola utang pribadi maupun patungan kelompok dalam satu logika database yang sama (utang biasa dianggap sebagai *split bill* dengan satu partisipan).
- **Offline-First Capabilities:** Pengguna tetap dapat mencatat transaksi meskipun sedang tidak ada koneksi internet (misalnya di basement atau area minim sinyal). Data akan disinkronkan otomatis saat kembali *online*.
- **Multi-Group Ready:** Arsitektur database yang sudah mendukung skalabilitas multi-grup sejak awal untuk menghindari migrasi data yang rumit di masa depan.
- **Settle Up Tracking:** Pemisahan yang jelas antara histori transaksi belanja (*expenses*) dan transaksi pelunasan (*payments*).

---

## 🛠️ Tech Stack

### Frontend & PWA Layer
- **Core Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Cepat, ringan, dan modern)
- **PWA Builder:** [@vite-pwa/plugin](https://vite-pwa-org.netlify.app/) dengan Workbox untuk manajemen *Service Worker* dan *caching* otomatis aset statis.
- **Client-Side Database:** [Dexie.js](https://dexie.org/) (Wrapper berbasis IndexedDB) untuk penyimpanan data transaksional yang aman dan persisten di sisi browser saat *offline*.
- **Server State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest) untuk *caching* data dari API dan otomatisasi sinkronisasi ulang saat jaringan terhubung kembali.

### Backend & API Layer
- **Runtime Environment:** [Node.js](https://nodejs.org/) dengan **TypeScript** untuk menjaga tipe data yang konsisten dari backend hingga frontend.
- **Web Framework:** Express.js / Fastify.
- **Architecture Style:** **Vertical Slice Architecture** — Struktur folder diorganisasikan berdasarkan fitur/kapabilitas bisnis (bukan berdasarkan lapisan teknis seperti controller/service terpisah) untuk meningkatkan modularitas dan kemudahan *maintenance*.

### Database & Storage
- **Database Utama:** [PostgreSQL](https://www.postgresql.org/) — Dipilih karena ketangguhannya dalam menangani skema data relasional kompleks dan performa tinggi untuk *query* agregasi saldo antar-pengguna.

---

## 📐 Skema Database (Ledger-Based Model)

Aplikasi ini menggunakan struktur tabel relasional berikut untuk memastikan konsistensi data:

```sql
-- User Management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Circle / Group
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Expenses (Induk Transaksi Belanja)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  paid_by UUID REFERENCES users(id),
  description TEXT,
  total_amount NUMERIC(14,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Expense Shares (Pembagian Porsi per User)
CREATE TABLE expense_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  share_amount NUMERIC(14,2) NOT NULL
);

-- Payments (Transaksi Pelunasan / Settle Up)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  amount NUMERIC(14,2) NOT NULL,
  note TEXT,
  paid_at TIMESTAMP DEFAULT now()
);