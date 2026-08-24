import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin }  from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useMutation } from '@tanstack/react-query';

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

    // Fungsi untuk mencatat setiap kali user mengetik di kotak input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const registerMutation = useMutation({
        mutationFn: async (userData: typeof formData) => {
            const response = await api.post('/auth/register', userData);
            return response.data;
        },
        onSuccess: () => {
            // Jika berhasil
            toast.success('Pendaftaran berhasil, silahkan masuk ke halaman login');
            
            // Nanti kita akan redirect ke halaman login di sini
            navigate('/login');
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                const data = err.response.data;
                // Jika error berasal dari Zod (validasi form)
                if (data.errors) {
                    // Ambil pesan error pertama yang dikembalikan Zod
                    const firstError = Object.values(data.errors)[0] as string[];
                    setErrorMsg(firstError[0]);
                } else {
                    // Jika backend menolak (misal: email sudah dipakai)
                    setErrorMsg(data.message || 'Gagal mendaftar');
                }
            } else {
                setErrorMsg(err.message);
            }
        }
    });

    // --- 2. LOGIKA KETIKA TOMBOL DAFTAR DIKLIK --
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah halaman me-refresh (berkedip)
        setErrorMsg('');    // Bersihkan error sebelumnya

        // Validasi dasar
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Password dan Konfirmasi Password tidak sama');
            return;
        }

        registerMutation.mutate(formData);
    };

    const googleLoginMutation = useMutation({
        mutationFn: async (code: string) => {
            const response = await api.post('/auth/google', { code });
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                setErrorMsg(err.response.data.message || 'Gagal login dengan Google');
            } else {
                setErrorMsg(err.message);
            }
        }
    });

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: (codeResponse) => {
            setErrorMsg('');
            googleLoginMutation.mutate(codeResponse.code);
        },
        onError: () => {
            setErrorMsg('Login dengan Google dibatalkan atau gagal.');
        }
    });

    const isSubmitting = registerMutation.isPending || googleLoginMutation.isPending;

    // --- 3. TAMPILAN (UI) ---
    return (
        <div className="w-full p-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-surface rounded-[1rem] py-10 px-8 shadow-lg max-w-[500px] mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-primary mb-2">Buat Akun Baru</h2>
                    <p className="text-text-muted text-sm m-0">Mulai catat utang piutangmu dengan rapi</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {errorMsg && <div className="bg-error-bg text-error p-3 rounded-lg text-sm text-center mb-4 border border-error-border">{errorMsg}</div>}

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

                    <Button type='submit' fullWidth disabled={isSubmitting}>
                        {registerMutation.isPending ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </Button>

                    <div className="flex items-center text-center my-6 text-text-muted text-sm before:flex-1 before:border-b before:border-border after:flex-1 after:border-b after:border-border">
                        <span className="px-4">atau</span>
                    </div>

                    <Button type='button' variant="outline" fullWidth onClick={() => handleGoogleLogin()}>
                        Daftar dengan Google
                    </Button>

                    <div className="mt-6 text-center text-[0.875rem]">
                        Sudah punya akun?

                        <span className="text-primary cursor-pointer font-semibold hover:underline ml-1" onClick={() => navigate('/login')}>
                            Masuk di sini
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};