import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

// Tipe data berdasarkan struktur Schema Database
interface ExpenseShare {
    id: string;
    userId: string;
    shareAmount: string; // Biasanya Decimal dari backend datang dalam bentuk string
    isPaid: boolean;
}

interface Expense {
    id: string;
    description: string;
    totalAmount: string; // Decimal
    expenseDate: string;
    paidBy: string;
    paidByUser?: {
        name: string;
    };
    shares: ExpenseShare[];
}

// --- POLA PIKIR RINGKASAN UTANG (LANGKAH 2) ---
interface BalanceData {
    totalIOwe: number;
    totalOwedToMe: number;
    iOwe: { userId: string, name: string, amount: number }[];
    owedToMe: { userId: string, name: string, amount: number }[];
}

// --- HELPER FORMAT TANGGAL ---
const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const GroupExpenses = () => {
    const { id: groupId } = useParams();
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- POLA PIKIR RINGKASAN UTANG (LANGKAH 2) ---
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);

    // --- POLA PIKIR MODAL RINGKASAN (LANGKAH 3) ---
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

    // --- POLA PIKIR PAGINATION & INFINITE SCROLL (LANGKAH 2) ---
    // 1. State Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Penanda apakah di database masih ada sisa data
    const [isFetchingMore, setIsFetchingMore] = useState(false); // Penanda loading saat nge-scroll

    // --- POLA PIKIR FITUR KRONOLOGIS & STATUS (LANGKAH 3) ---
    const [filterDate, setFilterDate] = useState('');
    
    // Mengambil ID user yang sedang login dari JWT Token untuk mengecek status lunas
    const token = localStorage.getItem('token');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

    // Handler ketika tanggal kalender dipilih
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(e.target.value);
        setPage(1); // Reset kembali ke halaman 1
        setExpenses([]); // Kosongkan layar
        setHasMore(true);
    };

    // --- POLA PIKIR RINGKASAN UTANG (LANGKAH 2) ---
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/groups/${groupId}/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBalanceData(data);
                }
            } catch (err) {
                console.error("Gagal memuat saldo grup", err);
            } finally {
                setIsBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [groupId]);

    // 2. Fungsi Fetch Data
    useEffect(() => {
        const fetchExpenses = async () => {
            // Jika memuat halaman 1, pakai loading utama. Jika halaman 2 dst, pakai loading kecil di bawah.
            if (page === 1) setIsLoading(true);
            else setIsFetchingMore(true);

            try {
                const token = localStorage.getItem('token');
                // Perhatikan penambahan filter date pada URL jika user memilih dari kalender
                let url = `http://localhost:3000/groups/${groupId}/expenses?page=${page}&limit=10`;
                if (filterDate) {
                    url += `&date=${filterDate}`;
                }

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Jika backend mengembalikan kurang dari 10 data, berarti kita sudah mencapai akhir/habis
                    if (data.length < 10) setHasMore(false);
                    
                    if (page === 1) {
                        setExpenses(data); // Timpa data lama (reset)
                    } else {
                        // Gabungkan: [Data Lama 1-10] + [Data Baru 11-20]
                        setExpenses(prev => [...prev, ...data]);
                    }
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Gagal mengambil tagihan');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
                setIsFetchingMore(false);
            }
        };

        fetchExpenses();
    }, [groupId, page, filterDate]); // Efek ini akan berjalan setiap kali 'page' atau 'filterDate' berubah!

    // 3. Deteksi Ujung Bawah Layar (Intersection Observer)
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        // Jangan eksekusi apapun jika sedang loading
        if (isLoading || isFetchingMore) return; 
        
        // Hapus detektor lama jika ada
        if (observer.current) observer.current.disconnect(); 
        
        // Buat detektor baru
        observer.current = new IntersectionObserver(entries => {
            // Jika elemen terakhir terlihat di layar (isIntersecting) DAN masih ada data
            if (entries[0].isIntersecting && hasMore) {
                // TAMBAH HALAMAN! (Otomatis akan memicu useEffect di atas)
                setPage(prevPage => prevPage + 1);
            }
        });
        
        // Pasang detektornya ke elemen HTML yang dikirim
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore, hasMore]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate(`/dashboard`)}>&larr; Dasbor Utama</Button>
                    <h2>Riwayat Tagihan</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Button variant="outline" onClick={() => navigate(`/groups/${groupId}`)}>
                        ⚙️ Pengaturan Sirkel
                    </Button>
                    <input 
                        type="date" 
                        className="input-field" 
                        value={filterDate}
                        onChange={handleDateChange}
                        title="Filter berdasarkan tanggal"
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Button onClick={() => navigate(`/groups/${groupId}/expenses/create`)}>
                        + Catat Tagihan Baru
                    </Button>
                </div>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
                {/* --- BANNER RINGKASAN UTANG (LANGKAH 2) --- */}
                {!isBalanceLoading && balanceData && (
                    <div 
                        onClick={() => setIsBalanceModalOpen(true)}
                        style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            backgroundColor: 'var(--color-surface)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--color-primary)',
                            boxShadow: 'var(--shadow-md)',
                            marginBottom: '2rem',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        {/* Aksen garis warna di kiri */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: 'var(--color-primary)' }}></div>
                        
                        <div style={{ paddingLeft: '1rem' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Piutang (Orang utang ke kamu)</p>
                            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(balanceData.totalOwedToMe).toLocaleString('id-ID')}</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Utangmu (Kamu utang ke orang)</p>
                            <h3 style={{ margin: 0, color: 'var(--color-error)' }}>Rp {Number(balanceData.totalIOwe).toLocaleString('id-ID')}</h3>
                        </div>
                        <div style={{ alignSelf: 'center', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                            Lihat Rincian &rarr;
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        ⚠️ {errorMsg}
                    </div>
                )}

                {isLoading ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>Memuat tagihan...</p>
                ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Belum ada tagihan</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Ayo mulai patungan dengan mencatat pengeluaran pertama!</p>
                        <Button onClick={() => navigate(`/groups/${groupId}/expenses/create`)}>
                            Catat Tagihan
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {expenses.map((expense, index) => {
                            // Cek apakah ini adalah item terakhir di daftar (untuk trigger scroll)
                            const isLastElement = expenses.length === index + 1;
                            
                            // --- LOGIKA HEADER TANGGAL (LANGKAH 3) ---
                            // Cek apakah tanggal tagihan ini BEDA dengan tanggal tagihan sebelumnya
                            // Jika beda, berarti harinya berganti, kita harus memunculkan Label Header Tanggal
                            const currentDateHeader = formatDateHeader(expense.expenseDate);
                            const prevExpense = index > 0 ? expenses[index - 1] : null;
                            const showHeader = !prevExpense || formatDateHeader(prevExpense.expenseDate) !== currentDateHeader;
                            
                            // --- LOGIKA STATUS PELUNASAN (LANGKAH 3) ---
                            // Cari apakah ID user kita tercatat di daftar utang tagihan ini
                            const myShare = expense.shares.find(s => s.userId === currentUserId);
                            const amIInvolved = !!myShare; // true jika kita ikut patungan, false jika tidak
                            
                            return (
                                <React.Fragment key={expense.id}>
                                    {/* Jika harinya ganti, tampilkan header pembatas seperti "Hari Ini" atau "Kemarin" */}
                                    {showHeader && (
                                        <div style={{ alignSelf: 'center', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1rem' }}>
                                            {currentDateHeader}
                                        </div>
                                    )}
                                    
                                    <div 
                                        onClick={() => navigate(`/expenses/${expense.id}`)}
                                        ref={isLastElement ? lastElementRef : null}
                                        style={{ 
                                            backgroundColor: 'var(--color-surface)', 
                                            padding: '1.5rem', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--color-border)',
                                            boxShadow: 'var(--shadow-sm)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                        // Efek hover agar terasa interaktif
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        }}
                                    >
                                        {/* Bagian Atas: Info Umum */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{expense.description}</h3>
                                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                    <span>📅 {new Date(expense.expenseDate).toLocaleDateString('id-ID')}</span>
                                                    <span>💸 Ditalangi oleh: <strong>{expense.paidByUser?.name || 'Seseorang'}</strong></span>
                                                    <span>👥 Dibagi ke {expense.shares.length} orang</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Tagihan</p>
                                                <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h3>
                                            </div>
                                        </div>
                                        
                                        {/* Bagian Bawah: Status Pribadi (Langkah 3) */}
                                        {amIInvolved ? (
                                            expense.paidBy === currentUserId ? (
                                                <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem' }}>Status Tagihanmu:</span>
                                                    <strong style={{ fontSize: '1.05rem' }}>✅ Ditalangi Sendiri</strong>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', backgroundColor: myShare.isPaid ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', color: myShare.isPaid ? 'var(--color-primary)' : 'var(--color-error)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem' }}>Status Tagihanmu:</span>
                                                    <strong style={{ fontSize: '1.05rem' }}>{myShare.isPaid ? '✅ Sudah Lunas' : `❌ Belum Lunas (Rp ${Number(myShare.shareAmount).toLocaleString('id-ID')})`}</strong>
                                                </div>
                                            )
                                        ) : (
                                            <div style={{ marginTop: '1.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px', color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                                                <em>Kamu tidak ikut patungan ini</em>
                                            </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            )
                        })}
                        
                        {/* Menampilkan indikator loading saat scroll bawah */}
                        {isFetchingMore && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '1rem 0' }}>⏳ Memuat tagihan lama...</p>}
                        
                        {/* Pesan kalau sudah habis */}
                        {!hasMore && expenses.length > 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '1rem 0', fontStyle: 'italic' }}>Tamat. Tidak ada histori lagi.</p>}
                    </div>
                )}
            </main>

            {/* --- MODAL DETAIL RINGKASAN (LANGKAH 3) --- */}
            {isBalanceModalOpen && balanceData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0 }}>Rincian Ringkasan Utang</h3>
                            <button onClick={() => setIsBalanceModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
                        </div>
                        
                        {/* Bagian Aku Utang Ke Siapa Saja */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-error)' }}>Daftar Utangmu (Total: Rp {Number(balanceData.totalIOwe).toLocaleString('id-ID')})</h4>
                            {balanceData.iOwe.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Kamu tidak punya utang ke siapapun! 🎉</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {balanceData.iOwe.map(item => (
                                        <div key={item.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                            <span style={{ fontWeight: 'bold' }}>Ke {item.name}</span>
                                            <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bagian Siapa Saja Utang Ke Aku */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Daftar Piutangmu (Total: Rp {Number(balanceData.totalOwedToMe).toLocaleString('id-ID')})</h4>
                            {balanceData.owedToMe.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Belum ada yang utang ke kamu. 💸</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {balanceData.owedToMe.map(item => (
                                        <div key={item.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                                            <span style={{ fontWeight: 'bold' }}>Dari {item.name}</span>
                                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
