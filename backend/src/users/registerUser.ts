import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = Router()

const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8).regex(/[a-z]/),
    confirmPassword: z.string()
});

router.post('/register', async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }

    try {
        const { name, email, password, confirmPassword } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (existingUser) {
            return res.status(400).json({  
                message: "Email sudah terdaftar, silahkan gunakan email lain"
            });
        } 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const registerUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                passwordHash: hashedPassword,
            },
        });

        return res.status(201).json({
            message: "Pendaftaran berhasil",
            user: {
                id: registerUser.id,
                name: registerUser.name,
                email:  registerUser.email
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

export { router as registerRouter }