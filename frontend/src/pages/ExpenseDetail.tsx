import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { ParticipantItem } from '../components/expenses/ParticipantItem';
import { Clock, AlertTriangle, Calendar, Wallet, Edit2, Trash2 } from 'lucide-react';
import { SkeletonForm } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MySwal = withReactContent(Swal);

interface ExpenseDetailData {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    groupId: string;
    paidBy: string; 
    paidByUser: { name: string, email: string };
    group: { name: string };
    shares: {
        id: string;
        userId: string;
        shareAmount: string;
        isPaid: boolean;
        user: { name: string, email: string };
        payments?: { status: string }[];
    }[];
}

export const ExpenseDetail = () => {
    const { id: expenseId } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setCurrentUserId(JSON.parse(atob(token.split('.')[1])).userId);
        }
    }, []);

    const { data: expense, isLoading, error: expenseError } = useQuery({
        queryKey: ['expenses', expenseId],
        queryFn: async () => {
            const response = await api.get(`/expenses/${expenseId}`);
            return response.data as ExpenseDetailData;
        },
        enabled: !!expenseId
    });

    const errorMsg = expenseError ? (expenseError as any).response?.data?.message || (expenseError as any).message : '';

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/expenses/${expenseId}`);
        },
        onSuccess: () => {
            toast.success('Tagihan berhasil dihapus!');
            navigate(`/groups/${expense?.groupId}/expenses`, { replace: true });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message);
        }
    });

    const handleDelete = async () => {
        const result = await MySwal.fire({
            html: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: 'var(--color-error)' }}>
                        <Trash2 size={48} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Hapus Tagihan?</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Apakah kamu yakin ingin menghapus tagihan ini? (Tindakan ini tidak bisa dibatalkan)</p>
                </div>
            ),
            showCancelButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-outline',
                actions: 'swal2-actions-custom'
            },
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (!result.isConfirmed) {
            return;
        }

        deleteMutation.mutate();
    };

    const paymentMutation = useMutation({
        mutationFn: async (note: string) => {
            const share = expense?.shares.find(s => s.userId === currentUserId);
            if (!share) throw new Error('No share found');
            const response = await api.post(`/payments`, {
                expenseShareId: share.id,
                note
            });
            return response.data;
        },
        onSuccess: () => {
            setIsModalOpen(false);
            setPaymentNote('');
            queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan jaringan saat mengirim pengajuan.');
        }
    });

    const handleSubmitPayment = () => {
        paymentMutation.mutate(paymentNote);
    };

    // Removed early return for isLoading to keep PageHeader visible
    if (errorMsg) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><AlertTriangle size={20} /> {errorMsg}</p></div>;
    if (!isLoading && !expense) return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '2rem'}}>Data tidak ditemukan</p></div>;

    const myShare = expense?.shares.find((s: any) => s.userId === currentUserId);
    const amIInvolvedAndUnpaid = myShare && !myShare.isPaid && expense?.paidBy !== currentUserId;
    const amIThePayer = expense?.paidBy === currentUserId;
    const hasPaidShares = expense?.shares.some((s: any) => s.isPaid && s.userId !== expense?.paidBy);
    const isPending = myShare?.payments?.some((p: any) => p.status === 'pending');

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <PageHeader title="Detail Tagihan" />

            <main className="dashboard-main" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
                <div className="expense-detail-layout" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    
                    {isLoading || !expense ? (
                        <SkeletonForm />
                    ) : (
                        <>
                            <div className="expense-detail-info">
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{expense.description}</h1>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Grup: <strong>{expense.group.name}</strong></p>
                                    <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} /> {new Date(expense.expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Tagihan</p>
                                    <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h2>
                                </div>
                            </div>
                        </div>

                        {amIInvolvedAndUnpaid && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                {isPending ? (
                                    <div style={{ padding: '1rem 2rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', border: '1px solid #fde68a', fontWeight: 'bold', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Clock size={20} /> Menunggu Konfirmasi Penombok
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => setIsModalOpen(true)} 
                                        style={{ width: '100%', padding: '0.75rem 2rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Wallet size={20} /> Ajukan Pembayaran ke {expense.paidByUser.name}
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {amIThePayer && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button 
                                    variant="outline" 
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => navigate(`/expenses/${expenseId}/edit`)}
                                >
                                    <Edit2 size={18} /> Edit Tagihan
                                </Button>
                                {!hasPaidShares ? (
                                    <Button 
                                        style={{ flex: 1, backgroundColor: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending ? 'Menghapus...' : <><Trash2 size={18} /> Hapus</>}
                                    </Button>
                                ) : (
                                    <div style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                        (Hapus dimatikan)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="expense-detail-list">
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ margin: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                                Ditalangi oleh: <span style={{ color: 'var(--color-primary)' }}>{expense.paidByUser.name}</span>
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {expense.shares.map(share => (
                                    <ParticipantItem 
                                        key={share.id}
                                        name={share.user.name}
                                        email={share.user.email}
                                        shareAmount={share.shareAmount}
                                        isPaid={share.isPaid}
                                        isCurrentUser={share.userId === currentUserId}
                                        isPayer={share.userId === expense.paidBy}
                                    />
                                ))}
                            </div>
                        </div>
                        </div>
                        </>
                    )}
                    </div>
                </main>

            {expense && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title="Ajukan Pembayaran"
                    description={<>Beri tahu <strong>{expense.paidByUser.name}</strong> kalau kamu sudah mentransfer uangnya.</>}
                >
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Catatan (Opsional)</label>
                <textarea 
                    className="input-field"
                    rows={3}
                    placeholder="Misal: Udah kutransfer via GoPay ya brok!"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={paymentMutation.isPending}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmitPayment} disabled={paymentMutation.isPending}>
                        {paymentMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
                    </Button>
                </div>
            </Modal>
            )}
        </div>
    );
};
