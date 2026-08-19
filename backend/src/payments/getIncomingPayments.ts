import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/incoming', authenticate, async (req: Request, res: Response) => {
    try {
        const currentUserId = res.locals.user.userId;

        const incomingPayments = await prisma.payment.findMany({
            where: {
                toUser: currentUserId,
                status: 'pending'
            },
            include: {
                from: {
                    select: { name: true, email: true }
                },
                expenseShare: {
                    include: {
                        expense: {
                            include: {
                                group: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        return res.status(200).json(incomingPayments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil daftar pengajuan pembayaran" });
    }
});

export { router as incomingPaymentsRouter };
