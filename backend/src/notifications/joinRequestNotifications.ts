import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/join-requests', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId;

        const pendingRequests = await prisma.groupJoinRequest.findMany({
            where: {
                group: {
                    members: {
                        some: {
                            userId: userId,
                            role: 'host'
                        }
                    }
                },
                status: 'pending'
            },
            select: {
                id: true,
                groupId: true,
                requestedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                group: {
                    select: {
                        name: true
                    }
                }
            }
        })

        res.status(200).json(pendingRequests)
    } catch (error) {
        console.error(error)
        res.status(500).json( { message: "Gagal mengambil notifikasi request join" })
    }
});

export { router as joinRequestNotificationRouter }