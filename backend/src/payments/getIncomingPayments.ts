import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/incoming', authenticate, async (req: Request, res: Response) => {
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
});

export { router as incomingPaymentsRouter };
