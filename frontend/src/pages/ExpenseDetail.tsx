import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

// Menyiapkan tipe data yang sesuai dengan balikan API
interface ExpenseDetailData {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    paidByUser: { name: string, email: string };
    group: { name: string };
    shares: {
        id: string;
        userId: string;
        shareAmount: string;
        isPaid: boolean;
        user: { name: string, email: string };
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
    const amIInvolvedAndUnpaid = myShare && !myShare.isPaid;

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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {/* Avatar Bawaan (Huruf Depan Nama) */}
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {share.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>
                                                {share.user.name} {share.userId === currentUserId && <span style={{color: 'var(--color-primary)', fontWeight: 'normal', fontSize: '0.85rem'}}>(Kamu)</span>}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{share.user.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>Rp {Number(share.shareAmount).toLocaleString('id-ID')}</p>
                                        {share.isPaid ? (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-primary)', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>✅ Lunas</span>
                                        ) : (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-error)', backgroundColor: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>❌ Belum Bayar</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- TOMBOL AKSI JIKA BELUM BAYAR (LANGKAH 3) --- */}
                    {amIInvolvedAndUnpaid && (
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                onClick={() => alert("Fitur segera datang! (Lanjut ke Issue #12 ya!)")} 
                                style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}
                            >
                                💸 Ajukan Pembayaran ke {expense.paidByUser.name}
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
