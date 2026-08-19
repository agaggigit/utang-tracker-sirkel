import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/:id', authenticate, async (req: Request, res: Response) => {
    const groupId = req.params.id as string;
    
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            id: true,
            name: true,
            joinApprovalRequired: true,
            inviteCode: true,
            createdById: true
        }
    });

    if (!group) {
        return res.status(404).json({ message: 'Grup tidak ditemukan' });
    }

    return res.status(200).json(group);
});

export { router as getGroupDetailsRouter };
