import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Trash2, ArrowLeft, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const MySwal = withReactContent(Swal);

export const Profile = () => {
    const navigate = useNavigate();
    const { themeMode, setThemeMode, scheduleTime, setScheduleTime } = useTheme();

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
            <div className="auth-card profile-card relative">
                
                {/* Tombol Kembali ke Dashboard */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-8 left-8 bg-transparent border-none text-2xl cursor-pointer p-0 text-primary"
                    title="Kembali ke Dashboard"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="profile-layout mt-6">
                    
                    {/* --- KOLOM KIRI --- */}
                    <div>
                        <div className="auth-header">
                            <h2>Profil Pribadi</h2>
                            <p>Atur nama dan foto profilmu</p>
                        </div>
                        {/* AREA FOTO PROFIL */}
                        <div className="flex flex-col items-center gap-4">
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
                                        className="cursor-pointer"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <label className="cursor-pointer px-4 py-2 rounded-lg border border-border text-[0.9rem] font-medium bg-surface-muted text-text-main transition-all flex items-center justify-center hover:brightness-95">
                                    Ubah Foto
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
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
                                        className="cursor-pointer bg-error-bg text-error p-2 border border-error-border rounded-lg transition-all flex items-center justify-center hover:brightness-95"
                                        title="Hapus Foto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* --- KOLOM KANAN --- */}
                    <div className="flex flex-col gap-8">
                        
                        {/* FORM PROFIL */}
                        <div>
                            <form onSubmit={handleSubmit} className="auth-form">
                                {message.text && (
                                    <div className={`auth-error-banner ${message.type === 'success' ? 'bg-success-bg text-success-text border-success-border' : 'bg-error-bg text-error border-error-border'}`}>
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

                        {/* PENGATURAN TAMPILAN */}
                        <div className="border-t border-border pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Moon size={20} color="var(--color-text-muted)" />
                                <h3 className="m-0 text-[1.1rem] text-text-main">Pengaturan Tampilan</h3>
                            </div>
                            
                            <div className="input-wrapper">
                                <label className="input-label">Pilih Tema</label>
                                <select 
                                    className="input-field font-inherit cursor-pointer" 
                                    value={themeMode}
                                    onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'system' | 'schedule')}
                                >
                                    <option value="system">Otomatis (Ikuti Sistem)</option>
                                    <option value="light">Terang (Light Mode)</option>
                                    <option value="dark">Gelap (Dark Mode)</option>
                                    <option value="schedule">Jadwal Waktu</option>
                                </select>
                            </div>

                            {themeMode === 'schedule' && (
                                <div className="flex gap-4 -mt-2 bg-background p-4 rounded-lg border border-border">
                                    <div className="flex-1">
                                        <label className="input-label text-[0.8rem]">Mulai Gelap</label>
                                        <input 
                                            type="time" 
                                            className="input-field p-2 w-full"
                                            value={scheduleTime.start}
                                            onChange={(e) => setScheduleTime(e.target.value, scheduleTime.end)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="input-label text-[0.8rem]">Kembali Terang</label>
                                        <input 
                                            type="time" 
                                            className="input-field p-2 w-full"
                                            value={scheduleTime.end}
                                            onChange={(e) => setScheduleTime(scheduleTime.start, e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}