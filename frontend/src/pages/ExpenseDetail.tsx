import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Clock, AlertTriangle, Calendar, Wallet, Edit2, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Menyiapkan tipe data yang sesuai dengan balikan API
interface ExpenseDetailData {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    groupId: string;
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
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [expense, setExpense] = useState<ExpenseDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // --- POLA PIKIR STATE MODAL (LANGKAH 2 & 3) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setCurrentUserId(JSON.parse(atob(token.split('.')[1])).userId);
        }

        const fetchDetail = async () => {
            try {
                const response = await fetch(`http://localhost:3000/expenses/${expenseId}`, {
                    headers: { 'Authorization': `Bearer ${token || ''}` }
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

    // --- HANDLER HAPUS TAGIHAN ---
    const handleDelete = async () => {
        const result = await MySwal.fire({
            html: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: 'var(--color-error)' }}>
                        <Trash2 size={48} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Hapus Tagihan?</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Apakah kamu yakin ingin menghapus tagihan ini? (Tindakan ini tidak bisa dibatalkan)</p>
                </div>
            ),
            showCancelButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-outline',
                actions: 'swal2-actions-custom'
            },
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghapus');
            toast.success('Tagihan berhasil dihapus!');
            navigate(`/groups/${expense?.groupId}/expenses`, { replace: true });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle kondisi layar saat sedang memuat atau terjadi error
    if (isLoading) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><Clock size={20} /> Memuat detail...</p></div>;
    if (errorMsg) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><AlertTriangle size={20} /> {errorMsg}</p></div>;
    if (!expense) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem'}}>Data tidak ditemukan</p></div>;

    // --- POLA PIKIR LOGIKA AKSI (LANGKAH 3) ---
    // Cek apakah 'saya' (current user) ada di daftar utang dan belum lunas
    const myShare = expense.shares.find(s => s.userId === currentUserId);
    // Jika saya yang menalangi (paidBy === currentUserId), saya tidak perlu bayar diri saya sendiri
    const amIInvolvedAndUnpaid = myShare && !myShare.isPaid && expense.paidBy !== currentUserId;

    // Logika untuk Penombok (User yang membayar tagihan ini)
    const amIThePayer = expense.paidBy === currentUserId;
    const hasPaidShares = expense.shares.some(s => s.isPaid && s.userId !== expense.paidBy);

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
                    'Authorization': `Bearer ${token || ''}`
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
                toast.error(`Gagal: ${data.message}`);
            }
        } catch (err) {
            toast.error('Terjadi kesalahan jaringan saat mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ margin: 0 }}>Detail Tagihan</h2>
                </div>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
                <div className="expense-detail-layout" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    
                    <div className="expense-detail-info">
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{expense.description}</h1>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Grup: <strong>{expense.group.name}</strong></p>
                                    <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} /> {new Date(expense.expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Tagihan</p>
                                    <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h2>
                                </div>
                            </div>
                        </div>

                        {/* --- TOMBOL AKSI ATAU STATUS PENDING (LANGKAH 3) --- */}
                        {amIInvolvedAndUnpaid && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                {isPending ? (
                                    <div style={{ padding: '1rem 2rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', border: '1px solid #fde68a', fontWeight: 'bold', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Clock size={20} /> Menunggu Konfirmasi Penombok
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => setIsModalOpen(true)} 
                                        style={{ width: '100%', padding: '0.75rem 2rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Wallet size={20} /> Ajukan Pembayaran ke {expense.paidByUser.name}
                                    </Button>
                                )}
                            </div>
                        )}
                        {/* TOMBOL EDIT DAN HAPUS UNTUK PENOMBOK */}
                        {amIThePayer && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button 
                                    variant="outline" 
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => navigate(`/expenses/${expenseId}/edit`)}
                                >
                                    <Edit2 size={18} /> Edit Tagihan
                                </Button>
                                {!hasPaidShares ? (
                                    <Button 
                                        style={{ flex: 1, backgroundColor: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Menghapus...' : <><Trash2 size={18} /> Hapus</>}
                                    </Button>
                                ) : (
                                    <div style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                        (Hapus dimatikan)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* --- POLA PIKIR UI LIST ORANG (LANGKAH 3) --- */}
                    <div className="expense-detail-list">
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
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>Ditalangi Sendiri</span>
                                        ) : share.isPaid ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-primary)', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '12px' }}><CheckCircle size={12} /> Lunas</span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-error)', backgroundColor: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '12px' }}><XCircle size={12} /> Belum Bayar</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>
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
