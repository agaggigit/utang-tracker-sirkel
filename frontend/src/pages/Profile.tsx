import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Profile = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        avatarUrl: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const [message, setMessage] = useState({
        type: '',   // type: 'error' | 'success'
        text: ''
    });

    // --- MENGAMBIL DATA SAAT HALAMAN DIBUKA ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    setFormData({
                        name: data.name,
                        avatarUrl: data.avatarUrl || ''
                    });
                }
            } catch(error) {
                console.error('Gagal mengambil profil')
            }
        };

        fetchProfile();
    }, []); // <-- Kurung siku kosong artinya: "Jalankan fungsi ini SATU KALI saja saat halaman pertama kali dibuka"

    // --- MENGUBAH DATA (KETIKA MENGETIK) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    // --- MENGIRIM DATA (KETIKA TOMBOL SIMPAN DITEKAN) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/users/me', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError[0]);
                }
                throw new Error(data.message || 'Gagal menyimpan');
            }

            setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        } catch(err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                {/* Tombol Kembali ke Dashboard */}
                <span 
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }} 
                    onClick={() => navigate('/dashboard')}
                >
                    &larr; Kembali
                </span>
                <div className="auth-header" style={{ marginTop: '1rem' }}>
                    <h2>Profil Pribadi</h2>
                    <p>Atur nama dan foto profilmu</p>
                </div>
                {/* AREA FOTO PROFIL */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div className="avatar-preview">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {message.text && (
                        <div className="auth-error-banner" style={{ 
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fef2f2',
                            color: message.type === 'success' ? '#166534' : 'var(--color-error)',
                            borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca'
                        }}>
                            {message.text}
                        </div>
                    )}
                    <Input 
                        label="Nama Lengkap" 
                        name="name"
                        placeholder="Misal: Budi Santoso"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input 
                        label="URL Foto Profil (Opsional)" 
                        name="avatarUrl"
                        placeholder="https://contoh.com/foto.jpg"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                    />
                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </form>
            </div>
        </div>
    );
}