import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

const createGroupSchema = z.object({
    name: z.string().min(3, "Nama grup minimal 3 karakter"),
    joinApprovalRequired: z.boolean().optional().default(false)
});

router.post('/', authenticate, async (req: Request, res: Response) => {
    const result = createGroupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }

    const userId = res.locals.user.userId;
    const { name, joinApprovalRequired } = result.data;

    // Cetak kode undangan rahasia (8 karakter hex)
    const inviteCode = crypto.randomBytes(4).toString('hex');

    // WARNING: HARUSNYA ADA PENGECEKAN APAKAH KODE INI SUDAH DIPAKAI SEBELUMNYA ATAU BELUM, DAN KALAU ADA BISA DI REROLL LAGI SAMPAI DAPET

    // PENTING: Gunakan Prisma Transaction. 
    // Ini memastikan pembuatan Grup dan pembuatan Member terjadi sekalian.
    // Jika salah satu gagal, keduanya akan dibatalkan otomatis (Rollback).
    const newGroup = await prisma.$transaction(async (tx) => {
        // 1. Buat Grup
        const group = await tx.group.create({
            data: {
                name: name,
                createdById: userId,
                inviteCode: inviteCode,
                joinApprovalRequired: joinApprovalRequired
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
});

export { router as createGroupRouter };