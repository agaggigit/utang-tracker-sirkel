import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setUser(data);
                }
            } catch (err) {
                console.error("Gagal mengambil data profil", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();

        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }  
                });
                const data = await response.json();
                if (response.ok) {
                    // Hanya hitung yang belum dibaca (isRead === false)
                    const unread = data.filter((n: any) => !n.isRead);
                    setNotifications(unread);
                }
            } catch (error) {
                console.error("Gagal mengambil notifikasi", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleLogout = () => { 
        localStorage.removeItem('token');
        navigate('/login')
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>;
    }

    // Variabel penentu: Apakah user sudah punya grup atau belum?
    const hasGroups = user?.memberships && user.memberships.length > 0;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Dashboard (Tetap di atas) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Halo, {user?.name || 'Sobat'}! 👋</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" onClick={() => navigate('/profile')}>Profil</Button>
                    <Button variant="outline" onClick={handleLogout}>Keluar</Button>
                </div>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                    <span style={{ fontSize: '1.5rem' }}>🔔</span>
                    
                    {/* Jika ada antrean, munculkan bulatan merah angka antrean! */}
                    {notifications.length > 0 && (
                        <span style={{
                            position: 'absolute', top: '-5px', right: '-10px',
                            backgroundColor: 'var(--color-error)', color: 'white',
                            borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                            {notifications.length}
                        </span>
                    )}
                </div>
            </div>
            {/* KONDISI 1: JIKA BELUM PUNYA GRUP SAMA SEKALI */}
            {!hasGroups ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem', 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>Kamu belum memiliki Sirkel</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                        Buat sirkel baru untuk mulai patungan, atau bergabung ke sirkel temanmu menggunakan kode undangan.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* TOMBOL BESAR DI TENGAH */}
                        <Button style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/create-group')}>
                            ➕ Buat Sirkel Baru
                        </Button>
                        
                        <Button variant="outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/join-group')}>
                            🤝 Gabung Sirkel
                        </Button>
                    </div>
                </div>
            ) : (
                /* KONDISI 2: JIKA SUDAH PUNYA GRUP */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Sirkel Saya</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {/* TOMBOL KECIL (TIDAK DISTRACTING) DI KANAN ATAS */}
                            <Button variant="outline" onClick={() => navigate('/create-group')}>+ Buat</Button>
                            <Button variant="outline" onClick={() => navigate('/join-group')}>+ Gabung</Button>
                        </div>
                    </div>
                    {/* DAFTAR GRUP YANG DIMILIKI */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user.memberships.map((membership: any) => (
                            <div key={membership.group.id} style={{
                                padding: '1.5rem',
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>{membership.group.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Peranmu: {membership.role}</p>
                                </div>
                                <Button onClick={() => navigate('/groups/' + membership.group.id + '/expenses')}>Buka Sirkel</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
