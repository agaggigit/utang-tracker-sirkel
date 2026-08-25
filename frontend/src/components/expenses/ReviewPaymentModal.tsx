import { useState } from 'react';
import { Button } from '../Button';
import { X, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useExpenses } from '../../hooks/useExpenses';

interface ReviewPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: {
        id: string;
        amount: string | number;
        note?: string;
        from: { name: string; email: string };
        expenseShare: {
            expense: {
                id: string;
                description: string;
                groupId: string;
                group: { name: string };
            }
        }
    } | null;
    onSuccess?: () => void;
}

export function ReviewPaymentModal({ isOpen, onClose, payment, onSuccess }: ReviewPaymentModalProps) {
    const [rejectionNote, setRejectionNote] = useState('');
    const queryClient = useQueryClient();
    const { useReviewPayment } = useExpenses();
    const actionMutation = useReviewPayment(payment?.expenseShare.expense.id, payment?.id, {
        onSuccess: () => {
            toast.success('Review berhasil disimpan!');
            setRejectionNote('');
            
            // Invalidate relevant queries (activity log needs separate invalidation)
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            if (payment?.expenseShare?.expense?.groupId) {
                queryClient.invalidateQueries({ queryKey: ['groups', payment.expenseShare.expense.groupId, 'activity'] });
            }
            
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || 'Gagal menyimpan review');
        }
    });

    const handleAction = (action: 'approve' | 'reject') => {
        if (!payment) return;
        if (action === 'reject' && !rejectionNote.trim()) {
            toast.error("Harap masukkan alasan penolakan!");
            return;
        }
        actionMutation.mutate({ action, note: rejectionNote });
    };

    if (!payment) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setRejectionNote('');
                onClose();
            }} 
            title="Review Pembayaran"
        >
            <div className="mb-6">
                <p className="m-0 mb-2"><strong>Pengirim:</strong> {payment.from.name} ({payment.from.email})</p>
                <p className="m-0 mb-2"><strong>Untuk:</strong> {payment.expenseShare.expense.description} (Grup: {payment.expenseShare.expense.group.name})</p>
                <p className="m-0 mb-2"><strong>Nominal:</strong> <span className="text-primary font-bold">Rp {Number(payment.amount).toLocaleString('id-ID')}</span></p>
                
                {payment.note && (
                    <div className="mt-4 p-4 bg-surface-muted rounded-lg italic text-sm">
                        "{payment.note}"
                    </div>
                )}
            </div>

            <label className="block mb-2 font-bold text-sm">
                Catatan Penolakan <br/>
                <span className="font-normal text-xs text-text-muted">(Opsional jika Approve, <span className="text-error">Wajib jika Reject</span>)</span>
            </label>
            <textarea 
                className="w-full p-3 rounded-lg border border-border mb-6 font-inherit resize-y bg-surface-hover text-text-main focus:border-primary focus:ring-[3px] focus:ring-primary/15 outline-none transition-all duration-200"
                rows={2}
                placeholder="Misal: Uangnya kurang 50rb bos!"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
            />
            
            <div className="flex gap-4 justify-center">
                <Button 
                    onClick={() => handleAction('reject')} 
                    disabled={actionMutation.isPending} 
                    className="flex-1 !bg-error hover:!bg-error-hover !border-none !text-white"
                >
                    <X size={18} /> Tolak
                </Button>
                
                <Button 
                    onClick={() => handleAction('approve')} 
                    disabled={actionMutation.isPending} 
                    className="flex-1"
                >
                    <Check size={18} /> Terima
                </Button>
            </div>
        </Modal>
    );
}
