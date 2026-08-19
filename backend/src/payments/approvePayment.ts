import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";
import { createNotification } from "../notifications/notificationService";

const router = Router();

router.patch('/:id/approve', authenticate, async (req: Request, res: Response) => {
    try {
        const paymentId = req.params.id as string;
        const currentUserId = res.locals.user.userId;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { expenseShare: { include: { expense: true } } }
        });

        if (!payment) return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
        if (payment.toUser !== currentUserId) return res.status(403).json({ message: "Bukan hakmu menyetujui ini" });
        if (payment.status !== 'pending') return res.status(400).json({ message: "Pengajuan sudah diproses sebelumnya" });

        // Gunakan transaksi agar kedua operasi (update payment & update expenseShare) berhasil semua atau gagal semua
        const result = await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'approved',
                    reviewedAt: new Date()
                }
            }),
            prisma.expenseShare.update({
                where: { id: payment.expenseShareId },
                data: {
                    isPaid: true,
                    paidAt: new Date()
                }
            })
        ]);

        // --- TRIGGER NOTIFIKASI (LANGKAH 2) ---
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId }, select: { name: true }});
        if (currentUser) {
            await createNotification(
                payment.fromUser,
                'PAYMENT_APPROVED',
                `${currentUser.name} telah menerima pembayaran lunasmu untuk tagihan "${payment.expenseShare.expense.description}".`,
                payment.id
            );
        }

        return res.status(200).json({ message: "Pembayaran berhasil disetujui", payment: result[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal menyetujui pembayaran" });
    }
});

export { router as approvePaymentRouter };
