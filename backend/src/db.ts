import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config()

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("FATAL ERROR: DATABASE_URL belum diatur di file .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter })