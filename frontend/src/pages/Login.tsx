import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin }  from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { getErrorMessage } from '../utils/errorHandler';
import { useMutation } from '@tanstack/react-query';

export const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const loginMutation = useMutation({
        mutationFn: async (credentials: typeof formData) => {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            // MISI RAHASIA: Simpan "Kunci" (Token JWT) dari Backend ke Brankas Browser
            localStorage.setItem('token', data.token);
            toast.success('Login Berhasil!');
            
            navigate('/dashboard');
        },
        onError: (err: unknown) => {
            setErrorMsg(getErrorMessage(err));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        loginMutation.mutate(formData);
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
        onError: (err: unknown) => {
            setErrorMsg(getErrorMessage(err));
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

    const isSubmitting = loginMutation.isPending || googleLoginMutation.isPending;

    return (
    <div className="w-full p-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-surface rounded-[1rem] py-10 px-8 shadow-lg max-w-[500px] mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2">Selamat Datang Kembali</h2>
                <p className="text-text-muted text-sm m-0">Masuk untuk melihat daftar utangmu</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
                {errorMsg && <div className="bg-error-bg text-error p-3 rounded-lg text-sm text-center mb-4 border border-error-border">{errorMsg}</div>}

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
                    placeholder="Masukkan passwordmu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <Button type="submit" fullWidth disabled={isSubmitting}>
                    {loginMutation.isPending ? 'Mengecek data...' : 'Masuk'}
                </Button>
                
                <div className="flex items-center text-center my-6 text-text-muted text-sm before:flex-1 before:border-b before:border-border after:flex-1 after:border-b after:border-border">
                    <span className="px-4">atau</span>
                </div>
                
                <Button type="button" variant="outline" fullWidth onClick={() => handleGoogleLogin()}>
                    Masuk dengan Google
                </Button>
                
                <div className="mt-6 text-center text-[0.875rem]">
                    Belum punya akun?

                    <span className="text-primary cursor-pointer font-semibold hover:underline ml-1" onClick={() => navigate('/register')}>
                        Daftar di sini
                    </span>
                </div>
            </form>
        </div>
    </div>
  );
}