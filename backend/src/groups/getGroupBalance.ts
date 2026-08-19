import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/:id/balance', authenticate, async (req: Request, res: Response) => {
    const groupId = req.params.id as string;
    const currentUserId = res.locals.user.userId;

    // Validasi apakah user bagian dari grup
    const member = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: groupId,
                userId: currentUserId
            }
        }
    });

    if (!member) {
        return res.status(403).json({ message: "Kamu bukan anggota grup ini" });
    }

    // Ambil semua tagihan di grup ini yang memiliki share belum lunas
    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
            shares: {
                where: { isPaid: false },
                include: { user: { select: { id: true, name: true } } }
            },
            paidByUser: { select: { id: true, name: true } }
        }
    });

    // Map untuk menampung balance per pasangan user (hanya dari sudut pandang current user)
    const balances = new Map<string, { userId: string, name: string, netAmount: number }>();
    // netAmount positif = mereka utang ke aku
    // netAmount negatif = aku utang ke mereka

    for (const exp of expenses) {
        if (exp.paidBy === currentUserId) {
            // Tagihan ini ditalangi oleh aku, anggota lain utang ke aku
            for (const share of exp.shares) {
                if (share.userId === currentUserId) continue; // utang diriku sendiri diabaikan
                
                const b = balances.get(share.userId) || { userId: share.userId, name: share.user.name, netAmount: 0 };
                b.netAmount += Number(share.shareAmount);
                balances.set(share.userId, b);
            }
        } else {
            // Tagihan ini ditalangi orang lain
            const myShare = exp.shares.find(s => s.userId === currentUserId);
            if (myShare) {
                // Aku berutang ke orang ini
                const b = balances.get(exp.paidBy) || { userId: exp.paidBy, name: exp.paidByUser.name, netAmount: 0 };
                b.netAmount -= Number(myShare.shareAmount);
                balances.set(exp.paidBy, b);
            }
        }
    }

    const iOwe: { userId: string, name: string, amount: number }[] = [];
    const owedToMe: { userId: string, name: string, amount: number }[] = [];
    let totalIOwe = 0;
    let totalOwedToMe = 0;

    balances.forEach((b) => {
        if (b.netAmount > 0) {
            owedToMe.push({ userId: b.userId, name: b.name, amount: b.netAmount });
            totalOwedToMe += b.netAmount;
        } else if (b.netAmount < 0) {
            const amount = Math.abs(b.netAmount);
            iOwe.push({ userId: b.userId, name: b.name, amount });
            totalIOwe += amount;
        }
    });

    return res.status(200).json({
        iOwe,
        owedToMe,
        totalIOwe,
        totalOwedToMe
    });

});

export { router as getGroupBalanceRouter };
