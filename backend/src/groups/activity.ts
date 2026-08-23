import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/:id/activity', authenticate, async (req: Request, res: Response) => {
    const groupId = req.params.id as string;
    const userId = res.locals.user.userId;

    // 1. Validasi Keanggotaan Grup
    const isMember = await prisma.groupMember.findFirst({
        where: {
            groupId: groupId,
            userId: userId
        }
    });

    if (!isMember) {
        return res.status(403).json({ message: "Kamu bukan anggota grup ini" });
    }

    // 2. Ambil Aktivitas Pembayaran
    // Kita ambil data pelunasan yang berhubungan dengan tagihan di grup ini
    const payments = await prisma.payment.findMany({
        where: {
            expenseShare: {
                expense: {
                    groupId: groupId
                }
            }
        },
        include: {
            from: {
                select: { id: true, name: true, avatarUrl: true }
            },
            to: {
                select: { id: true, name: true, avatarUrl: true }
            },
            expenseShare: {
                include: {
                    expense: {
                        select: { id: true, description: true }
                    }
                }
            }
        },
        orderBy: {
            submittedAt: 'desc'
        },
        take: 20
    });

    return res.status(200).json(payments);
});

export { router as getActivityRouter };
