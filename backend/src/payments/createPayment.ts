import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { expenseShareId, note } = req.body;
        const currentUserId = res.locals.user.userId;
        
        // 1. Cari ExpenseShare-nya beserta relasi Expense untuk validasi
        const share = await prisma.expenseShare.findUnique({
            where: { id: expenseShareId },
            include: {
                expense: true
            }
        });

        if (!share) return res.status(404).json({ message: "Data utang tidak ditemukan" });
        if (share.userId !== currentUserId) return res.status(403).json({ message: "Ini bukan utangmu!" });
        if (share.isPaid) return res.status(400).json({ message: "Utang ini sudah lunas." });

        // 2. Cek apakah sudah ada pengajuan pending
        const existingPending = await prisma.payment.findFirst({
            where: {
                expenseShareId: expenseShareId,
                status: 'pending'
            }
        });

        if (existingPending) {
            return res.status(400).json({ message: "Kamu sudah mengajukan pembayaran yang saat ini masih menunggu konfirmasi." });
        }

        // 3. Buat Payment
        const newPayment = await prisma.payment.create({
            data: {
                expenseShareId: share.id,
                groupId: share.expense.groupId,
                fromUser: currentUserId,
                toUser: share.expense.paidBy,
                amount: share.shareAmount,
                note: note || '',
                status: 'pending'
            }
        });

        return res.status(201).json({ message: "Pengajuan pembayaran berhasil dikirim", payment: newPayment });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal membuat pengajuan pembayaran" });
    }
});

export { router as createPaymentRouter };
