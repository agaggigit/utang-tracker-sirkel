import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config()

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("FATAL ERROR: DATABASE_URL belum diatur di file .env");
}

const pool = new Pool({ 
    connectionString,
    max: 1 // Vercel (Serverless) hanya menangani 1 request per instance, jadi max 1 koneksi sudah cukup dan mencegah error "max clients"
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter })