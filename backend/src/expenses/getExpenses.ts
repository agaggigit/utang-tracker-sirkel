import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/:id/expenses', authenticate, async (req: Request, res: Response) => {
    try {
        const groupId = req.params.id as string;
        const userId = res.locals.user.userId;

        // TODO 1: Validasi Keanggotaan Grup
        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId: groupId,
                userId: userId
            }
        });

        if (!isMember) {
            return res.status(403).json({ message: "Kamu bukan anggota grup ini" });
        }

        // TODO 2: Ambil Daftar Tagihan dari Database
        const expenses = await prisma.expense.findMany({
            where: { groupId: groupId },
            include: {
                shares: true, // Ambil pembagian utangnya
                paidByUser: { // Ambil info penombok
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                expenseDate: 'desc' // Urutkan dari yang paling baru
            }
        });
        
        // TODO 3: Return Response
        return res.status(200).json(expenses);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data tagihan' });
    }
});

export { router as getExpensesRouter };
