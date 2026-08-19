import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

// Endpoint: DELETE /expenses/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    const expenseId = req.params.id as string;
    const userId = res.locals.user.userId;

    // 1. Ambil data tagihan beserta shares-nya
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: { shares: true }
    });

    if (!expense) {
        return res.status(404).json({ message: "Tagihan tidak ditemukan" });
    }

    // 2. Pastikan yang menghapus adalah pembuat/penombok tagihan
    if (expense.paidBy !== userId) {
        return res.status(403).json({ message: "Kamu bukan penombok tagihan ini, tidak berhak menghapus." });
    }

    // 3. Validasi: Apakah ada anggota (selain penombok) yang sudah lunas?
    const hasPaidShares = expense.shares.some(share => share.isPaid && share.userId !== userId);
    
    if (hasPaidShares) {
        return res.status(400).json({ 
            message: "Tidak dapat menghapus tagihan ini karena sudah ada anggota yang membayar lunas." 
        });
    }

    // 4. Proses Hapus secara berurutan (Prisma Transaction)
    // Hapus Payment -> Hapus ExpenseShare -> Hapus Expense
    await prisma.$transaction(async (tx) => {
        // Ambil semua ID share untuk tagihan ini
        const shareIds = expense.shares.map(s => s.id);

        // Hapus semua Payment yang nyangkut di shares (misal yang masih pending/rejected)
        await tx.payment.deleteMany({
            where: { expenseShareId: { in: shareIds } }
        });

        // Hapus semua shares
        await tx.expenseShare.deleteMany({
            where: { expenseId: expenseId }
        });

        // Hapus Expense utamanya
        await tx.expense.delete({
            where: { id: expenseId }
        });
    });

    return res.status(200).json({ message: "Tagihan berhasil dihapus." });

});

export { router as deleteExpenseRouter };
