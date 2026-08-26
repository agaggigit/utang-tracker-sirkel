import multer from 'multer';

// Menggunakan memory storage, file disimpan dalam buffer (RAM) sementara
// Ini sangat cocok untuk Serverless environment (Vercel) dan sebelum diteruskan ke cloud storage
const storage = multer.memoryStorage();

// Filter untuk memastikan hanya file gambar yang diizinkan
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Harap unggah gambar (JPEG, PNG, dll).'));
    }
};

// Batas ukuran 20MB
export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 
    }
});
