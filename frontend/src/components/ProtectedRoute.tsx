import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/token';

// Ini adalah komponen bungkus (Wrapper)
// Tugasnya mengecek apakah user punya token sebelum diizinkan melihat "children" (isi halamannya)
export const ProtectedRoute = ({ children }: { children: React.ReactNode}) => {
    const token = getToken();

    // Jika tidak ada token di laci, tendang paksa ke halaman login!
    if (!token) {
        return <Navigate to='/login' replace/>
    }

    // Jika ada token, silakan lewat!
    return <>{children}</>
}
