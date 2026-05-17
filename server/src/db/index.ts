import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(error);
    logger.error({ error, path: '/', method: 'GET' }, 'Database connection failed');

    process.exit(1);
  }
}