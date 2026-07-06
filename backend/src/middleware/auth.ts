import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Akses ditolak. Token tidak ditemukan"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("FATAL ERROR: JWT_SECRET belum diatur di file .env");
        }

        const decoded = jwt.verify(token, secretKey);
        res.locals.user = decoded;

        next();
    } catch {
        return res.status(401).json({ 
            message: "Token tidak valid atau sudah kadaluwarsa." 
        });
    }
}