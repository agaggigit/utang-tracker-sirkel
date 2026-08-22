import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Trash2, ArrowLeft } from 'lucide-react';

const MySwal = withReactContent(Swal);

export const Profile = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: ''
    });
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
                name: profile.name
            });
            
            // Backend menyimpan URL relatif seperti "/public/uploads/..."
            // Tambahkan Base URL backend agar gambar bisa dirender di frontend.
            // Gunakan port 3000 (backend) jika env tidak di set.
            if (profile.avatarUrl) {
                const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
                const fullUrl = profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${backendUrl}${profile.avatarUrl}`;
                setPreviewUrl(fullUrl);
            }
        }
    }, [profile]);

    // Handle pemilihan file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Buat preview lokal
        }
    };

    // --- MENGUBAH DATA (KETIKA MENGETIK) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const mutation = useMutation({
        mutationFn: async () => {
            // 1. Upload file jika ada
            if (avatarFile) {
                const form = new FormData();
                form.append('avatar', avatarFile);
                await api.post('/users/me/avatar', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            // 2. Update nama
            const response = await api.patch('/users/me', { name: formData.name });
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
        mutation.mutate();
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div className="avatar-preview">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Avatar" 
                                        referrerPolicy="no-referrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            MySwal.fire({
                                                imageUrl: previewUrl,
                                                imageAlt: "Foto Profil",
                                                showConfirmButton: false,
                                                showCloseButton: true,
                                                background: 'transparent',
                                                backdrop: 'rgba(0,0,0,0.8)',
                                                customClass: {
                                                    image: 'swal2-image-custom-avatar'
                                                }
                                            });
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <label style={{
                                    cursor: 'pointer',
                                    backgroundColor: '#f3f4f6',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: 'var(--color-text-main)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} className="upload-btn-hover">
                                    Ubah Foto
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {profile?.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            MySwal.fire({
                                                title: 'Hapus Foto Profil?',
                                                text: 'Foto profilmu akan dihapus dan dikembalikan ke inisial nama.',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Ya, hapus!',
                                                cancelButtonText: 'Batal',
                                                customClass: {
                                                    confirmButton: 'btn btn-danger',
                                                    cancelButton: 'btn btn-outline',
                                                    actions: 'swal2-actions-custom'
                                                },
                                                buttonsStyling: false
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        await api.patch('/users/me', { avatarUrl: '' });
                                                        setPreviewUrl(null);
                                                        setAvatarFile(null);
                                                        queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
                                                        setMessage({ type: 'success', text: 'Foto profil berhasil dihapus' });
                                                    } catch (error) {
                                                        setMessage({ type: 'error', text: 'Gagal menghapus foto profil' });
                                                    }
                                                }
                                            });
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: '#fef2f2',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #fecaca',
                                            color: 'var(--color-error)',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Hapus Foto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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