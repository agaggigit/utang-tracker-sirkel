import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin }  from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { setToken, getToken } from '../utils/token';

export const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // Langsung pindah ke dashboard jika sudah punya token
    useEffect(() => {
        if (getToken()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const loginMutation = useAuth().useLogin({
        onSuccess: (data) => {
            // MISI RAHASIA: Simpan "Kunci" (Token JWT) dari Backend ke Brankas Browser
            setToken(data.token, rememberMe);
            toast.success('Login Berhasil!');
            navigate('/dashboard');
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.message || err.message || 'Gagal login');
        }
    });

    const googleLoginMutation = useAuth().useGoogleLoginMutation({
        onSuccess: (data) => {
            setToken(data.token, rememberMe);
            navigate('/dashboard');
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.message || err.message || 'Gagal login Google');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        loginMutation.mutate(formData);
    };

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

                <div className="flex items-center gap-2 mb-6">
                    <input 
                        type="checkbox" 
                        id="rememberMe" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-text-muted cursor-pointer select-none">
                        Ingat Saya
                    </label>
                </div>

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