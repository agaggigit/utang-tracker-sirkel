import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Settings, Search, Plus, AlertTriangle, Calendar, Wallet, Users, CheckCircle, XCircle, Clock, PartyPopper, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

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

    // --- POLA PIKIR FITUR PENCARIAN & FILTER (LANGKAH 3) ---
    const [searchKeyword, setSearchKeyword] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('all'); // all | involved | unpaid | payer
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isClosingSheet, setIsClosingSheet] = useState(false); // Untuk animasi tutup

    // Mengambil ID user yang sedang login dari JWT Token untuk mengecek status lunas
    const token = localStorage.getItem('token');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

    // Menerapkan Filter & Search
    const applyFilters = () => {
        setPage(1);
        setHasMore(true);
        closeFilterSheet();
    };

    // Menutup sheet tanpa mereset data
    const closeFilterSheet = () => {
        setIsClosingSheet(true);
        setTimeout(() => {
            setIsFilterSheetOpen(false);
            setIsClosingSheet(false);
        }, 300); // 300ms sesuai durasi animasi CSS
    };

    // Reset ke halaman 1 setiap kali filter berubah
    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [searchKeyword, startDate, endDate, filterType]);

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
                if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;
                if (startDate) url += `&startDate=${startDate}`;
                if (endDate) url += `&endDate=${endDate}`;
                if (filterType !== 'all') url += `&filterType=${filterType}`;

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
    }, [groupId, page, searchKeyword, startDate, endDate, filterType]); // Efek ini akan berjalan setiap kali parameter filter berubah!

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
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <div className="expenses-layout">
                {/* --- 1. HEADER (Kiri Atas) --- */}
                <header className="expenses-header" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate(`/dashboard`)}
                            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                            title="Kembali ke Dasbor"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{ margin: 0 }}>Riwayat Tagihan</h2>
                    </div>
                    <div>
                        <button 
                            onClick={() => navigate(`/groups/${groupId}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                            title="Pengaturan Sirkel"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                </div>

                {/* --- BAR PENCARIAN & FILTER --- */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Cari tagihan (cth: Nasi Padang)..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                    <Button variant="outline" onClick={() => setIsFilterSheetOpen(true)} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} />
                        <span>Filter</span>
                        {(startDate || endDate || filterType !== 'all') && (
                            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></span>
                        )}
                    </Button>
                </div>

                {/* --- INDIKATOR FILTER AKTIF --- */}
                {(startDate || endDate || filterType !== 'all') && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                        {startDate && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Mulai: {new Date(startDate).toLocaleDateString('id-ID')}</span>}
                        {endDate && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Hingga: {new Date(endDate).toLocaleDateString('id-ID')}</span>}
                        {filterType === 'involved' && <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Terlibat</span>}
                        {filterType === 'unpaid' && <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Belum Lunas</span>}
                        {filterType === 'payer' && <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Nalangin</span>}
                        <span 
                            onClick={() => { setSearchKeyword(''); setStartDate(''); setEndDate(''); setFilterType('all'); setPage(1); setHasMore(true); }}
                            style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', padding: '0.25rem' }}
                        >Hapus Semua Filter</span>
                    </div>
                )}
            </header>

            {/* --- 3. PANEL STATS (Kanan) --- */}
            <div className="expenses-stats">
            {/* --- TOMBOL CATAT TAGIHAN BARU --- */}
            <Button 
                onClick={() => navigate(`/groups/${groupId}/expenses/create`)}
                style={{ width: '100%', fontSize: '1.05rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}
            >
                <Plus size={20} /> Catat Tagihan Baru
            </Button>

            {/* --- BANNER RINGKASAN UTANG --- */}
            {!isBalanceLoading && balanceData && (
                <div 
                    onClick={() => setIsBalanceModalOpen(true)}
                    style={{
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem',
                        backgroundColor: 'var(--color-surface)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid var(--color-primary)',
                        boxShadow: 'var(--shadow-md)',
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
                    {/* Aksen garis warna di kiri (diubah jadi atas untuk layout kolom) */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '6px', backgroundColor: 'var(--color-primary)' }}></div>
                    
                    <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Piutang (Orang utang ke kamu)</p>
                        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(balanceData.totalOwedToMe).toLocaleString('id-ID')}</h3>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Utangmu (Kamu utang ke orang)</p>
                        <h3 style={{ margin: 0, color: 'var(--color-error)' }}>Rp {Number(balanceData.totalIOwe).toLocaleString('id-ID')}</h3>
                    </div>
                    <div style={{ alignSelf: 'flex-start', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Lihat Rincian <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                    </div>
                </div>
            )}
            </div>

            <main className="expenses-list">
                {errorMsg && (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} /> {errorMsg}
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
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(expense.expenseDate).toLocaleDateString('id-ID')}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wallet size={14} /> Ditalangi oleh: <strong>{expense.paidByUser?.name || 'Seseorang'}</strong></span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} /> Dibagi ke {expense.shares.length} orang</span>
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
                                                    <strong style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={18} /> Ditalangi Sendiri</strong>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', backgroundColor: myShare.isPaid ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', color: myShare.isPaid ? 'var(--color-primary)' : 'var(--color-error)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.9rem' }}>Status Tagihanmu:</span>
                                                    <strong style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {myShare.isPaid ? <><CheckCircle size={18} /> Sudah Lunas</> : <><XCircle size={18} /> Belum Lunas (Rp {Number(myShare.shareAmount).toLocaleString('id-ID')})</>}
                                                    </strong>
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
                        {isFetchingMore && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Clock size={16} /> Memuat tagihan lama...</p>}
                        
                        {/* Pesan kalau sudah habis */}
                        {!hasMore && expenses.length > 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '1rem 0', fontStyle: 'italic' }}>Tamat. Tidak ada histori lagi.</p>}
                    </div>
                )}
            </main>

            {/* --- 3. PANEL STATS (Kanan) --- */}
            <div className="expenses-stats">
            {/* --- TOMBOL CATAT TAGIHAN BARU --- */}
            <Button 
                onClick={() => navigate(`/groups/${groupId}/expenses/create`)}
                style={{ width: '100%', fontSize: '1.05rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}
            >
                <Plus size={20} /> Catat Tagihan Baru
            </Button>

            {/* --- BANNER RINGKASAN UTANG --- */}
            {!isBalanceLoading && balanceData && (
                <div 
                    onClick={() => setIsBalanceModalOpen(true)}
                    style={{
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem',
                        backgroundColor: 'var(--color-surface)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid var(--color-primary)',
                        boxShadow: 'var(--shadow-md)',
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
                    {/* Aksen garis warna di kiri (diubah jadi atas untuk layout kolom) */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '6px', backgroundColor: 'var(--color-primary)' }}></div>
                    
                    <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Piutang (Orang utang ke kamu)</p>
                        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(balanceData.totalOwedToMe).toLocaleString('id-ID')}</h3>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Utangmu (Kamu utang ke orang)</p>
                        <h3 style={{ margin: 0, color: 'var(--color-error)' }}>Rp {Number(balanceData.totalIOwe).toLocaleString('id-ID')}</h3>
                    </div>
                    <div style={{ alignSelf: 'flex-start', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Lihat Rincian &rarr;
                    </div>
                </div>
            )}
            </div> {/* END PANEL STATS */}
        </div> {/* END EXPENSES LAYOUT */}

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
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PartyPopper size={16} /> Kamu tidak punya utang ke siapapun!</p>
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
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={16} /> Belum ada yang utang ke kamu.</p>
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

            {/* --- BOTTOM SHEET FILTER --- */}
            {(isFilterSheetOpen || isClosingSheet) && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        opacity: isClosingSheet ? 0 : 1, transition: 'opacity 0.3s ease'
                    }}
                    onClick={closeFilterSheet}
                >
                    {/* Lembar Sliding dari Bawah */}
                    <div 
                        style={{
                            backgroundColor: 'var(--color-surface)', padding: '2rem',
                            borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                            animation: `${isClosingSheet ? 'slideDown' : 'slideUp'} 0.3s forwards ease-out`,
                            paddingBottom: '3rem'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Garis Handle Tarik (Visual Saja) */}
                        <div style={{ width: '40px', height: '5px', backgroundColor: 'var(--color-border)', borderRadius: '10px', margin: '0 auto 1.5rem auto' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Filter Tagihan</h3>
                            <button onClick={closeFilterSheet} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
                        </div>

                        {/* Filter Tanggal */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rentang Waktu</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input 
                                    type="date" 
                                    className="input-field" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem' }}
                                />
                                <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                <input 
                                    type="date" 
                                    className="input-field" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem' }}
                                />
                            </div>
                        </div>

                        {/* Filter Status/Peran */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Status Kamu</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="filterStatus" value="all" checked={filterType === 'all'} onChange={(e) => setFilterType(e.target.value)} />
                                    <span>Tampilkan Semua</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="filterStatus" value="involved" checked={filterType === 'involved'} onChange={(e) => setFilterType(e.target.value)} />
                                    <span>Ada Namaku (Terlibat)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="filterStatus" value="unpaid" checked={filterType === 'unpaid'} onChange={(e) => setFilterType(e.target.value)} />
                                    <span style={{ color: 'var(--color-error)' }}>Belum Lunas</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="filterStatus" value="payer" checked={filterType === 'payer'} onChange={(e) => setFilterType(e.target.value)} />
                                    <span style={{ color: 'var(--color-primary)' }}>Aku yang Nalangin</span>
                                </label>
                            </div>
                        </div>

                        {/* Tombol Terapkan */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button 
                                variant="outline" 
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setSearchKeyword(''); setStartDate(''); setEndDate(''); setFilterType('all');
                                }}
                            >
                                Reset
                            </Button>
                            <Button style={{ flex: 2 }} onClick={applyFilters}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
