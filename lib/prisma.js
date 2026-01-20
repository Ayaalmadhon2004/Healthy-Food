import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaClient = globalForPrisma.prismaClient || new PrismaClient({
  adapter,
  log: ['error'],
});

// Backward compatibility export
export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prismaClient;
}