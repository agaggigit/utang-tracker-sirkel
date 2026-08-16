import { useState, useEffect } from 'react';
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

export const GroupExpenses = () => {
    const { id: groupId } = useParams();
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/groups/${groupId}/expenses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setExpenses(data);
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Gagal mengambil tagihan');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, [groupId]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate(`/groups/${groupId}`)}>&larr; Dasbor Grup</Button>
                    <h2>Riwayat Tagihan</h2>
                </div>
                <Button onClick={() => navigate(`/groups/${groupId}/expenses/create`)}>
                    + Catat Tagihan Baru
                </Button>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
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
                        {expenses.map((expense) => (
                            <div key={expense.id} style={{ 
                                backgroundColor: 'var(--color-surface)', 
                                padding: '1.5rem', 
                                borderRadius: '12px', 
                                border: '1px solid var(--color-border)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{expense.description}</h3>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        <span>📅 {new Date(expense.expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span>💸 Ditalangi oleh: <strong>{expense.paidByUser?.name || 'Seseorang'}</strong></span>
                                        <span>👥 Dibagi ke {expense.shares.length} orang</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Tagihan</p>
                                    <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
