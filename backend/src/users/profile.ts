import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Zod Schema untuk memvalidasi input update profil
const updateProfileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
    avatarUrl: z.string().url("Format URL tidak valid").optional().or(z.literal('')) // .or(z.literal('')) mengizinkan user mengosongkan fotonya
})

// --- 1. MENGAMBIL PROFIL SAAT INI ---
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
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

        res.json(user)
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil profil" });
    }
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

export { router as profileRouter }