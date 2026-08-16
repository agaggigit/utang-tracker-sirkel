import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../db";

const router = Router();

router.get('/:id/members', authenticate, async (req: Request, res: Response) => {
    try {
        const groupId = req.params.id as string;

        // Ambil semua member grup beserta nama usernya
        const members = await prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Format ulang datanya agar frontend mudah membacanya
        // Dari [{ user: { id, name } }] menjadi [{ id, name }]
        const formattedMembers = members.map(m => ({
            id: m.user.id,
            name: m.user.name
        }));

        return res.status(200).json(formattedMembers);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal mengambil daftar anggota grup' });
    }
});

export { router as getGroupMembersRouter };
