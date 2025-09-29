import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Memory optimization: Configure connection pooling
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Reduce memory usage with optimized logging
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool optimization for memory efficiency
  __internal: {
    engine: {
      // Limit connection pool size to reduce memory usage
      connectionLimit: 5,
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma