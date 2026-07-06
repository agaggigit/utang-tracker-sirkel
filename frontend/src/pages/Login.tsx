import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal login');
            }

            // MISI RAHASIA: Simpan "Kunci" (Token JWT) dari Backend ke Brankas Browser
            localStorage.setItem('token', data.token);
            
            alert('Login Berhasil! Kunci token sudah disimpan.');
            
            // Nanti kita arahkan ke halaman Home/Dashboard menggunakan:
            // navigate('/dashboard');
        } catch(err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="auth-container">
        <div className="auth-card">
            <div className="auth-header">
                <h2>Selamat Datang Kembali</h2>
                <p>Masuk untuk melihat daftar utangmu</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

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

                <Button type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? 'Mengecek data...' : 'Masuk'}
                </Button>
                
                <div className="auth-divider">
                    <span>atau</span>
                </div>
                
                <Button type="button" variant="outline" fullWidth>
                    Masuk dengan Google
                </Button>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Belum punya akun?

                    <span style={{color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600}} onClick={() => navigate('/register')}>
                        Daftar di sini
                    </span>
                </div>
            </form>
        </div>
    </div>
  );
}