import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpenseCardProps {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    paidByUserName: string;
    paidByUserId: string;
    currentUserId: string | null;
    myShare?: { isPaid: boolean; payments?: { status: string }[] };
}

export function ExpenseCard({ id, description, totalAmount, expenseDate, paidByUserName, paidByUserId, currentUserId, myShare }: ExpenseCardProps) {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(`/expenses/${id}`)}
            style={{ 
                padding: '1.5rem', 
                backgroundColor: 'var(--color-surface)', 
                borderRadius: '12px', 
                boxShadow: 'var(--shadow-sm)', 
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{description}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {new Date(expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary)' }}>Rp {Number(totalAmount).toLocaleString('id-ID')}</p>
                </div>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ditalangi oleh: <strong style={{ color: 'var(--color-text-main)' }}>{paidByUserId === currentUserId ? 'Kamu' : paidByUserName}</strong></span>
                
                {myShare && paidByUserId !== currentUserId && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {myShare.isPaid ? (
                            <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Lunas</span>
                        ) : myShare.payments && myShare.payments.length > 0 && myShare.payments[0].status === 'pending' ? (
                            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Menunggu ACC</span>
                        ) : myShare.payments && myShare.payments.length > 0 && myShare.payments[0].status === 'rejected' ? (
                            <span style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Ditolak</span>
                        ) : (
                            <span style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Belum Lunas</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
