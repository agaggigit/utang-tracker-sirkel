import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Group, GroupMembership, JoinRequest, User } from '../types';

export const useGroups = () => {
    const queryClient = useQueryClient();

    // 1. Ambil daftar grup user (Dashboard)
    const useUserGroups = () => {
        return useQuery({
            queryKey: ['groups'],
            queryFn: async () => {
                const response = await api.get('/groups');
                return response.data as GroupMembership[];
            }
        });
    };

    // 2. Buat grup baru
    const useCreateGroup = (options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (payload: { name: string, joinApprovalRequired: boolean }) => {
                const response = await api.post('/groups', payload);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups'] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 3. Gabung grup pakai kode
    const useJoinGroup = (options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (inviteCode: string) => {
                const response = await api.post(`/groups/join/${inviteCode}`);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups'] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 4. Ambil detail grup
    const useGroupDetail = (id: string | undefined) => {
        return useQuery({
            queryKey: ['groups', id],
            queryFn: async () => {
                const response = await api.get(`/groups/${id}`);
                return response.data as Group;
            },
            enabled: !!id
        });
    };

    // 5. Ambil antrean join
    const useGroupRequests = (id: string | undefined) => {
        return useQuery({
            queryKey: ['groups', id, 'join-requests'],
            queryFn: async () => {
                const response = await api.get(`/groups/${id}/join-requests`);
                return response.data as JoinRequest[];
            },
            retry: false,
            enabled: !!id
        });
    };

    // 6. Ambil daftar anggota
    const useGroupMembers = (id: string | undefined) => {
        return useQuery({
            queryKey: ['groups', id, 'members'],
            queryFn: async () => {
                const response = await api.get(`/groups/${id}/members`);
                return response.data as User[];
            },
            enabled: !!id
        });
    };

    // 7. Update pengaturan grup
    const useUpdateGroup = (id: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (updatedData: Partial<{name: string, joinApprovalRequired: boolean, regenerateInviteCode: boolean}>) => {
                const response = await api.patch(`/groups/${id}`, updatedData);
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups', id] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 8. Terima/Tolak anggota
    const useReviewJoinRequest = (id: string | undefined, options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) => {
                const response = await api.patch(`/groups/${id}/join-requests/${requestId}`, { status });
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['groups', id, 'join-requests'] });
                queryClient.invalidateQueries({ queryKey: ['groups', id, 'members'] });
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    return {
        useUserGroups,
        useCreateGroup,
        useJoinGroup,
        useGroupDetail,
        useGroupRequests,
        useGroupMembers,
        useUpdateGroup,
        useReviewJoinRequest
    };
};
