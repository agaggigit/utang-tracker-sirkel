import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/[a-z]/)
});

router.post('/login', async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }

    try {
        const { email, password } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!existingUser) {
            return res.status(401).json({  
                message: "Email atau password salah"
            });
        } 

        if (!existingUser.passwordHash) {
            return res.status(401).json({
                message: "Akun ini didaftarkan melalui Google. Silhkan gunakan tombol login with Google"
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash)

        if (!isPasswordValid) {
            return res.status(401).json({  
                message: "Email atau password salah"
            });
        }

        // JWT
        const payload = {
            userId: existingUser.id
        };

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("FATAL ERROR: JWT_SECRET belum diatur di file .env")
        }

        const token = jwt.sign(payload, secretKey, {
            expiresIn: '7d'
        })

        return res.status(200).json({
            message: "Login berhasil",
            token: token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

export { router as loginRouter }