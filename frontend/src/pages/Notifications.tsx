import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Notifications = () => {
    const navigate = useNavigate();
    const [joinRequests, setJoinRequests] = useState<any[]>([]);
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
                
                // Fetch kedua API secara paralel
                const [joinRes, paymentRes] = await Promise.all([
                    fetch('http://localhost:3000/notifications/join-requests', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:3000/payments/incoming', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (joinRes.ok && paymentRes.ok) {
                    const joinData = await joinRes.json();
                    const paymentData = await paymentRes.json();
                    setJoinRequests(joinData);
                    setIncomingPayments(paymentData);
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

    const hasNoNotifications = joinRequests.length === 0 && incomingPayments.length === 0;

    // --- LOGIKA AKSI APPROVE & REJECT (LANGKAH 3) ---
    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedPayment) return;
        
        if (action === 'reject' && !rejectionNote.trim()) {
            // Sesuai kesepakatan, kita paksa isi catatan khusus untuk reject
            alert("Harap masukkan alasan penolakan!");
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
            } else {
                const data = await response.json();
                alert(`Gagal: ${data.message}`);
            }
        } catch (err) {
            alert("Terjadi kesalahan jaringan.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        ⏳ Memuat notifikasi...
                    </div>
                ) : errorMsg ? (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', textAlign: 'center' }}>
                        ⚠️ {errorMsg}
                    </div>
                ) : hasNoNotifications ? (
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
                                        fontWeight: 'bold', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)'
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
                                        fontWeight: 'bold', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)'
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
                            
                            <Button onClick={() => handleAction('reject')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-error)', border: 'none', color: 'white' }}>
                                ❌ Tolak
                            </Button>

                            <Button onClick={() => handleAction('approve')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
                                ✅ Terima
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
