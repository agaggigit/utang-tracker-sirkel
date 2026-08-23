import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

interface ActivityItem {
    id: string;
    expenseShare: {
        expense: {
            id: string;
            description: string;
        }
    };
    from: { name: string, id: string };
    to: { name: string, id: string };
    amount: string;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
}

export function GroupActivityDropdown({ groupId }: { groupId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { isLoading } = useQuery({
        queryKey: ['groups', groupId, 'activity'],
        queryFn: async () => {
            const response = await api.get(`/groups/${groupId}/activity`);
            return response.data as ActivityItem[];
        },
        enabled: isOpen // Only fetch when dropdown is open, or maybe always fetch to show red dot?
    });

    // Let's always fetch to show the red dot if there are pending actions for me
    const { data: allActivities } = useQuery({
        queryKey: ['groups', groupId, 'activity', 'all'],
        queryFn: async () => {
            const response = await api.get(`/groups/${groupId}/activity`);
            return response.data as ActivityItem[];
        }
    });

    const hasPendingForMe = allActivities?.some(a => a.status === 'pending' && a.to.id === currentUserId) || false;

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    position: 'relative',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s'
                }}
                className="hover-bg-surface-muted"
            >
                <Bell size={24} />
                {hasPendingForMe && (
                    <span style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        right: '6px', 
                        width: '10px', 
                        height: '10px', 
                        backgroundColor: 'var(--color-error)', 
                        borderRadius: '50%',
                        border: '2px solid var(--color-dashboard-bg)'
                    }}></span>
                )}
            </button>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '0.5rem', 
                    width: '320px', 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow-lg)', 
                    border: '1px solid var(--color-border)',
                    zIndex: 100,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Aktivitas Grup</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {isLoading || !allActivities ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Memuat...</div>
                        ) : allActivities.length === 0 ? (
                            <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada aktivitas.</div>
                        ) : (
                            allActivities.map(activity => {
                                const isForMe = activity.to.id === currentUserId;
                                const isFromMe = activity.from.id === currentUserId;
                                let statusIcon, statusColor, actionText;

                                if (activity.status === 'pending') {
                                    statusIcon = <Clock size={16} />;
                                    statusColor = '#b45309';
                                    if (isForMe) actionText = `${activity.from.name} mengajukan pelunasan kepadamu`;
                                    else if (isFromMe) actionText = `Kamu mengajukan pelunasan ke ${activity.to.name}`;
                                    else actionText = `${activity.from.name} mengajukan pelunasan ke ${activity.to.name}`;
                                } else if (activity.status === 'approved') {
                                    statusIcon = <CheckCircle size={16} />;
                                    statusColor = 'var(--color-success-text)';
                                    if (isForMe) actionText = `Kamu mengkonfirmasi pelunasan ${activity.from.name}`;
                                    else if (isFromMe) actionText = `${activity.to.name} mengkonfirmasi pelunasanmu`;
                                    else actionText = `${activity.to.name} mengkonfirmasi pelunasan ${activity.from.name}`;
                                } else {
                                    statusIcon = <XCircle size={16} />;
                                    statusColor = 'var(--color-error)';
                                    if (isForMe) actionText = `Kamu menolak pelunasan ${activity.from.name}`;
                                    else if (isFromMe) actionText = `${activity.to.name} menolak pelunasanmu`;
                                    else actionText = `${activity.to.name} menolak pelunasan ${activity.from.name}`;
                                }

                                return (
                                    <div 
                                        key={activity.id} 
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate(`/expenses/${activity.expenseShare.expense.id}`);
                                        }}
                                        style={{ 
                                            padding: '1rem', 
                                            borderBottom: '1px solid var(--color-border)', 
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            backgroundColor: (activity.status === 'pending' && isForMe) ? 'var(--color-surface-muted)' : 'transparent'
                                        }}
                                        className="hover-bg-surface-muted"
                                    >
                                        <div style={{ color: statusColor, marginTop: '2px' }}>
                                            {statusIcon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.4' }}>
                                                {actionText} untuk tagihan <strong>{activity.expenseShare.expense.description}</strong>
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                Rp {Number(activity.amount).toLocaleString('id-ID')} • {new Date(activity.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', alignSelf: 'center' }} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
