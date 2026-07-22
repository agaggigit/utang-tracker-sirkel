import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { authenticate } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const joinGroupSchema = z.object({
    inviteCode: z.string().length(8)
});

router.post('/join', authenticate, async (req: Request, res: Response) => {
    const result = joinGroupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const userId = res.locals.user.userId;
        const { inviteCode } = result.data;

        const group = await prisma.group.findUnique({
            where: { inviteCode: inviteCode },
            select: {
                id: true,
                name: true,
                joinApprovalRequired: true,
                inviteCode: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!group) {
            return res.status(404).json({ message: 'Grup tidak ditemukan' });
            
        }
        
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId: group.id,
                    userId: userId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ message: 'Kamu sudah ada di grup ini' });
        }

        if (!group.joinApprovalRequired) {
            const insertUser = await prisma.groupMember.create({
                data: {
                    groupId: group.id,
                    userId: userId,
                    role: 'member'
                }
            });

            res.status(200).json({ message: "Berhasil bergabung dengan grup" });
        } else {
            const existingRequest = await prisma.groupJoinRequest.findFirst({
                where: {
                    groupId: group.id,
                    userId: userId,
                    status: 'pending'
                }
            });

            if (existingRequest) {
                return res.status(400).json({ message: 'Permintaan bergabungmu sedang menunggu persetujuan Host' });
            }

            await prisma.groupJoinRequest.create({
                data: {
                    groupId: group.id,
                    userId: userId,
                    status: 'pending',
                }
            });

            return res.status(200).json({ message: "Permintaan terkirim, menunggu persetujuan Host" });
        }
    } catch(errors) {
        console.error(errors);
        return res.status(500).json({ message: "Gagal bergabung ke grup" });
    }
});

export { router as joinGroupRouter}