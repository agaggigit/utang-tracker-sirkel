import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Inbox, Check, Clock, AlertTriangle, PartyPopper, Info, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Notifications = () => {
    const navigate = useNavigate();
    const [joinRequests, setJoinRequests] = useState<any[]>([]);
    const [incomingPayments, setIncomingPayments] = useState<any[]>([]);
    const [generalNotifs, setGeneralNotifs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- STATE UNTUK MODAL REVIEW (LANGKAH 3) ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Fetch ketiga API secara paralel
                const [joinRes, paymentRes, notifRes] = await Promise.all([
                    fetch('http://localhost:3000/notifications/join-requests', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:3000/payments/incoming', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:3000/notifications', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (joinRes.ok && paymentRes.ok && notifRes.ok) {
                    const joinData = await joinRes.json();
                    const paymentData = await paymentRes.json();
                    const notifData = await notifRes.json();
                    setJoinRequests(joinData);
                    setIncomingPayments(paymentData);
                    setGeneralNotifs(notifData);
                } else {
                    throw new Error('Gagal mengambil notifikasi');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const hasNoNotifications = joinRequests.length === 0 && incomingPayments.length === 0 && generalNotifs.length === 0;

    // --- LOGIKA READ NOTIFIKASI (LANGKAH 4) ---
    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setGeneralNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setGeneralNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    // --- LOGIKA AKSI APPROVE & REJECT (LANGKAH 3) ---
    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedPayment) return;
        
        if (action === 'reject' && !rejectionNote.trim()) {
            // Sesuai kesepakatan, kita paksa isi catatan khusus untuk reject
            toast.error("Harap masukkan alasan penolakan!");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/payments/${selectedPayment.id}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: action === 'reject' ? JSON.stringify({ rejectionNote }) : JSON.stringify({})
            });

            if (response.ok) {
                // Hapus payment dari daftar lokal secara reaktif
                setIncomingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
                setIsReviewModalOpen(false);
                setRejectionNote('');
                setSelectedPayment(null);
                toast.success('Aksi berhasil!');
            } else {
                const data = await response.json();
                toast.error(`Gagal: ${data.message}`);
            }
        } catch (err) {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Kotak Masuk <Inbox size={24} /></h1>
                </div>
                {generalNotifs.some(n => !n.isRead) && (
                    <button 
                        onClick={markAllAsRead} 
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={16} /> Tandai Semua Dibaca</span>
                    </button>
                )}
            </div>

            {/* List Pesan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Memuat pesan...
                    </div>
                ) : errorMsg ? (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} /> {errorMsg}
                    </div>
                ) : hasNoNotifications ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem 2rem', 
                        backgroundColor: 'var(--color-surface)', 
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            Hore! Belum ada pesan baru saat ini. <PartyPopper size={20} />
                        </p>
                    </div>
                ) : (
                    <>
                        {/* --- LIST PENGAJUAN PEMBAYARAN (LANGKAH 2) --- */}
                        {incomingPayments.map((payment) => (
                            <div key={payment.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1.25rem 1.5rem', backgroundColor: '#fefce8', 
                                borderRadius: 'var(--radius-lg)', border: '1px solid #fde047', 
                                boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eab308', 
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontWeight: 'bold', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)', flexShrink: 0
                                    }}>
                                        {payment.from.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '1rem' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{payment.from.name}</span> mengajukan pelunasan untuk <span style={{ fontWeight: '600' }}>{payment.expenseShare.expense.description}</span>
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#854d0e', marginTop: '0.25rem', fontWeight: 'bold' }}>
                                            Sebesar Rp {Number(payment.amount).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => {
                                        setSelectedPayment(payment);
                                        setIsReviewModalOpen(true);
                                    }} style={{ backgroundColor: '#eab308', color: '#fff', border: 'none' }}>
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* --- LIST JOIN REQUESTS (YANG SUDAH ADA SEBELUMNYA) --- */}
                        {joinRequests.map((notif) => (
                            <div key={notif.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1.25rem 1.5rem', backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', 
                                boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', 
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontWeight: 'bold', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)', flexShrink: 0
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
                        ))}

                        {/* --- LIST NOTIFIKASI UMUM (LANGKAH 4) --- */}
                        {generalNotifs.map((notif) => (
                            <div key={notif.id} 
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1.25rem 1.5rem', 
                                backgroundColor: notif.isRead ? 'transparent' : '#f0f9ff',
                                borderRadius: 'var(--radius-lg)', 
                                border: '1px solid',
                                borderColor: notif.isRead ? 'var(--color-border)' : '#bae6fd', 
                                boxShadow: notif.isRead ? 'none' : 'var(--shadow-sm)', 
                                transition: 'all 0.2s ease',
                                cursor: notif.isRead ? 'default' : 'pointer',
                                opacity: notif.isRead ? 0.7 : 1
                            }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', 
                                    backgroundColor: notif.isRead ? 'var(--color-border)' : '#38bdf8', 
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: '1rem', flexShrink: 0
                                }}>
                                    <Info size={20} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                                        {notif.message}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { 
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!notif.isRead && <div style={{ marginLeft: 'auto', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0ea5e9', flexShrink: 0 }}></div>}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* --- MODAL REVIEW PEMBAYARAN (LANGKAH 3) --- */}
            {isReviewModalOpen && selectedPayment && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ margin: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Review Pembayaran</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Pengirim:</strong> {selectedPayment.from.name} ({selectedPayment.from.email})</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Untuk:</strong> {selectedPayment.expenseShare.expense.description} (Grup: {selectedPayment.expenseShare.expense.group.name})</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Nominal:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp {Number(selectedPayment.amount).toLocaleString('id-ID')}</span></p>
                            
                            {selectedPayment.note && (
                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                    "{selectedPayment.note}"
                                </div>
                            )}
                        </div>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Catatan Penolakan <br/>
                            <span style={{fontWeight:'normal', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>(Opsional jika Approve, <span style={{color:'var(--color-error)'}}>Wajib jika Reject</span>)</span>
                        </label>
                        <textarea 
                            className="input-field"
                            rows={2}
                            placeholder="Misal: Uangnya kurang 50rb bos!"
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => {
                                setIsReviewModalOpen(false);
                                setRejectionNote('');
                                setSelectedPayment(null);
                            }} disabled={isSubmitting}>
                                Batal
                            </Button>
                            
                            <Button onClick={() => handleAction('reject')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-error)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <X size={18} /> Tolak
                            </Button>

                            <Button onClick={() => handleAction('approve')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Check size={18} /> Terima
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
