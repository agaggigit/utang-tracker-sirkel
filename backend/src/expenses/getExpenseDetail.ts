import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

// Endpoint: GET /expenses/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const expenseId = req.params.id as string;
        
        // Pola Pikir: Sama seperti getExpenses, tapi kita pakai findUnique
        // Dan kita harus 'include' relasi user di dalam shares agar dapat nama pengutangnya
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            include: {
                paidByUser: {
                    select: { name: true, email: true }
                },
                shares: {
                    include: {
                        user: { // Ambil info user yang berutang
                            select: { name: true, email: true }
                        },
                        payments: {
                            select: { status: true } // Ambil status payment agar frontend tahu kalau ada yang pending
                        }
                    }
                },
                group: {
                    select: { name: true }
                }
            }
        });

        if (!expense) {
            return res.status(404).json({ message: "Tagihan tidak ditemukan" });
        }

        return res.status(200).json(expense);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat mengambil detail tagihan" });
    }
});

export { router as getExpenseDetailRouter };
