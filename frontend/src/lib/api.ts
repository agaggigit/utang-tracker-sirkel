import axios from 'axios';
import { getToken } from './utils/token';

// Buat instance axios dengan base URL dari environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk MENAMBAHKAN token ke setiap request yang keluar
api.interceptors.request.use(
  (config) => {
    // Ambil token dari storage
    const token = getToken();
    
    // Jika token ada, selipkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Tangani error saat request gagal dikonfigurasi
    return Promise.reject(error);
  }
);

export default api;
