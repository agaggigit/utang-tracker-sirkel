import { AxiosError } from 'axios';

/**
 * Mengambil pesan error dari object error yang bertipe unknown.
 * Biasanya digunakan pada blok catch (error) atau React Query onError.
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        // Cek jika response dari backend ada dan memiliki properti message
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        
        // Terkadang validasi error memiliki format khusus misal: { errors: { field: ['message'] } }
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const firstKey = Object.keys(errors)[0];
            if (firstKey && Array.isArray(errors[firstKey])) {
                return errors[firstKey][0];
            }
        }
        
        // Fallback untuk AxiosError
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Terjadi kesalahan yang tidak diketahui.';
};
