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
    // In development, don't initialize Prisma at all - use JSON storage
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Using JSON storage in development');
    }

    // Check if we have Vercel Postgres environment variables
    if (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_URL_NON_POOLING) {
      // Use Vercel Postgres adapter in production
      const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter, log: ['error'] });
    }

    // For production without database, throw an error
    throw new Error('Database not configured. Please set up Vercel Postgres.');
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

