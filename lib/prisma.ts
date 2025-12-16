import { PrismaClient } from '@prisma/client';
import { Pool } from '@vercel/postgres';
import { PrismaPg } from '@prisma/adapter-pg';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    // Use Vercel Postgres adapter in production
    if (process.env.POSTGRES_PRISMA_URL) {
      const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter, log: ['error'] });
    }
    
    // Use standard connection in development
    return new PrismaClient({ log: ['error'] });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

