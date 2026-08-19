# Talangin
**A PWA Bill Splitter & Debt Tracker for Friend Groups**

Aplikasi ini adalah platform pencatatan utang untuk yang sirkel nya suka lupa utang satu sama lain. Aplikasi ini simpel dan minim fitur, sehingga user dapat dengan mudah menavigasi nya. Aplikasi ini memiliki kompatibilitas offline, sehingga tetap dapat digunakan untuk mencatat saat offline.

## Main Features

- **Sirkel:** Fitur untuk bergabung dengan kelompok pertemanan/patungan yang dapat mengundang teman dengan kode unik, disini lah riwayat patungan/transaksi akan berlangsung.
- **Chronological:** Riwayat transaksi dibuat seperti feeds *social media* yang menerapkan sistem seperti *infinite scroll* (sampai uujung transaksi paling awal), sehingga mudah dan intuitif untuk dilihat
- **Informaation:** Informasi penitng seperti total utang yang tersisa akan langsung diakumulasi sehingga user tidak perlu capek capek menghitung amndiri dan langsung tahu
- **Notification:** Notifikasi untuk beberapa hal
- **Profile:**  Profil yang dapat dikustomisasi

---


## Visual Preview

### Register & Login Page
### Main Dashboard
### Group
### Profile

---


## Tech Stack

### Frontend & PWA Layer
- **Core Framework:** React + Vite
- **PWA Builders:** Vite PWA
- **Client-Side Database:** Dexie.js untuk offline
- **Server State Management:** TanStack Query (React Query) untuk caching data dari API dan sinkronisasi otomatis saat balik online

### Backend & API Layer
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Architecture Style:** Vertical Slice Architecture

### Database & Storage
- **Database Utama:** PostgreSQL

---


## Prerequisites

---


## How to run for yourself in localhost

### 1. Make a new Folder
```
mkdir folder-name
```
### 2. Clone Repositories
```
git clone [https://github.com/username/repo-name.git]
cd repo-name
```

### 3. Run
```
cd backend
npm run dev
```
```
cd frontend
npm run dev
```

---

## Testing

### Account
- email: test01@test01.com
- password: test01@@

- email: test02@test02.com
- password: test02@@

- email: test03@test03.com
- password: test03@@

- email: test04@test04.com
- password: test04@@

### Group
- Host: My Google Login 
- Name: Sirkel1NoHostPerm
- Code: 07a372cb

---