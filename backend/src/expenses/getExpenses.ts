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

        // --- POLA PIKIR PAGINATION (LANGKAH 1) ---
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // --- POLA PIKIR FILTER TANGGAL (LANGKAH 3) ---
        // Jika user memilih tanggal dari kalender, kita saring datanya.
        const dateFilter = req.query.date as string;
        const whereClause: any = { groupId: groupId };
        
        if (dateFilter) {
            // Karena di database ada jamnya (misal: 2026-08-14T15:30:00Z)
            // Kita harus mencari dari awal hari (00:00) sampai akhir hari (23:59)
            const startDate = new Date(dateFilter);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1); // Tambah 1 hari untuk batas akhir
            
            whereClause.expenseDate = {
                gte: startDate, // >= 00:00
                lt: endDate     // < besoknya
            };
        }

        // TODO 2: Ambil Daftar Tagihan dari Database dengan Batasan
        const expenses = await prisma.expense.findMany({
            where: whereClause, // Gunakan where dinamis yang kita buat
            skip: skip,
            take: limit,
            include: {
                shares: true,
                paidByUser: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                expenseDate: 'desc'
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
