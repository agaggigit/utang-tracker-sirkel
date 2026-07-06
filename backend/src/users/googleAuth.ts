import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router()

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthSchema= z.object({
    idToken: z.string().min(1, "Token tidak boleh kosong")
});

router.post('/google', async (req: Request, res: Response) => {
    const result = googleAuthSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        });
    }

    try {
        const { idToken } = result.data;
        
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Token Google tidak valid")
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({
                message: "Akun Google tidak memiliki email"
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        
        let user;
        if (existingUser) {
            user = existingUser;
        } else {
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: name || "Pengguna Google",
                    googleId: googleId,
                    authProvider: "google"
                }
            });
        }

        // JWT
        const jwtPayload = {
            userId: user.id
        };

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("FATAL ERROR: JWT_SECRET belum diatur di file .env")
        }

        const token = jwt.sign(jwtPayload, secretKey, {
            expiresIn: '7d'
        })

        return res.status(200).json({
            message: "Login berhasil",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

export { router as googleAuthRouter }