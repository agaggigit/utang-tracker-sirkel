import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { ParticipantItem } from '../components/expenses/ParticipantItem';
import { Clock, AlertTriangle, Calendar, Wallet, Edit2, Trash2 } from 'lucide-react';
import { SkeletonForm } from '../components/ui/Skeleton';
import { ReviewPaymentModal } from '../components/expenses/ReviewPaymentModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../utils/errorHandler';

const MySwal = withReactContent(Swal);

interface ExpenseDetailData {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    groupId: string;
    paidBy: string; 
    paidByUser: { name: string, email: string };
    group: { name: string, id: string };
    shares: {
        id: string;
        userId: string;
        shareAmount: string;
        isPaid: boolean;
        user: { name: string, email: string, avatarUrl?: string };
        payments?: { id: string; status: string; note?: string }[];
    }[];
}

export const ExpenseDetail = () => {
    const { id: expenseId } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');

    const [reviewPayment, setReviewPayment] = useState<{ id: string, amount: string, note?: string, from: { name: string, email: string } } | null>(null);

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

    const errorMsg = expenseError ? getErrorMessage(expenseError) : '';

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/expenses/${expenseId}`);
        },
        onSuccess: () => {
            toast.success('Tagihan berhasil dihapus!');
            navigate(`/groups/${expense?.groupId}/expenses`, { replace: true });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        }
    });

    const handleDelete = async () => {
        const result = await MySwal.fire({
            html: (
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="p-4 bg-error-bg rounded-full text-error">
                        <Trash2 size={48} />
                    </div>
                    <h2 className="m-0 text-xl font-bold text-text-main">Hapus Tagihan?</h2>
                    <p className="m-0 text-[0.95rem] text-text-muted">Apakah kamu yakin ingin menghapus tagihan ini? (Tindakan ini tidak bisa dibatalkan)</p>
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
            toast.success('Pengajuan pelunasan berhasil dikirim!');
            setIsModalOpen(false);
            setPaymentNote('');
            queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
            queryClient.invalidateQueries({ queryKey: ['groups', expense?.groupId, 'activity'] }); // Invalidate activity log too
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        }
    });

    const handleSubmitPayment = () => {
        paymentMutation.mutate(paymentNote);
    };

    // Removed early return for isLoading to keep PageHeader visible
    if (errorMsg) return <div className="pt-8 max-w-[1200px] mx-auto px-6"><p className="text-center mt-8 text-error flex items-center justify-center gap-2"><AlertTriangle size={20} /> {errorMsg}</p></div>;
    if (!isLoading && !expense) return <div className="pt-8 max-w-[1200px] mx-auto px-6"><p className="text-center mt-8">Data tidak ditemukan</p></div>;

    const myShare = expense?.shares.find((s) => s.userId === currentUserId);
    const amIInvolvedAndUnpaid = myShare && !myShare.isPaid && expense?.paidBy !== currentUserId;
    const amIThePayer = expense?.paidBy === currentUserId;
    const hasPaidShares = expense?.shares.some((s) => s.isPaid && s.userId !== expense?.paidBy);
    const isPending = myShare?.payments?.some((p) => p.status === 'pending');

    return (
        <div className="pt-8 max-w-[1200px] mx-auto px-6 pb-12">
            <PageHeader title="Detail Tagihan" />

            <main className="mt-8 pb-16">
                <div className="bg-surface p-8 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-8">
                    
                    {isLoading || !expense ? (
                        <SkeletonForm />
                    ) : (
                        <>
                            <div className="flex-1">
                        <div>
                            <h1 className="m-0 text-3xl font-bold">{expense.description}</h1>
                            <div className="flex justify-between items-center mt-4 mb-8">
                                <div>
                                    <p className="m-0 text-text-muted">Grup: <strong>{expense.group.name}</strong></p>
                                    <p className="m-0 mt-1 text-text-muted flex items-center gap-2">
                                        <Calendar size={16} /> {new Date(expense.expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="m-0 text-[0.9rem] text-text-muted">Total Tagihan</p>
                                    <h2 className="m-0 text-primary">Rp {Number(expense.totalAmount).toLocaleString('id-ID')}</h2>
                                </div>
                            </div>
                        </div>

                        {amIInvolvedAndUnpaid && (
                            <div className="mt-2 flex justify-center">
                                {isPending ? (
                                    <div className="py-4 px-8 bg-[#fef3c7] text-[#92400e] rounded-lg border border-[#fde68a] font-bold w-full text-center flex items-center justify-center gap-2">
                                        <Clock size={20} /> Menunggu Konfirmasi Penombok
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => setIsModalOpen(true)} 
                                        className="w-full py-3 px-8 text-[1.05rem] shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Wallet size={20} /> Ajukan Pembayaran ke {expense.paidByUser.name}
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {amIThePayer && (
                            <div className="mt-2 flex gap-4 justify-center">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 flex items-center justify-center gap-2"
                                    onClick={() => navigate(`/expenses/${expenseId}/edit`)}
                                >
                                    <Edit2 size={18} /> Edit Tagihan
                                </Button>
                                {!hasPaidShares ? (
                                    <Button 
                                        className="flex-1 bg-error flex items-center justify-center gap-2"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending ? 'Menghapus...' : <><Trash2 size={18} /> Hapus</>}
                                    </Button>
                                ) : (
                                    <div className="flex-1 p-2 text-[0.8rem] text-text-muted text-center">
                                        (Hapus dimatikan)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-[0_0_350px]">
                        <div className="p-6 bg-surface-hover rounded-xl border border-border">
                            <h3 className="m-0 mb-6 border-b border-border pb-2 text-lg">
                                Ditalangi oleh: <span className="text-primary">{expense.paidByUser.name}</span>
                            </h3>
                            
                            <div className="flex flex-col gap-4">
                                {expense.shares.map(share => (
                                    <ParticipantItem 
                                        key={share.id}
                                        name={share.user.name}
                                        email={share.user.email}
                                        shareAmount={share.shareAmount}
                                        isPaid={share.isPaid}
                                        isCurrentUser={share.userId === currentUserId}
                                        isPayer={share.userId === expense.paidBy}
                                        payments={share.payments}
                                        showReviewButton={amIThePayer}
                                        onReviewClick={(paymentId, note) => setReviewPayment({ 
                                            id: paymentId, 
                                            amount: share.shareAmount,
                                            note, 
                                            from: { name: share.user.name, email: share.user.email } 
                                        })}
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
                <label className="block mb-2 font-bold text-[0.9rem]">Catatan (Opsional)</label>
                <textarea 
                    className="w-full p-3 border-[1.5px] border-border rounded-lg text-base bg-surface-hover text-text-main transition-all duration-200 outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 mb-6 font-inherit resize-y"
                    rows={3}
                    placeholder="Misal: Udah kutransfer via GoPay ya brok!"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                />
                
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                    <Button onClick={handleSubmitPayment} disabled={paymentMutation.isPending}>
                        {paymentMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
                    </Button>
                </div>
                </Modal>
            )}

            {expense && (
                <ReviewPaymentModal
                    isOpen={!!reviewPayment}
                    onClose={() => setReviewPayment(null)}
                    payment={reviewPayment ? {
                        id: reviewPayment.id,
                        amount: reviewPayment.amount,
                        note: reviewPayment.note,
                        from: reviewPayment.from,
                        expenseShare: {
                            expense: {
                                id: expense.id,
                                description: expense.description,
                                groupId: expense.group.id,
                                group: { name: expense.group.name }
                            }
                        }
                    } : null}
                />
            )}
        </div>
    );
};
