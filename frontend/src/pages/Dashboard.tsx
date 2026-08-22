import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Inbox, LogOut, Home, Settings, Plus, Users, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonList, Skeleton } from '../components/ui/Skeleton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';

const MySwal = withReactContent(Swal);

export const Dashboard = () => {
    const navigate = useNavigate();
    const { isDark, toggleThemeQuick } = useTheme();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: async () => {
            const response = await api.get('/users/me');
            return response.data;
        }
    });

    const { data: notificationsData, isLoading: isLoadingNotif } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await api.get('/notifications');
            return response.data;
        }
    });

    const isLoading = isLoadingUser || isLoadingNotif;
    const notifications = notificationsData ? notificationsData.filter((n: any) => !n.isRead) : [];

    const handleLogout = () => { 
        MySwal.fire({
            html: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: 'var(--color-error)' }}>
                        <LogOut size={48} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Keluar Akun?</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Apakah kamu yakin ingin keluar dari akun ini?</p>
                </div>
            ),
            showCancelButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-outline',
                actions: 'swal2-actions-custom'
            },
            confirmButtonText: "Ya, Keluar",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        });
    };

    // Variabel penentu: Apakah user sudah punya grup atau belum?
    const hasGroups = user?.memberships && user.memberships.length > 0;

    return (
        <div style={{ display: 'flex' }}>
            {/* --- KONTEN UTAMA --- */}
            <div className="app-main-content" style={{ minHeight: '100vh', backgroundColor: 'var(--color-dashboard-bg)', display: 'flex', flexDirection: 'column' }}>
            {/* --- HERO HEADER: PROFIL --- */}
            <div style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Bagian Kiri: Profil & Nama */}
                    <div 
                        onClick={() => navigate('/profile')} 
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', maxWidth: '70%' }}
                        title="Buka Profil"
                    >
                        {isLoading ? (
                            <Skeleton circle width={48} height={48} />
                        ) : (
                            <Avatar 
                                name={user?.name || 'Sobat'} 
                                imageUrl={user?.avatarUrl} 
                                size={48} 
                                backgroundColor="var(--color-surface)"
                                textColor="var(--color-primary)"
                            />
                        )}
                        {isLoading ? (
                            <Skeleton width={150} height={24} />
                        ) : (
                            <h1 style={{ fontSize: '1.5rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-header-text)' }}>
                                {user?.name || 'Sobat'}
                            </h1>
                        )}
                    </div>
                    
                    {/* Bagian Kanan: Toggle Tema, Inbox & Logout */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {/* TOGGLE TEMA */}
                        <div 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                            onClick={toggleThemeQuick} 
                            title={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                        >
                            {isDark ? <Sun size={24} color="var(--color-header-icon)" /> : <Moon size={24} color="var(--color-header-icon)" />}
                        </div>

                        {/* INBOX */}
                        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/notifications')} title="Kotak Masuk">
                            <Inbox size={24} color="var(--color-header-icon)" />
                            {notifications.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-10px',
                                    backgroundColor: 'var(--color-error)', color: 'white',
                                    borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {notifications.length}
                                </span>
                            )}
                        </div>
                        
                        {/* LOGOUT */}
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleLogout} title="Keluar">
                            <LogOut size={24} color="#fca5a5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KONTEN UTAMA: SIRKEL --- */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 7rem 1.5rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    marginTop: '-2rem', /* Naik ke atas agar menimpa bg biru */
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    boxShadow: 'var(--shadow-lg)',
                    flex: 1 /* Memaksa kartu putih stretch tapi tetap ada jarak di bawah */
                }}>
                    {/* KONDISI 1: JIKA SEDANG LOADING */}
                    {isLoading ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <Skeleton width={150} height={28} />
                            </div>
                            <SkeletonList count={3} />
                        </div>
                    ) : !hasGroups ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <h2 style={{ marginBottom: '1rem' }}>Kamu belum memiliki Sirkel</h2>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                                Buat sirkel baru untuk mulai patungan, atau bergabung ke sirkel temanmu menggunakan kode undangan.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => navigate('/create-group')}>
                                    <Plus size={20} /> Buat Sirkel Baru
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* KONDISI 2: JIKA SUDAH PUNYA GRUP */
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Sirkel Saya</h2>
                                {/* Tombol buat/gabung dihapus, dipindah ke Bottom Nav Bar */}
                            </div>
                            
                            {/* DAFTAR GRUP YANG DIMILIKI */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.memberships.map((membership: any) => (
                                    <div key={membership.group.id} style={{
                                        padding: '1.25rem',
                                        backgroundColor: 'var(--color-background)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-text-main)' }}>{membership.group.name}</h3>
                                            <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Peranmu: {membership.role}</p>
                                            {membership.hasUnpaidDebt && (
                                                <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <AlertTriangle size={14} /> Ada utang belum lunas
                                                </p>
                                            )}
                                        </div>
                                        <Button onClick={() => navigate('/groups/' + membership.group.id + '/expenses')}>Buka Sirkel</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div> {/* END app-main-content */}

            {/* --- RESPONSIVE NAVIGATION BAR (BOTTOM / SIDEBAR) --- */}
            <nav className="app-nav-bar">
                {/* Home */}
                <div className="app-nav-item" style={{ color: 'var(--color-primary)' }} onClick={() => navigate('/dashboard')}>
                    <Home size={24} />
                    <span className="app-nav-text">Beranda</span>
                </div>

                {/* Center FAB (Buat/Gabung) */}
                <div className="app-nav-fab-wrapper">
                    <div className="app-nav-fab" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={32} />
                    </div>
                </div>

                {/* Settings / Profile */}
                <div className="app-nav-item" style={{ color: 'var(--color-text-muted)' }} onClick={() => navigate('/profile')}>
                    <Settings size={24} />
                    <span className="app-nav-text">Pengaturan</span>
                </div>
            </nav>

            {/* --- MODAL TAMBAH SIRKEL (BOTTOM SHEET) --- */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }} onClick={() => setIsAddModalOpen(false)}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)', padding: '2rem',
                        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                        animation: 'slideUp 0.3s ease-out', paddingBottom: '3rem'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: '40px', height: '5px', backgroundColor: 'var(--color-border)', borderRadius: '10px', margin: '0 auto 1.5rem auto' }}></div>
                        <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.25rem' }}>Pilih Aksi</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Button onClick={() => { setIsAddModalOpen(false); navigate('/create-group'); }} style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Plus size={20} /> Buat Sirkel Baru
                            </Button>
                            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); navigate('/join-group'); }} style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Users size={20} /> Gabung Sirkel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
