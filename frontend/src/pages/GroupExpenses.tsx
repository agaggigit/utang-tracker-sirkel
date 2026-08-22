import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { Modal } from '../components/ui/Modal';
import { Settings, Search, Plus, AlertTriangle, Receipt, Filter, ArrowRight, Wallet, PartyPopper } from 'lucide-react';
import api from '../lib/api';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { SkeletonList } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

interface ExpenseShare {
    id: string;
    userId: string;
    shareAmount: string;
    isPaid: boolean;
}

interface Expense {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    paidBy: string;
    paidByUser?: { name: string };
    shares: ExpenseShare[];
}

interface BalanceData {
    totalIOwe: number;
    totalOwedToMe: number;
    iOwe: { userId: string, name: string, amount: number }[];
    owedToMe: { userId: string, name: string, amount: number }[];
}

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

    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isClosingSheet, setIsClosingSheet] = useState(false);

    const token = localStorage.getItem('token');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

    const applyFilters = () => {
        closeFilterSheet();
    };

    const closeFilterSheet = () => {
        setIsClosingSheet(true);
        setTimeout(() => {
            setIsFilterSheetOpen(false);
            setIsClosingSheet(false);
        }, 300);
    };

    const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
        queryKey: ['groups', groupId, 'balance'],
        queryFn: async () => {
            const response = await api.get(`/groups/${groupId}/balance`);
            return response.data as BalanceData;
        }
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery({
        queryKey: ['groups', groupId, 'expenses', searchKeyword, startDate, endDate, filterType],
        queryFn: async ({ pageParam = 1 }) => {
            let url = `/groups/${groupId}/expenses?page=${pageParam}&limit=10`;
            if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            if (filterType !== 'all') url += `&filterType=${filterType}`;

            const response = await api.get(url);
            return response.data as Expense[];
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1
    });

    const expenses = data ? data.pages.flatMap(page => page) : [];
    const errorMsg = isError ? (error as any).response?.data?.message || (error as any).message : '';

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading || isFetchingNextPage) return; 
        if (observer.current) observer.current.disconnect(); 
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <div className="expenses-layout">
                <PageHeader 
                    title="Riwayat Tagihan" 
                    onBack={() => navigate('/dashboard')}
                    action={
                        <button 
                            onClick={() => navigate(`/groups/${groupId}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                            title="Pengaturan Sirkel"
                        >
                            <Settings size={24} />
                        </button>
                    }
                />

                {/* --- BAR PENCARIAN & FILTER --- */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginBottom: '1rem' }}>
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
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', marginBottom: '1rem' }}>
                        {startDate && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Mulai: {new Date(startDate).toLocaleDateString('id-ID')}</span>}
                        {endDate && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Hingga: {new Date(endDate).toLocaleDateString('id-ID')}</span>}
                        {filterType === 'involved' && <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Terlibat</span>}
                        {filterType === 'unpaid' && <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Belum Lunas</span>}
                        {filterType === 'payer' && <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>Status: Nalangin</span>}
                        <span 
                            onClick={() => { setSearchKeyword(''); setStartDate(''); setEndDate(''); setFilterType('all'); }}
                            style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', padding: '0.25rem' }}
                        >Hapus Semua Filter</span>
                    </div>
                )}

            {/* --- 3. PANEL STATS (Kanan) --- */}
            <div className="expenses-stats">
            {/* --- TOMBOL CATAT TAGIHAN BARU --- */}
            <Button 
                onClick={() => navigate(`/groups/${groupId}/expenses/create`)}
                style={{ width: '100%', fontSize: '1.05rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}
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
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        marginBottom: '1.5rem'
                    }}
                >
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
                        Lihat Rincian <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
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
                    <SkeletonList count={4} />
                ) : expenses.length === 0 ? (
                    <EmptyState 
                        icon={<Receipt size={48} />}
                        title="Belum ada tagihan"
                        description="Ayo mulai patungan dengan mencatat pengeluaran pertama!"
                        action={<Button onClick={() => navigate(`/groups/${groupId}/expenses/create`)}>Catat Tagihan</Button>}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {expenses.map((expense, index) => {
                            const isLastElement = expenses.length === index + 1;
                            const currentDateHeader = formatDateHeader(expense.expenseDate);
                            const prevExpense = index > 0 ? expenses[index - 1] : null;
                            const showHeader = !prevExpense || formatDateHeader(prevExpense.expenseDate) !== currentDateHeader;
                            
                            return (
                                <React.Fragment key={expense.id}>
                                    {showHeader && (
                                        <div style={{ alignSelf: 'center', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1rem' }}>
                                            {currentDateHeader}
                                        </div>
                                    )}
                                    <div ref={isLastElement ? lastElementRef : null}>
                                        <ExpenseCard 
                                            id={expense.id}
                                            description={expense.description}
                                            totalAmount={expense.totalAmount}
                                            expenseDate={expense.expenseDate}
                                            paidByUserName={expense.paidByUser?.name || 'Seseorang'}
                                            paidByUserId={expense.paidBy}
                                            currentUserId={currentUserId}
                                        />
                                    </div>
                                </React.Fragment>
                            )
                        })}
                        {isFetchingNextPage && <SkeletonList count={1} />}
                        {!hasNextPage && expenses.length > 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Tamat. Tidak ada histori lagi.</p>}
                    </div>
                )}
            </main>
            </div>

            {/* MODAL RINGKASAN MENGGUNAKAN GENERIC MODAL */}
            {balanceData && (
                <Modal 
                    isOpen={isBalanceModalOpen} 
                    onClose={() => setIsBalanceModalOpen(false)} 
                    title="Rincian Ringkasan Utang"
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-error)' }}>Daftar Utangmu (Total: Rp {Number(balanceData.totalIOwe).toLocaleString('id-ID')})</h4>
                        {balanceData.iOwe.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PartyPopper size={16} /> Kamu tidak punya utang ke siapapun!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {balanceData.iOwe.map(item => (
                                    <div key={item.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Ke {item.name}</span>
                                        <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Daftar Piutangmu (Total: Rp {Number(balanceData.totalOwedToMe).toLocaleString('id-ID')})</h4>
                        {balanceData.owedToMe.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={16} /> Belum ada yang utang ke kamu.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {balanceData.owedToMe.map(item => (
                                    <div key={item.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Dari {item.name}</span>
                                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* BOTTOM SHEET FILTER BIARKAN (KARENA SHEET BERBEDA DENGAN MODAL) */}
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
                    <div 
                        style={{
                            backgroundColor: 'var(--color-surface)', padding: '2rem',
                            borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                            animation: `${isClosingSheet ? 'slideDown' : 'slideUp'} 0.3s forwards ease-out`,
                            paddingBottom: '3rem'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ width: '40px', height: '5px', backgroundColor: 'var(--color-border)', borderRadius: '10px', margin: '0 auto 1.5rem auto' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Filter Tagihan</h3>
                            <button onClick={closeFilterSheet} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
                        </div>

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
