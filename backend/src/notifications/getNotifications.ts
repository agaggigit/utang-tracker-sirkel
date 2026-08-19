import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

// GET /notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const currentUserId = res.locals.user.userId;

        const notifications = await prisma.notification.findMany({
            where: { userId: currentUserId },
            orderBy: { createdAt: 'desc' },
            // Batasi 50 terakhir agar tidak berat
            take: 50
        });

        return res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil notifikasi" });
    }
});

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
    try {
        const currentUserId = res.locals.user.userId;

        await prisma.notification.updateMany({
            where: { 
                userId: currentUserId,
                isRead: false 
            },
            data: { isRead: true }
        });

        return res.status(200).json({ message: "Semua notifikasi ditandai sudah dibaca" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal menandai notifikasi" });
    }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
    try {
        const currentUserId = res.locals.user.userId;
        const notificationId = req.params.id as string;

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
        }

        if (notification.userId !== currentUserId) {
            return res.status(403).json({ message: "Bukan notifikasimu" });
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        return res.status(200).json({ message: "Notifikasi ditandai sudah dibaca" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal menandai notifikasi" });
    }
});

export { router as notificationRouter };
