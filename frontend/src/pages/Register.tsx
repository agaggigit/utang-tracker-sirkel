import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
    // --- 1. STATE (Tempat menyimpan apa yang diketik user) ---
    const navigate = useNavigate();
    const  [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk mencatat setiap kali user mengetik di kotak input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // --- 2. LOGIKA KETIKA TOMBOL DAFTAR DIKLIK --
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah halaman me-refresh (berkedip)
        setErrorMsg('');    // Bersihkan error sebelumnya

        // Validasi dasar
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Password dan Konfirmasi Password tidak sama');
            return;
        }

        setIsLoading(true);

        try {
            // Mengirim paket ke Backend (Satpam kita)
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                })
            });

            const data = await response.json();
            if (!response.ok) {
                // Jika error berasal dari Zod (validasi form)
                if (data.errors) {
                    // Ambil pesan error pertama yang dikembalikan Zod
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError[0]);
                }

                // Jika backend menolak (misal: email sudah dipakai)
                throw new Error(data.message || 'Gagal mendaftar');
            }

            // Jika berhasil
            alert('Pendaftaran berhasil, silahkan masuk ke halaman login');
            
            // Nanti kita akan redirect ke halaman login di sini
            navigate('/login')
        } catch (err: any) {
        setErrorMsg(err.message);
        } finally {
        setIsLoading(false);
        }
    };

    // --- 3. TAMPILAN (UI) ---
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Buat Akun Baru</h2>
                    <p>Mulai catat utang piutangmu dengan rapi</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

                    <Input
                        label="Nama Lengkap"
                        name="name"
                        placeholder="Misal: Budi Santoso"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Alamat Email"
                        name="email"
                        type="email"
                        placeholder="budi@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Konfirmasi Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Ulangi password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Button type='submit' fullWidth disabled={isLoading}>
                        {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </Button>

                    <div className="auth-divider">
                        <span>atau</span>
                    </div>

                    <Button type='button' variant="outline" fullWidth>
                        Daftar dengan Google
                    </Button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        Sudah punya akun?

                        <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>
                            Masuk di sini
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};