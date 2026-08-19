import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";
import { createNotification } from "../notifications/notificationService";

const router = Router();

router.patch('/:id/reject', authenticate, async (req: Request, res: Response) => {
    try {
        const paymentId = req.params.id as string;
        const currentUserId = res.locals.user.userId;
        const { rejectionNote } = req.body;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { expenseShare: { include: { expense: true } } }
        });

        if (!payment) return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
        if (payment.toUser !== currentUserId) return res.status(403).json({ message: "Bukan hakmu menolak ini" });
        if (payment.status !== 'pending') return res.status(400).json({ message: "Pengajuan sudah diproses sebelumnya" });

        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'rejected',
                reviewedAt: new Date(),
                rejectionNote: rejectionNote || null
            }
        });

        // --- TRIGGER NOTIFIKASI (LANGKAH 2) ---
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId }, select: { name: true }});
        if (currentUser) {
            await createNotification(
                payment.fromUser,
                'PAYMENT_REJECTED',
                `${currentUser.name} menolak pembayaranmu untuk tagihan "${payment.expenseShare.expense.description}". Alasan: ${rejectionNote || 'Tidak ada alasan'}`,
                payment.id
            );
        }

        return res.status(200).json({ message: "Pembayaran ditolak", payment: updatedPayment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal menolak pembayaran" });
    }
});

export { router as rejectPaymentRouter };
