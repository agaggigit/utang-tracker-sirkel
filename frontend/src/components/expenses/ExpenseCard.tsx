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
}

export function ExpenseCard({ id, description, totalAmount, expenseDate, paidByUserName, paidByUserId, currentUserId }: ExpenseCardProps) {
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
            
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                Ditalangi oleh: <strong style={{ color: 'var(--color-text-main)' }}>{paidByUserId === currentUserId ? 'Kamu' : paidByUserName}</strong>
            </div>
        </div>
    );
}
