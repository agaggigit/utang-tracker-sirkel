import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/notifications/join-requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    setNotifications(data);
                } else {
                    throw new Error(data.message || 'Gagal mengambil notifikasi');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="outline" onClick={() => navigate(-1)}>&larr; Kembali</Button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Notifikasi 🔔</h1>
            </div>

            {/* List Notifikasi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        Memuat notifikasi...
                    </div>
                ) : errorMsg ? (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', textAlign: 'center' }}>
                        ⚠️ {errorMsg}
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem 2rem', 
                        backgroundColor: 'var(--color-surface)', 
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', margin: 0 }}>
                            Hore! Belum ada notifikasi baru saat ini. 🎉
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id} style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '1.25rem 1.5rem', 
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)', 
                            border: '1px solid var(--color-border)', 
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Avatar */}
                                <div style={{ 
                                    width: '48px', height: '48px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'var(--color-primary)', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {notif.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{notif.user.name}</span> ingin bergabung ke sirkel <span style={{ fontWeight: '600' }}>{notif.group.name}</span>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(notif.requestedAt).toLocaleDateString('id-ID', { 
                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Button onClick={() => navigate(`/groups/${notif.groupId}`)}>
                                    Buka Sirkel
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
