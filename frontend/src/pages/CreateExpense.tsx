import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

// Tipe data untuk daftar anggota yang bisa dipilih
interface Member {
    id: string;
    name: string;
}

export const CreateExpense = () => {
    const { id: groupId } = useParams();
    const navigate = useNavigate();

    // --- STATE FORM UTAMA ---
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [expenseDate, setExpenseDate] = useState(() => {
        // Default hari ini dengan format YYYY-MM-DD
        return new Date().toISOString().split('T')[0];
    });

    // --- STATE UNTUK SPLIT BILL DINAMIS ---
    // Menyimpan baris pembagian tagihan: { userId, shareAmount }
    const [shares, setShares] = useState<{ userId: string, shareAmount: number | '' }[]>([]);
    
    // State untuk daftar pilihan anggota grup (didapat dari Backend)
    const [members, setMembers] = useState<Member[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- EFFECT ---
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/groups/${groupId}/members`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMembers(data);
                }
            } catch (err) {
                console.error("Gagal mengambil anggota grup", err);
            }
        };

        fetchMembers();
    }, [groupId]);

    // --- HANDLER UNTUK SPLIT BILL ---
    // Tambah baris baru
    const handleAddShare = () => {
        setShares([...shares, { userId: '', shareAmount: '' }]);
    };

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
        if (!totalAmount || shares.length === 0) return;
        
        const equalAmount = Number((Number(totalAmount) / shares.length).toFixed(2));
        const newShares = shares.map(share => ({ ...share, shareAmount: equalAmount }));
        setShares(newShares);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            // Validasi Frontend Dasar
            if (!description || !totalAmount) {
                throw new Error("Deskripsi dan Total Nominal harus diisi!");
            }
            if (shares.length === 0) {
                throw new Error("Pilih setidaknya satu anggota untuk ditagih.");
            }

            // Pastikan tidak ada data kosong di dalam shares
            const formattedShares = shares.map(s => {
                if (!s.userId || !s.shareAmount) throw new Error("Ada baris anggota atau nominal yang kosong!");
                return { userId: s.userId, shareAmount: Number(s.shareAmount) };
            });

            // Panggil API POST /groups/:id/expenses
            const payload = {
                description,
                totalAmount: Number(totalAmount),
                expenseDate: new Date(expenseDate).toISOString(),
                shares: formattedShares
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${groupId}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // Ambil pesan error pertama dari validasi Zod
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError[0]);
                }
                throw new Error(data.message || 'Gagal membuat tagihan');
            }

            alert("Berhasil mencatat tagihan!");
            navigate(`/groups/${groupId}/expenses`);

        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate(-1)}>&larr; Kembali</Button>
                    <h2>Catat Open Bill (Nalangin)</h2>
                </div>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    {errorMsg && (
                        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 1. INFORMASI UMUM */}
                        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Informasi Tagihan</h3>
                            
                            <div className="input-wrapper">
                                <label className="input-label">Deskripsi / Judul (Cth: Patungan Nasi Padang)</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Bayar apa hari ini?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <label className="input-label">Total Nominal (Rp)</label>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        placeholder="0"
                                        value={totalAmount}
                                        onChange={e => setTotalAmount(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </div>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <label className="input-label">Tanggal Transaksi</label>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        value={expenseDate}
                                        onChange={e => setExpenseDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. SPLIT BILL */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Siapa saja yang berutang padamu?</h3>
                                <Button type="button" variant="outline" onClick={handleSplitEqually} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                    ⚖️ Bagi Rata
                                </Button>
                            </div>

                            {/* Daftar Dinamis */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                                {shares.map((share, index) => (
                                    <div key={index} style={{ 
                                        padding: '1.25rem', 
                                        backgroundColor: '#f9fafb', 
                                        borderRadius: '12px', 
                                        border: '1px solid var(--color-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        
                                        {/* Baris Atas: Nama dan Tombol Hapus */}
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {/* Dropdown Anggota */}
                                            <div className="input-wrapper" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                                                <select 
                                                    className="input-field" 
                                                    style={{ width: '100%', textOverflow: 'ellipsis' }}
                                                    value={share.userId}
                                                    onChange={e => handleShareChange(index, 'userId', e.target.value)}
                                                >
                                                    <option value="" disabled>-- Pilih Anggota --</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Tombol Hapus Baris */}
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
                                                ✖
                                            </button>
                                        </div>

                                        {/* Baris Bawah: Input Nominal */}
                                        <div className="input-wrapper" style={{ marginBottom: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Rp</span>
                                                <input 
                                                    type="number" 
                                                    className="input-field" 
                                                    style={{ paddingLeft: '3rem', width: '100%', fontWeight: 'bold' }}
                                                    placeholder="0"
                                                    value={share.shareAmount}
                                                    onChange={e => handleShareChange(index, 'shareAmount', e.target.value ? Number(e.target.value) : '')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" variant="outline" onClick={handleAddShare} style={{ width: '100%', borderStyle: 'dashed' }}>
                                + Tambah Anggota yang Ditagih
                            </Button>
                        </div>

                        {/* 3. SUMMARIES & SUBMIT */}
                        <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                            <Button type="submit" disabled={isLoading} style={{ marginTop: '1rem', width: '100%' }}>
                                {isLoading ? 'Menyimpan...' : 'Simpan & Tagih Mereka!'}
                            </Button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
};
