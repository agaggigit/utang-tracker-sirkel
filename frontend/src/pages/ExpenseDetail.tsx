import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

// Menyiapkan tipe data yang sesuai dengan balikan API
interface ExpenseDetailData {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    paidBy: string; // ID user yang menalangi
    paidByUser: { name: string, email: string };
    group: { name: string };
    shares: {
        id: string;
        userId: string;
        shareAmount: string;
        isPaid: boolean;
        user: { name: string, email: string };
        payments?: { status: string }[];
    }[];
}

export const ExpenseDetail = () => {
    // --- POLA PIKIR KERANGKA HALAMAN (LANGKAH 2) ---
    // Mengambil parameter ':id' dari URL browser
    const { id: expenseId } = useParams();
    const navigate = useNavigate();

    // Mengambil ID user yang sedang login dari JWT Token
    const token = localStorage.getItem('token');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

    const [expense, setExpense] = useState<ExpenseDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- POLA PIKIR STATE MODAL (LANGKAH 2 & 3) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                // Panggil API getExpenseDetail yang baru dibuat di Langkah 1
                const response = await fetch(`http://localhost:3000/expenses/${expenseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setExpense(data);
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Gagal memuat detail tagihan');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [expenseId]);

    // Handle kondisi layar saat sedang memuat atau terjadi error
    if (isLoading) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem'}}>⏳ Memuat detail...</p></div>;
    if (errorMsg) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--color-error)'}}>⚠️ {errorMsg}</p></div>;
    if (!expense) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem'}}>Data tidak ditemukan</p></div>;

    // --- POLA PIKIR LOGIKA AKSI (LANGKAH 3) ---
    // Cek apakah 'saya' (current user) ada di daftar utang dan belum lunas
    const myShare = expense.shares.find(s => s.userId === currentUserId);
    // Jika saya yang menalangi (paidBy === currentUserId), saya tidak perlu bayar diri saya sendiri
    const amIInvolvedAndUnpaid = myShare && !myShare.isPaid && expense.paidBy !== currentUserId;

    // Cek apakah utang saya ini sedang dalam status diajukan (pending)
    const isPending = myShare?.payments?.some(p => p.status === 'pending');

    const handleSubmitPayment = async () => {
        if (!myShare) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    expenseShareId: myShare.id,
                    note: paymentNote
                })
            });

            if (response.ok) {
                // Tutup modal dan bersihkan input
                setIsModalOpen(false);
                setPaymentNote('');
                
                // Ubah state lokal agar tulisan "Menunggu Konfirmasi" langsung muncul tanpa refresh halaman
                setExpense(prev => {
                    if (!prev) return prev;
                    const updatedShares = prev.shares.map(s => {
                        if (s.id === myShare.id) {
                            return { ...s, payments: [...(s.payments || []), { status: 'pending' }] };
                        }
                        return s;
                    });
                    return { ...prev, shares: updatedShares };
                });
            } else {
                const data = await response.json();
                alert(`Gagal: ${data.message}`);
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan saat mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <Button variant="outline" onClick={() => navigate(-1)}>&larr; Kembali</Button>
                <h2>Detail Tagihan</h2>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{expense.description}</h1>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Grup: <strong>{expense.group.name}</strong></p>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>📅 {new Date(expense.expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Tagihan</p>
                            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h2>
                        </div>
                    </div>
                    
                    {/* --- POLA PIKIR UI LIST ORANG (LANGKAH 3) --- */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ margin: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            Ditalangi oleh: <span style={{ color: 'var(--color-primary)' }}>{expense.paidByUser.name}</span>
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {expense.shares.map(share => (
                                <div key={share.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                                        {/* Avatar Bawaan (Huruf Depan Nama) */}
                                        <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {share.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {share.userId === currentUserId && <span style={{color: 'var(--color-primary)', fontWeight: 'normal', fontSize: '0.85rem', marginRight: '0.25rem'}}>(Kamu)</span>} {share.user.name}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{share.user.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>Rp {Number(share.shareAmount).toLocaleString('id-ID')}</p>
                                        {share.userId === expense.paidBy ? (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>Ditalangi Sendiri</span>
                                        ) : share.isPaid ? (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-primary)', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>✅ Lunas</span>
                                        ) : (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-error)', backgroundColor: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>❌ Belum Bayar</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- TOMBOL AKSI ATAU STATUS PENDING (LANGKAH 3) --- */}
                    {amIInvolvedAndUnpaid && (
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                            {isPending ? (
                                <div style={{ padding: '1rem 2rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', border: '1px solid #fde68a', fontWeight: 'bold' }}>
                                    ⏳ Menunggu Konfirmasi Penombok
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => setIsModalOpen(true)} 
                                    style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}
                                >
                                    💸 Ajukan Pembayaran ke {expense.paidByUser.name}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* --- POLA PIKIR UI MODAL POP-UP (LANGKAH 2) --- */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ margin: 0, marginBottom: '1rem' }}>Ajukan Pembayaran</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Beri tahu <strong>{expense.paidByUser.name}</strong> kalau kamu sudah mentransfer uangnya.
                        </p>
                        
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Catatan (Opsional)</label>
                        <textarea 
                            className="input-field"
                            rows={3}
                            placeholder="Misal: Udah kutransfer via GoPay ya brok!"
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                                Batal
                            </Button>
                            <Button onClick={handleSubmitPayment} disabled={isSubmitting}>
                                {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
