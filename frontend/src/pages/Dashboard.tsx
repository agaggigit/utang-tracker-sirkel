import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Inbox, LogOut, Home, Settings, Plus, Users, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonList, Skeleton } from '../components/ui/Skeleton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../contexts/ThemeContext';
import type { Notification, GroupMembership } from '../types';

const MySwal = withReactContent(Swal);

export const Dashboard = () => {
    const navigate = useNavigate();
    const { isDark, toggleThemeQuick } = useTheme();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { useProfile } = useAuth();
    const { useGeneralNotifs } = useNotifications();

    const { data: user, isLoading: isLoadingUser } = useProfile();
    const { data: notificationsData, isLoading: isLoadingNotif } = useGeneralNotifs();

    const isLoading = isLoadingUser || isLoadingNotif;
    const notifications = notificationsData ? notificationsData.filter((n: Notification) => !n.isRead) : [];

    const handleLogout = () => { 
        MySwal.fire({
            html: (
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="p-4 bg-error-bg rounded-full text-error">
                        <LogOut size={48} />
                    </div>
                    <h2 className="m-0 text-xl font-bold text-text-main">Keluar Akun?</h2>
                    <p className="m-0 text-[0.95rem] text-text-muted">Apakah kamu yakin ingin keluar dari akun ini?</p>
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
        <div className="flex">
            {/* --- KONTEN UTAMA --- */}
            <div className="w-full transition-[padding-left] duration-300 md:pl-[240px] min-h-screen bg-[rgb(var(--color-dashboard-bg))] flex flex-col">
            {/* --- HERO HEADER: PROFIL --- */}
            <div className="pt-8 px-6 pb-16">
                <div className="max-w-[800px] mx-auto flex justify-between items-center">
                    {/* Bagian Kiri: Profil & Nama */}
                    <div 
                        onClick={() => navigate('/profile')} 
                        className="flex items-center gap-4 cursor-pointer max-w-[70%]"
                        title="Buka Profil"
                    >
                        {isLoading ? (
                            <Skeleton circle width={48} height={48} />
                        ) : (
                            <Avatar 
                                name={user?.name || 'Sobat'} 
                                imageUrl={user?.avatarUrl} 
                                size={48} 
                                backgroundColor="rgb(var(--color-surface))"
                                textColor="rgb(var(--color-primary))"
                            />
                        )}
                        {isLoading ? (
                            <Skeleton width={150} height={24} />
                        ) : (
                            <h1 className="text-2xl m-0 whitespace-nowrap overflow-hidden text-ellipsis text-[rgb(var(--color-header-text))] font-bold">
                                {user?.name || 'Sobat'}
                            </h1>
                        )}
                    </div>
                    
                    {/* Bagian Kanan: Toggle Tema, Inbox & Logout */}
                    <div className="flex gap-6 items-center">
                        {/* TOGGLE TEMA */}
                        <div 
                            className="cursor-pointer flex items-center" 
                            onClick={toggleThemeQuick} 
                            title={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                        >
                            {isDark ? <Sun size={24} color="rgb(var(--color-header-icon))" /> : <Moon size={24} color="rgb(var(--color-header-icon))" />}
                        </div>

                        {/* INBOX */}
                        <div className="relative cursor-pointer flex items-center" onClick={() => navigate('/notifications')} title="Kotak Masuk">
                            <Inbox size={24} color="rgb(var(--color-header-icon))" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-error text-white rounded-full px-1.5 py-0.5 text-xs font-bold shadow-sm">
                                    {notifications.length}
                                </span>
                            )}
                        </div>
                        
                        {/* LOGOUT */}
                        <div className="cursor-pointer flex items-center" onClick={handleLogout} title="Keluar">
                            <LogOut size={24} color="#fca5a5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KONTEN UTAMA: SIRKEL --- */}
            <div className="max-w-[800px] mx-auto px-6 pb-28 w-full flex-1 flex flex-col">
                <div className="-mt-8 bg-surface rounded-[24px] p-8 shadow-sm flex-1">
                    {/* KONDISI 1: JIKA SEDANG LOADING */}
                    {isLoading ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <Skeleton width={150} height={28} />
                            </div>
                            <SkeletonList count={3} />
                        </div>
                    ) : !hasGroups ? (
                        <div className="text-center py-8 px-4">
                            <h2 className="mb-4 text-xl font-bold">Kamu belum memiliki Sirkel</h2>
                            <p className="text-text-muted mb-8">
                                Buat sirkel baru untuk mulai patungan, atau bergabung ke sirkel temanmu menggunakan kode undangan.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button className="px-8 py-4 text-lg flex gap-2 items-center" onClick={() => navigate('/create-group')}>
                                    <Plus size={20} /> Buat Sirkel Baru
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* KONDISI 2: JIKA SUDAH PUNYA GRUP */
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="m-0 text-[1.4rem] font-bold">Sirkel Saya</h2>
                                {/* Tombol buat/gabung dihapus, dipindah ke Bottom Nav Bar */}
                            </div>
                            
                            {/* DAFTAR GRUP YANG DIMILIKI */}
                            <div className="flex flex-col gap-4">
                                {user?.memberships?.map((membership: GroupMembership & { role: string; hasUnpaidDebt?: boolean }) => (
                                    <div key={membership.group?.id} className="p-5 bg-surface border border-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow gap-4 sm:gap-0">
                                        <div>
                                            <h3 className="m-0 text-[1.15rem] font-bold text-text-main">{membership.group?.name || 'Grup'}</h3>
                                            <p className="m-0 mt-1 text-[0.85rem] text-text-muted">Peranmu: {membership.role}</p>
                                            {membership.hasUnpaidDebt && (
                                                <p className="m-0 mt-1 text-[0.85rem] text-error font-bold flex items-center gap-1">
                                                    <AlertTriangle size={14} /> Ada utang belum lunas
                                                </p>
                                            )}
                                        </div>
                                        <Button className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base" onClick={() => membership.group?.id && navigate('/groups/' + membership.group.id + '/expenses')}>Buka Sirkel</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div> {/* END app-main-content */}

            {/* --- RESPONSIVE NAVIGATION BAR (BOTTOM / SIDEBAR) --- */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] bg-surface border-t border-border flex justify-around items-center pt-2 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[100] transition-all duration-300 md:top-0 md:left-0 md:bottom-0 md:w-[240px] md:h-screen md:transform-none md:border-t-0 md:border-r md:flex-col md:justify-start md:py-8 md:shadow-md">
                {/* Home */}
                <div className="flex flex-col items-center cursor-pointer flex-1 md:flex-row md:w-full md:py-4 md:px-8 md:gap-4 md:flex-none md:justify-start hover:bg-background text-primary" onClick={() => navigate('/dashboard')}>
                    <Home size={24} />
                    <span className="text-xs font-semibold mt-1 md:text-base md:mt-0">Beranda</span>
                </div>

                {/* Center FAB (Buat/Gabung) */}
                <div className="flex-1 flex justify-center md:w-full md:py-4 md:px-6 md:flex-none md:mb-8 md:-order-1">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-3xl -translate-y-5 shadow-lg cursor-pointer border-4 border-primary transition-all duration-200 md:w-full md:rounded-xl md:h-12 md:transform-none md:border-none md:text-xl md:gap-2 after:md:content-['Sirkel_Baru'] after:md:text-base after:md:font-semibold" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={32} />
                    </div>
                </div>

                {/* Settings / Profile */}
                <div className="flex flex-col items-center cursor-pointer flex-1 md:flex-row md:w-full md:py-4 md:px-8 md:gap-4 md:flex-none md:justify-start hover:bg-background text-text-muted" onClick={() => navigate('/profile')}>
                    <Settings size={24} />
                    <span className="text-xs font-semibold mt-1 md:text-base md:mt-0">Pengaturan</span>
                </div>
            </nav>

            {/* --- MODAL TAMBAH SIRKEL (BOTTOM SHEET) --- */}
            {isAddModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[999] flex flex-col justify-end"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div 
                        className="bg-surface p-8 rounded-t-[24px] pb-12 animate-[slideUp_0.3s_ease-out]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-6"></div>
                        <h3 className="m-0 mb-6 text-center text-xl font-bold">Pilih Aksi</h3>
                        <div className="flex flex-col gap-4">
                            <Button onClick={() => { setIsAddModalOpen(false); navigate('/create-group'); }} className="p-4 text-lg justify-center flex gap-2 items-center">
                                <Plus size={20} /> Buat Sirkel Baru
                            </Button>
                            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); navigate('/join-group'); }} className="p-4 text-lg justify-center flex gap-2 items-center">
                                <Users size={20} /> Gabung Sirkel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
