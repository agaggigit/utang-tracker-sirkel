import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

const createGroupSchema = z.object({
    name: z.string().min(3, "Nama grup minimal 3 karakter")
});

router.post('/make', authenticate, async (req: Request, res: Response) => {
    const result = createGroupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }

    try {
        const userId = res.locals.user.userId;
        const { name } = result.data;

        // Cetak kode undangan rahasia (8 karakter hex)
        const inviteCode = crypto.randomBytes(4).toString('hex');
        
        // PENTING: Gunakan Prisma Transaction. 
        // Ini memastikan pembuatan Grup dan pembuatan Member terjadi sekalian.
        // Jika salah satu gagal, keduanya akan dibatalkan otomatis (Rollback).
        const newGroup = await prisma.$transaction(async (tx) => {
            // 1. Buat Grup
            const group = await tx.group.create({
                data: {
                    name: name,
                    createdById: userId,
                    inviteCode: inviteCode
                }
            });

            // 2. Jadikan pembuatnya sebagai "host"
            await tx.groupMember.create({
                data: {
                    groupId: group.id,
                    userId: userId,
                    role: "host"
                }
            });

            return group;
        });

        res.status(201).json({
            message: "Grup berhasil dibuat!",
            group: newGroup
        });
    } catch(error) {
        console.error("Create Group Error:", error);
        res.status(500).json({ message: "Gagal membuat grup" });
    }
});

export { router as createGroupRouter };