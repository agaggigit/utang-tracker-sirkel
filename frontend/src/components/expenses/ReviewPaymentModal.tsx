import { useState } from 'react';
import { Button } from '../Button';
import { X, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

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

    const actionMutation = useMutation({
        mutationFn: async ({ id, action, note }: { id: string, action: 'approve' | 'reject', note?: string }) => {
            const payload = action === 'reject' ? { rejectionNote: note } : {};
            await api.patch(`/payments/${id}/${action}`, payload);
        },
        onSuccess: () => {
            toast.success('Review berhasil disimpan!');
            setRejectionNote('');
            
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            if (payment?.expenseShare?.expense?.id) {
                queryClient.invalidateQueries({ queryKey: ['expenses', payment.expenseShare.expense.id] });
            }
            if (payment?.expenseShare?.expense?.groupId) {
                queryClient.invalidateQueries({ queryKey: ['groups', payment.expenseShare.expense.groupId, 'activity'] });
            }
            
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat memproses review.');
        }
    });

    const handleAction = (action: 'approve' | 'reject') => {
        if (!payment) return;
        if (action === 'reject' && !rejectionNote.trim()) {
            toast.error("Harap masukkan alasan penolakan!");
            return;
        }
        actionMutation.mutate({ id: payment.id, action, note: rejectionNote });
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
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Pengirim:</strong> {payment.from.name} ({payment.from.email})</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Untuk:</strong> {payment.expenseShare.expense.description} (Grup: {payment.expenseShare.expense.group.name})</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Nominal:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp {Number(payment.amount).toLocaleString('id-ID')}</span></p>
                
                {payment.note && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        "{payment.note}"
                    </div>
                )}
            </div>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Catatan Penolakan <br/>
                <span style={{fontWeight:'normal', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>(Opsional jika Approve, <span style={{color:'var(--color-error)'}}>Wajib jika Reject</span>)</span>
            </label>
            <textarea 
                className="input-field"
                rows={2}
                placeholder="Misal: Uangnya kurang 50rb bos!"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button onClick={() => handleAction('reject')} disabled={actionMutation.isPending} style={{ flex: 1, backgroundColor: 'var(--color-error)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <X size={18} /> Tolak
                </Button>
                
                <Button onClick={() => handleAction('approve')} disabled={actionMutation.isPending} style={{ flex: 1, backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Check size={18} /> Terima
                </Button>
            </div>
        </Modal>
    );
}
