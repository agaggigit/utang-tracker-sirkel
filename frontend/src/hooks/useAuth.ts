import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { User } from '../types';

// Tipe Data untuk Form
export interface LoginPayload {
    email: string;
    password?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password?: string;
}

export const useAuth = () => {
    const queryClient = useQueryClient();

    // 1. Ambil Profil User Saat Ini
    const useProfile = () => {
        return useQuery({
            queryKey: ['users', 'me'],
            queryFn: async () => {
                const response = await api.get('/users/me');
                return response.data as User & { memberships?: any[] };
            }
        });
    };

    // 2. Login Reguler
    const useLogin = (options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (userData: LoginPayload) => {
                const response = await api.post('/auth/login', userData);
                return response.data;
            },
            onSuccess: (data) => {
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 3. Register Reguler
    const useRegister = (options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (userData: RegisterPayload) => {
                const response = await api.post('/auth/register', userData);
                return response.data;
            },
            onSuccess: (data) => {
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 4. Google Login
    const useGoogleLoginMutation = (options?: { onSuccess?: (data: any) => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (tokenOrCode: string) => {
                // Backend mendukung baik token dari kredensial maupun code dari implicit flow
                // Tergantung endpoint mana yang dipanggil, kita pass ke payload
                const payload = tokenOrCode.length > 200 
                    ? { token: tokenOrCode } 
                    : { code: tokenOrCode }; 
                
                const response = await api.post('/auth/google', payload);
                return response.data;
            },
            onSuccess: (data) => {
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 5. Update Profile (Name & Avatar)
    const useUpdateProfile = (options?: { onSuccess?: () => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async (payload: { name?: string, avatarFile?: File | null }) => {
                // 1. Upload file jika ada
                if (payload.avatarFile) {
                    const form = new FormData();
                    form.append('avatar', payload.avatarFile);
                    await api.post('/users/me/avatar', form, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
                
                // 2. Update nama
                const response = await api.patch('/users/me', { name: payload.name });
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
                if (options?.onSuccess) options.onSuccess();
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    // 6. Delete Avatar
    const useDeleteAvatar = (options?: { onSuccess?: () => void, onError?: (err: unknown) => void }) => {
        return useMutation({
            mutationFn: async () => {
                const response = await api.patch('/users/me', { avatarUrl: '' });
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
                if (options?.onSuccess) options.onSuccess();
            },
            onError: (err) => {
                if (options?.onError) options.onError(err);
            }
        });
    };

    return {
        useProfile,
        useLogin,
        useRegister,
        useGoogleLoginMutation,
        useUpdateProfile,
        useDeleteAvatar
    };
};
