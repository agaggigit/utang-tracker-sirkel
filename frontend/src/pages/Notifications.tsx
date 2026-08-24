import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { SkeletonList } from '../components/ui/Skeleton';
import { ReviewPaymentModal } from '../components/expenses/ReviewPaymentModal';
import { Inbox, Check, AlertTriangle, PartyPopper, Info, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../utils/errorHandler';
import { Payment, JoinRequest, Notification as NotificationType } from '../types';

export const Notifications = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- STATE UNTUK MODAL REVIEW (LANGKAH 3) ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const { data: joinRequests = [], isLoading: isLoadingJoin, error: joinError } = useQuery({
        queryKey: ['notifications', 'join-requests'],
        queryFn: async () => {
            const response = await api.get('/notifications/join-requests');
            return response.data;
        }
    });

    const { data: incomingPayments = [], isLoading: isLoadingPayments, error: paymentError } = useQuery({
        queryKey: ['payments', 'incoming'],
        queryFn: async () => {
            const response = await api.get('/payments/incoming');
            return response.data;
        }
    });

    const { data: generalNotifs = [], isLoading: isLoadingNotifs, error: notifError } = useQuery({
        queryKey: ['notifications', 'general'],
        queryFn: async () => {
            const response = await api.get('/notifications');
            return response.data;
        }
    });

    const isLoading = isLoadingJoin || isLoadingPayments || isLoadingNotifs;
    const errorMsg = [joinError, paymentError, notifError].filter(Boolean).map(e => getErrorMessage(e)).join(', ');

    const hasNoNotifications = joinRequests.length === 0 && incomingPayments.length === 0 && generalNotifs.length === 0;

    // --- LOGIKA READ NOTIFIKASI (LANGKAH 4) ---
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'general'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await api.patch(`/notifications/read-all`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'general'] });
        }
    });

    return (
        <div className="p-8 max-w-[800px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-transparent border-none text-[1.5rem] cursor-pointer p-0 text-primary"
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-[1.5rem] m-0 flex items-center gap-2">Kotak Masuk <Inbox size={24} /></h1>
                </div>
                {generalNotifs.some((n: NotificationType) => !n.isRead) && (
                    <button 
                        onClick={() => markAllAsReadMutation.mutate()} 
                        className="bg-transparent border-none text-primary text-[0.9rem] cursor-pointer font-bold"
                    >
                        <span className="flex items-center gap-1"><Check size={16} /> Tandai Semua Dibaca</span>
                    </button>
                )}
            </div>

            {/* List Pesan */}
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <SkeletonList count={5} />
                ) : errorMsg ? (
                    <div className="p-4 bg-error-bg text-error rounded-lg text-center flex items-center justify-center gap-2">
                        <AlertTriangle size={20} /> {errorMsg}
                    </div>
                ) : hasNoNotifications ? (
                    <div className="text-center py-12 px-8 bg-surface rounded-lg shadow-sm">
                        <p className="text-text-muted text-[1.1rem] m-0 flex items-center justify-center gap-2">
                            Hore! Belum ada pesan baru saat ini. <PartyPopper size={20} />
                        </p>
                    </div>
                ) : (
                    <>
                        {/* --- LIST PENGAJUAN PEMBAYARAN (LANGKAH 2) --- */}
                        {incomingPayments.map((payment: Payment & { from: {name: string}; expenseShare: { expense: { description: string } } }) => (
                            <div key={payment.id} className="flex justify-between items-center py-5 px-6 bg-surface-hover rounded-lg border border-yellow-500 shadow-sm transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-[1.2rem] shadow-sm shrink-0">
                                        {payment.from.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="m-0 text-[1rem]">
                                            <span className="font-semibold text-text-main">{payment.from.name}</span> mengajukan pelunasan untuk <span className="font-semibold">{payment.expenseShare.expense.description}</span>
                                        </p>
                                        <p className="m-0 text-[0.85rem] text-yellow-800 mt-1 font-bold">
                                            Sebesar Rp {Number(payment.amount).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => {
                                        setSelectedPayment(payment);
                                        setIsReviewModalOpen(true);
                                    }} className="bg-yellow-500 text-white border-none hover:bg-yellow-600">
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* --- LIST JOIN REQUESTS (YANG SUDAH ADA SEBELUMNYA) --- */}
                        {joinRequests.map((notif: JoinRequest & { group: {name: string}, requestedAt: string }) => (
                            <div key={notif.id} className="flex justify-between items-center py-5 px-6 bg-surface rounded-lg border border-border shadow-sm transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[1.2rem] shadow-sm shrink-0">
                                        {notif.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="m-0 text-[1rem]">
                                            <span className="font-semibold text-text-main">{notif.user.name}</span> ingin bergabung ke sirkel <span className="font-semibold">{notif.group.name}</span>
                                        </p>
                                        <p className="m-0 text-[0.85rem] text-text-muted mt-1">
                                            {new Date(notif.requestedAt).toLocaleDateString('id-ID', { 
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => navigate(`/groups/${notif.groupId}`)}>
                                        Buka Sirkel
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* --- LIST NOTIFIKASI UMUM (LANGKAH 4) --- */}
                        {generalNotifs.map((notif: NotificationType) => (
                            <div key={notif.id} 
                                onClick={() => !notif.isRead && markAsReadMutation.mutate(notif.id)}
                                className={`flex items-center gap-4 py-5 px-6 rounded-lg border transition-all duration-200 ${notif.isRead ? 'bg-transparent border-border opacity-70 cursor-default shadow-none' : 'bg-surface-hover border-primary cursor-pointer shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-[1rem] shrink-0 ${notif.isRead ? 'bg-border' : 'bg-sky-400'}`}>
                                    <Info size={20} />
                                </div>
                                <div>
                                    <p className="m-0 text-[0.95rem] text-text-main">
                                        {notif.message}
                                    </p>
                                    <p className="m-0 text-[0.8rem] text-text-muted mt-1">
                                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { 
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!notif.isRead && <div className="ml-auto w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></div>}
                            </div>
                        ))}
                    </>
                )}
            </div>

            <ReviewPaymentModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setSelectedPayment(null);
                }}
                payment={selectedPayment}
            />
        </div>
    );
};
