import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Expense } from '../types';

export const useExpenses = () => {
    const queryClient = useQueryClient();

    // 1. Ambil Balance Grup
    const useGroupBalance = (groupId: string | undefined) => {
        return useQuery({
            queryKey: ['groups', groupId, 'balance'],
            queryFn: async () => {
                const response = await api.get(`/groups/${groupId}/balance`);
                return response.data;
            },
            enabled: !!groupId
        });
    };

    // 2. Infinite Query Daftar Tagihan
    const useInfiniteExpenses = (groupId: string | undefined, searchKeyword: string, startDate: string, endDate: string, filterType: string) => {
        return useInfiniteQuery({
            queryKey: ['groups', groupId, 'expenses', searchKeyword, startDate, endDate, filterType],
            queryFn: async ({ pageParam = 1 }) => {
                let url = `/groups/${groupId}/expenses?page=${pageParam}&limit=10`;
                if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;
                if (startDate) url += `&startDate=${startDate}`;
                if (endDate) url += `&endDate=${endDate}`;
                if (filterType !== 'all') url += `&filterType=${filterType}`;

                const response = await api.get(url);
                return response.data as Expense[];
            },
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 10 ? allPages.length + 1 : undefined;
            },
            initialPageParam: 1,
            enabled: !!groupId
        });
    };

    // 3. Detail Tagihan
    const useExpenseDetail = (expenseId: string | undefined) => {
        return useQuery({
            queryKey: ['expenses', expenseId],
            queryFn: async () => {
                const response = await api.get(`/expenses/${expenseId}`);
                return response.data as Expense;
            },
            enabled: !!expenseId
        });
    };

    // 4. Buat Tagihan Baru
    const useCreateExpense = (groupId: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (payload: { description: string, totalAmount: number, expenseDate: string, shares: { userId: string, shareAmount: number }[] }) => {
                const response = await api.post(`/groups/${groupId}/expenses`, payload);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 5. Edit Tagihan
    const useEditExpense = (expenseId: string | undefined, groupId: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (payload: { description: string, totalAmount: number, expenseDate: string, shares: { userId: string, shareAmount: number }[] }) => {
                const response = await api.patch(`/expenses/${expenseId}`, payload);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] });
                queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 6. Hapus Tagihan
    const useDeleteExpense = (expenseId: string | undefined, groupId: string | undefined, options?: { onSuccess?: () => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async () => {
                const response = await api.delete(`/expenses/${expenseId}`);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
                queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] });
                if (options?.onSuccess) options.onSuccess();
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 7. Bayar Tagihan (Create Payment)
    const useCreatePayment = (expenseId: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (payload: { expenseShareId: string, note?: string }) => {
                const response = await api.post(`/payments`, payload);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 8. Terima/Tolak Pembayaran (Review Payment)
    const useReviewPayment = (expenseId: string | undefined, paymentId: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async ({ action, note }: { action: 'approve' | 'reject', note?: string }) => {
                const payload = action === 'reject' ? { rejectionNote: note } : {};
                const response = await api.patch(`/payments/${paymentId}/${action}`, payload);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    return {
        useGroupBalance,
        useInfiniteExpenses,
        useExpenseDetail,
        useCreateExpense,
        useEditExpense,
        useDeleteExpense,
        useCreatePayment,
        useReviewPayment
    };
};
