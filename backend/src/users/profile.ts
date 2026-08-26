import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import path from 'path';

const router = Router();

// Zod Schema untuk memvalidasi input update profil
const updateProfileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
    avatarUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')) // .or(z.literal('')) mengizinkan user mengosongkan fotonya
})

// --- 1. MENGAMBIL PROFIL SAAT INI ---
router.get('/me', authenticate, async (req: Request, res: Response) => {
    const userId = res.locals.user.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            id: true, 
            name: true, 
            email: true, 
            avatarUrl: true,
            memberships: {
                include: {
                    group: true
                }
            } 
        }
    });

    // Cari tahu apakah user ini punya utang yang belum lunas (bukan dia yang nalangin) di grup-grup tersebut
    const unpaidShares = await prisma.expenseShare.findMany({
        where: {
            userId: userId,
            isPaid: false,
            expense: {
                paidBy: { not: userId } // Pastikan bukan tagihannya sendiri
            }
        },
        include: {
            expense: { select: { groupId: true } }
        }
    });

    // Kumpulkan ID grup yang memiliki utang
    const groupsWithDebt = new Set(unpaidShares.map(s => s.expense.groupId));

    // Tempelkan informasi utang ke dalam list memberships
    const userWithDebtInfo = {
        ...user,
        memberships: user?.memberships.map(m => ({
            ...m,
            hasUnpaidDebt: groupsWithDebt.has(m.groupId)
        }))
    };

    res.json(userWithDebtInfo);
});

// --- 2. MENGUBAH PROFIL ---
router.patch('/me', authenticate, async (req: Request, res: Response) => {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const userId = res.locals.user.userId;
        const { name, avatarUrl } = result.data;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),  // Hanya update jika nama diisi
                ...(avatarUrl !== undefined && { avatarUrl })  // Update URL (termasuk mengosongkannya)
            },
            select: { id: true, name: true, email: true, avatarUrl: true }
        });

        res.json({
            message: "Profil berhasil diperbarui",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Gagal memperbarui profil" });
    }
});

// --- 3. MENGUNGGAH FOTO PROFIL ---
router.post('/me/avatar', authenticate, uploadAvatar.single('avatar'), async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File gambar tidak ditemukan" });
        }

        // Generate nama unik untuk file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const fileName = `avatar-${uniqueSuffix}${ext}`;

        // Unggah ke Supabase Storage (bucket: 'avatars' atau sesuaikan dengan nama aslinya)
        const { data, error } = await supabase
            .storage
            .from('Avatar') // Menggunakan nama bucket 'Avatar' sesuai screenshot user
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return res.status(500).json({ message: "Gagal mengunggah gambar ke cloud storage" });
        }

        // Dapatkan Public URL dari Supabase
        const { data: publicUrlData } = supabase
            .storage
            .from('Avatar')
            .getPublicUrl(fileName);

        const avatarUrl = publicUrlData.publicUrl;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { id: true, name: true, email: true, avatarUrl: true }
        });

        res.json({
            message: "Foto profil berhasil diunggah",
            user: updatedUser
        });
    } catch (error) {
        console.error("Upload Avatar Error:", error);
        res.status(500).json({ message: "Gagal mengunggah foto profil" });
    }
});

export { router as profileRouter }