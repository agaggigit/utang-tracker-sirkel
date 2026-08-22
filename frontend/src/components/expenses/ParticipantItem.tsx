import { CheckCircle, XCircle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface ParticipantItemProps {
    name: string;
    email: string;
    shareAmount: string;
    isPaid: boolean;
    isCurrentUser: boolean;
    isPayer: boolean;
    avatarUrl?: string | null;
}

export function ParticipantItem({ name, email, shareAmount, isPaid, isCurrentUser, isPayer, avatarUrl }: ParticipantItemProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <Avatar name={name} imageUrl={avatarUrl} size={40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isCurrentUser && <span style={{color: 'var(--color-primary)', fontWeight: 'normal', fontSize: '0.85rem', marginRight: '0.25rem'}}>(Kamu)</span>} {name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
                </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Rp {Number(shareAmount).toLocaleString('id-ID')}</p>
                {isPayer ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-muted)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>Ditalangi Sendiri</span>
                ) : isPaid ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-success-text)', backgroundColor: 'var(--color-success-bg)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}><CheckCircle size={12} /> Lunas</span>
                ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}><XCircle size={12} /> Belum Bayar</span>
                )}
            </div>
        </div>
    );
}
