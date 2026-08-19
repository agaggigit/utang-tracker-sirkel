# Users Module

Modul ini bertanggung jawab atas semua hal yang berkaitan dengan pengguna, mulai dari pendaftaran (registrasi), autentikasi (login), hingga pengambilan dan pembaruan profil pengguna.

## Struktur File

| File | Fungsi Utama |
|------|-------------|
| `registerUser.ts` | Menangani pendaftaran akun baru menggunakan email dan password. Password di-hash menggunakan `bcrypt`. |
| `loginUser.ts` | Memverifikasi kredensial pengguna dan menerbitkan JWT (JSON Web Token) untuk autentikasi sesi. |
| `googleAuth.ts` | Menangani pendaftaran dan login (SSO) menggunakan akun Google OAuth. |
| `profile.ts` | Mengambil data profil pengguna yang sedang login dan memperbarui informasi profil mereka. |

## API Endpoints

- `POST /auth/register` : Mendaftarkan akun baru.
- `POST /auth/login` : Masuk dan mendapatkan JWT.
- `POST /auth/google` : Masuk/Daftar menggunakan token Google.
- `GET /users/me` : Mengambil informasi profil (butuh Token).
- `PATCH /users/me` : Memperbarui nama profil pengguna (butuh Token).

## Alur Data (Data Flow)

Berikut adalah alur autentikasi dan pembuatan sesi JWT saat pengguna mencoba masuk (*Login*).

```mermaid
sequenceDiagram
    actor Client
    participant API as /auth/login
    participant Zod as Zod Validator
    participant DB as PostgreSQL (Prisma)
    
    Client->>API: POST { email, password }
    API->>Zod: Validasi Skema Request
    
    alt Tidak Valid
        Zod-->>API: Error (Format Salah)
        API-->>Client: 400 Bad Request
    else Valid
        API->>DB: Cari User by Email
        
        alt User Tidak Ditemukan
            DB-->>API: null
            API-->>Client: 401 Unauthorized
        else User Ditemukan
            DB-->>API: User Data & Hashed Password
            API->>API: bcrypt.compare(password, hash)
            
            alt Password Salah
                API-->>Client: 401 Unauthorized
            else Password Benar
                API->>API: jwt.sign(userId)
                API-->>Client: 200 OK + JWT Token
            end
        end
    end
```