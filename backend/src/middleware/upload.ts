import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan lokal
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Karena file dikompilasi dari src ke build/dist (jika di build), 
        // pastikan path ini relatif ke root project backend.
        // Di sini kita berasumsi struktur: backend/public/uploads/avatars
        cb(null, path.join(process.cwd(), 'public/uploads/avatars'));
    },
    filename: (req, file, cb) => {
        // Nama file unik: timestamp + angka acak + ekstensi asli
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    }
});

// Filter untuk memastikan hanya file gambar yang diizinkan
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Harap unggah gambar (JPEG, PNG, dll).'));
    }
};

// Batas ukuran 5MB
export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});
