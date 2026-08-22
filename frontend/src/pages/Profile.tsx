import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const Profile = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        avatarUrl: ''
    });

    const queryClient = useQueryClient();

    const [message, setMessage] = useState({
        type: '',
        text: ''
    });

    const { data: profile, isLoading: isFetching } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: async () => {
            const response = await api.get('/users/me');
            return response.data;
        }
    });

    // --- MENGISI FORM SAAT DATA SELESAI DIAMBIL ---
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                avatarUrl: profile.avatarUrl || ''
            });
        }
    }, [profile]);

    // --- MENGUBAH DATA (KETIKA MENGETIK) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const mutation = useMutation({
        mutationFn: async (newData: any) => {
            const response = await api.patch('/users/me', newData);
            return response.data;
        },
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    setMessage({ type: 'error', text: firstError[0] });
                } else {
                    setMessage({ type: 'error', text: data.message || 'Gagal menyimpan' });
                }
            } else {
                setMessage({ type: 'error', text: err.message });
            }
        }
    });

    // --- MENGIRIM DATA (KETIKA TOMBOL SIMPAN DITEKAN) ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        mutation.mutate(formData);
    };

    return (
        <div className="auth-container">
            <div className="auth-card profile-card" style={{ position: 'relative' }}>
                
                {/* Tombol Kembali ke Dashboard */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                    title="Kembali ke Dashboard"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="profile-layout" style={{ marginTop: '1.5rem' }}>
                    
                    {/* --- KOLOM KIRI --- */}
                    <div>
                        <div className="auth-header">
                            <h2>Profil Pribadi</h2>
                            <p>Atur nama dan foto profilmu</p>
                        </div>
                        {/* AREA FOTO PROFIL */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                    </div>

                    {/* --- KOLOM KANAN --- */}
                    <div>
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
                            <Button type="submit" fullWidth disabled={mutation.isPending || isFetching}>
                                {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}