import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prismaClientSingleton();
}

export const prisma = globalForPrisma.prisma;
