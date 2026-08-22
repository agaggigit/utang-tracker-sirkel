import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { AlertTriangle, Scale, Trash2, ChevronDown, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SkeletonForm } from '../components/ui/Skeleton';

// Tipe data untuk daftar anggota yang bisa dipilih
interface Member {
    id: string;
    name: string;
}

// Helper Kalkulator Cepat
const evaluateMath = (expression: string | number): number | string => {
    if (typeof expression === 'number') return expression;
    try {
        const sanitized = expression.toString().replace(/[^0-9+\-*/().\s]/g, '');
        if (!sanitized) return '';
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${sanitized}`)();
        return isNaN(result) || !isFinite(result) ? '' : Math.round(result);
    } catch {
        return expression.toString();
    }
};

const sanitizeMathInput = (value: string) => {
    return value.replace(/[^0-9+\-*/().\s,]/g, '');
};

export const EditExpense = () => {
    const { id: expenseId } = useParams();
    const navigate = useNavigate();

    // Data dari backend
    const [isLocked, setIsLocked] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // --- STATE FORM UTAMA ---
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState<number | string>('');
    const [expenseDate, setExpenseDate] = useState(() => {
        // Format YYYY-MM-DD untuk default awal
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
        return localISOTime.split('T')[0]; 
    });
    const [isTimeSpecific, setIsTimeSpecific] = useState(false);

    // --- STATE UNTUK SPLIT BILL DINAMIS ---
    // Menyimpan baris pembagian tagihan: { userId, shareAmount }
    const [shares, setShares] = useState<{ userId: string, shareAmount: number | string }[]>([]);
    
    // State untuk daftar pilihan anggota grup (didapat dari Backend)
    const [members, setMembers] = useState<Member[]>([]);

    const [errorMsg, setErrorMsg] = useState('');
    const queryClient = useQueryClient();

    // --- EFFECT ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // 1. Ambil data expense
                const expenseRes = await api.get(`/expenses/${expenseId}`);
                const expenseData = expenseRes.data;
                
                const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';
                if (expenseData.paidBy !== currentUserId) {
                    throw new Error("Akses ditolak. Kamu bukan penombok tagihan ini.");
                }

                const hasPaid = expenseData.shares.some((s: any) => s.isPaid && s.userId !== currentUserId);
                setIsLocked(hasPaid);
                setDescription(expenseData.description);
                setTotalAmount(expenseData.totalAmount);
                
                // Set tanggal & waktu
                const dateObj = new Date(expenseData.expenseDate);
                const isMidnightUTC = expenseData.expenseDate.endsWith("T00:00:00.000Z");
                
                if (isMidnightUTC) {
                    setIsTimeSpecific(false);
                    setExpenseDate(expenseData.expenseDate.split('T')[0]);
                } else {
                    setIsTimeSpecific(true);
                    const tzOffset = dateObj.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
                    setExpenseDate(localISOTime);
                }

                setShares(expenseData.shares.map((s: any) => ({
                    userId: s.user.id || s.userId, // jika API mereturn include user
                    shareAmount: s.shareAmount
                })));

                // 2. Ambil data member grup
                const membersRes = await api.get(`/groups/${expenseData.groupId}/members`);
                setMembers(membersRes.data);
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsFetching(false);
            }
        };

        fetchInitialData();
    }, [expenseId]);

    // --- HANDLER UNTUK SPLIT BILL ---

    // Hapus baris tertentu
    const handleRemoveShare = (index: number) => {
        const newShares = [...shares];
        newShares.splice(index, 1);
        setShares(newShares);
    };

    // Update nilai dari baris tertentu
    const handleShareChange = (index: number, field: 'userId' | 'shareAmount', value: string | number) => {
        const newShares = [...shares];
        newShares[index] = { ...newShares[index], [field]: value };
        setShares(newShares);
    };

    // Tombol pembantu: "Bagi Rata"
    const handleSplitEqually = () => {
        const evaluatedTotal = evaluateMath(totalAmount);
        if (!evaluatedTotal || typeof evaluatedTotal !== 'number' || shares.length === 0) return;
        
        setTotalAmount(evaluatedTotal); // Sync UI ke hasil hitung

        // Membulatkan ke bawah untuk nilai dasar, sisa (termasuk desimal) diberikan ke orang pertama
        const equalAmount = Math.floor(evaluatedTotal / shares.length);
        const remainder = evaluatedTotal - (equalAmount * shares.length);

        const newShares = shares.map((share, index) => ({ 
            ...share, 
            shareAmount: index === 0 ? equalAmount + remainder : equalAmount 
        }));
        setShares(newShares);
    };

    const editExpenseMutation = useMutation({
        mutationFn: async (payload: any) => {
            const response = await api.put(`/expenses/${expenseId}`, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Berhasil memperbarui tagihan!");
            queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            navigate(`/expenses/${expenseId}`, { replace: true });
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    setErrorMsg(firstError[0]);
                } else {
                    setErrorMsg(data.message || 'Gagal memperbarui tagihan');
                }
            } else {
                setErrorMsg(err.message);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            // Validasi Frontend Dasar
            const finalTotal = evaluateMath(totalAmount);
            if (!description || !finalTotal || typeof finalTotal !== 'number') {
                throw new Error("Deskripsi dan Total Nominal harus diisi dengan angka valid!");
            }
            if (shares.length === 0) {
                throw new Error("Pilih setidaknya satu anggota untuk ditagih.");
            }

            // Pastikan tidak ada data kosong di dalam shares
            const formattedShares = shares.map(s => {
                const finalShare = evaluateMath(s.shareAmount);
                if (!s.userId || !finalShare || typeof finalShare !== 'number') throw new Error("Ada baris anggota atau nominal yang kosong/tidak valid!");
                return { userId: s.userId, shareAmount: finalShare };
            });

            let finalExpenseDate = new Date(expenseDate);
            if (!isTimeSpecific) {
                finalExpenseDate = new Date(`${expenseDate}T00:00:00.000Z`);
            }

            const payload = {
                description,
                totalAmount: finalTotal,
                expenseDate: finalExpenseDate.toISOString(),
                shares: formattedShares
            };
            
            editExpenseMutation.mutate(payload);

        } catch (err: any) {
            setErrorMsg(err.message);
        }
    };

    // Removed early return

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <PageHeader title="Edit Tagihan" />

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    {isLocked && (
                        <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={20} /> Karena sudah ada anggota yang membayar lunas, kamu hanya bisa mengubah Judul dan Tanggal. Kolom nominal telah dikunci.
                        </div>
                    )}
                    {errorMsg && (
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} /> {errorMsg}
                        </div>
                    )}

                    <form className="expense-form-layout" onSubmit={handleSubmit}>
                        {isFetching ? (
                            <div style={{ padding: '2rem' }}>
                                <SkeletonForm />
                            </div>
                        ) : (
                            <>
                                {/* 1. SPLIT BILL (KIRI) */}
                        <div className="expense-form-split-wrapper">
                            <div className="expense-form-split">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                                    <h3 style={{ margin: 0 }}>Siapa saja yang berutang padamu?</h3>
                                    {!isLocked && (
                                        <Button type="button" variant="outline" onClick={handleSplitEqually} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Scale size={16} /> Bagi Rata
                                        </Button>
                                    )}
                                </div>

                                {/* Daftar Dinamis */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '1rem', 
                                    marginBottom: '1rem',
                                    flex: '0 1 auto',
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem'
                                }}>
                                    {shares.map((share, index) => (
                                        <div key={index} style={{ 
                                            padding: '1.25rem', 
                                            backgroundColor: 'var(--color-surface-hover)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--color-border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                        
                                        {/* Baris Atas: Nama dan Tombol Hapus */}
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {/* Dropdown Anggota (Disabled/Read-only untuk yang sudah dipilih) */}
                                            <div className="input-wrapper" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '8px', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {members.find(m => m.id === share.userId)?.name || 'Anggota'}
                                                </div>
                                            </div>

                                            {/* Tombol Hapus Baris */}
                                            {!isLocked && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveShare(index)}
                                                    style={{ 
                                                        background: 'var(--color-error)', color: 'white', border: 'none', 
                                                        borderRadius: '50%', width: '28px', height: '28px', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.8rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                                                        flexShrink: 0
                                                    }}
                                                    title="Hapus baris ini"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Baris Bawah: Input Nominal */}
                                        <div className="input-wrapper" style={{ marginBottom: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Rp</span>
                                                <input 
                                                    type="text" 
                                                    className="input-field" 
                                                    style={isLocked ? { backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-text-muted)', paddingLeft: '3rem', width: '100%', fontWeight: 'bold' } : { paddingLeft: '3rem', width: '100%', fontWeight: 'bold' }}
                                                    placeholder="0"
                                                    value={share.shareAmount}
                                                    disabled={isLocked}
                                                    onChange={e => handleShareChange(index, 'shareAmount', sanitizeMathInput(e.target.value))}
                                                    onBlur={() => handleShareChange(index, 'shareAmount', evaluateMath(share.shareAmount))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleShareChange(index, 'shareAmount', evaluateMath(share.shareAmount));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dropdown Langsung Tambah Anggota */}
                            {!isLocked && members.filter(m => !shares.some(s => s.userId === m.id)).length > 0 && (
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <select 
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setShares([...shares, { userId: e.target.value, shareAmount: '' }]);
                                            }
                                        }}
                                        className="input-field"
                                        style={{ 
                                            width: '100%', 
                                            border: '2px dashed var(--color-border)', 
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            color: 'var(--color-primary)',
                                            textAlign: 'center',
                                            appearance: 'none', 
                                            padding: '0.75rem'
                                        }}
                                    >
                                        <option value="" disabled>+ Klik untuk Tambah Anggota yang Ditagih...</option>
                                        {members.filter(m => !shares.some(s => s.userId === m.id)).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-primary)' }}>
                                        <ChevronDown size={20} />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. KANAN: INFO & SUBMIT */}
                    <div className="expense-form-right">
                        <div className="expense-form-info">
                            <h3 style={{ marginBottom: '1rem' }}>Informasi Tagihan</h3>
                            
                            <div className="input-wrapper">
                                <label className="input-label">Deskripsi / Judul</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Bayar apa hari ini?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Total Nominal (Rp) - Cth: 50000+15000</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="0"
                                    value={totalAmount}
                                    disabled={isLocked}
                                    style={isLocked ? { backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' } : {}}
                                    onChange={e => setTotalAmount(sanitizeMathInput(e.target.value))}
                                    onBlur={() => setTotalAmount(evaluateMath(totalAmount))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setTotalAmount(evaluateMath(totalAmount));
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="input-wrapper">
                                <label className="input-label">Tanggal Transaksi</label>
                                <input 
                                    type={isTimeSpecific ? "datetime-local" : "date"} 
                                    className="input-field" 
                                    value={expenseDate}
                                    onChange={e => setExpenseDate(e.target.value)}
                                />
                                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isTimeSpecific}
                                        onChange={(e) => {
                                            setIsTimeSpecific(e.target.checked);
                                            const now = new Date();
                                            const tzOffset = now.getTimezoneOffset() * 60000;
                                            const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
                                            
                                            if (e.target.checked) {
                                                setExpenseDate(localISOTime);
                                            } else {
                                                setExpenseDate(localISOTime.split('T')[0]);
                                            }
                                        }}
                                    />
                                    Atur Jam Spesifik
                                </label>
                            </div>
                        </div>

                        <div className="expense-form-submit">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <span>Total Tagihan:</span>
                                <span style={{ fontWeight: 'bold' }}>Rp {totalAmount || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <span>Total Alokasi (Split):</span>
                                <span style={{ fontWeight: 'bold', color: shares.reduce((sum, s) => sum + Number(s.shareAmount || 0), 0) !== Number(totalAmount) ? 'var(--color-error)' : 'var(--color-primary)' }}>
                                    Rp {shares.reduce((sum, s) => sum + Number(s.shareAmount || 0), 0)}
                                </span>
                            </div>

                            <Button type="submit" disabled={editExpenseMutation.isPending} style={{ marginTop: '1rem', width: '100%' }}>
                                {editExpenseMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan!'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </form>
    </div>
</main>
    </div>
);
};
