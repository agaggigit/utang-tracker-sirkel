import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";
import z from "zod";
import crypto from "crypto";

const router = Router();

const editGroupSchema = z.object({
    name: z.string().min(3, "Nama grup minimal 3 karakter").optional(),
    joinApprovalRequired: z.boolean().optional(),    
    regenerateInviteCode: z.boolean().optional().default(false)        
});

router.patch('/:id/edit', authenticate, async (req: Request, res: Response) => {
    const result = editGroupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }
    
    try {
        const groupId = req.params.id as string;
        const userId = res.locals.user.userId;
        
        // TODO: Ambil data name, joinApprovalRequired, regenerateInviteCode dari req.body
        const { name, joinApprovalRequired, regenerateInviteCode } = result.data;

        // TODO: Cek apakah user yang request adalah 'host' dari grup ini. 
        // Hint: Gunakan prisma.groupMember.findFirst(...)
        // Jika bukan host, return res.status(403).json({ message: 'Hanya Host yang dapat mengubah pengaturan grup' })
        const userRole = await prisma.groupMember.findFirst({
            where: {
                userId: userId,
                groupId: groupId
            },
            select: {
                role: true
            }
        });

        if (!userRole || userRole.role !== 'host') {
            return res.status(403).json({ message: 'Hanya Host yang dapat mengubah pengaturan grup' })
        }
        
        // TODO: Siapkan objek data untuk diupdate ke Prisma
        const updateData: any = {};
        
        if (name !== undefined) {
            updateData.name = name;
        }
        
        if (joinApprovalRequired !== undefined) {
            updateData.joinApprovalRequired = joinApprovalRequired;
        }
        
        if (regenerateInviteCode) {
            updateData.inviteCode = crypto.randomBytes(4).toString('hex')
        }

        const updatedGroup = await prisma.group.update({
            where: {
                id: groupId,
            },
            data: updateData
        });

        return res.status(200).json({ message: 'Pengaturan grup berhasil diperbarui', group: updatedGroup });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal memperbarui pengaturan grup' });
    }
});

export { router as groupSettingsRouter };
