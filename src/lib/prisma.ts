import { PrismaClient } from '@prisma/client'
import { PrismaNeon, PrismaNeonHTTP } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  return connectionString
}

function createPrismaClient(): PrismaClient {
  // Cloudflare Workers reuse modules across requests, but WebSocket pools are
  // bound to the request that created them. HTTP queries keep this singleton
  // free of cross-request I/O objects.
  return new PrismaClient({
    adapter: new PrismaNeonHTTP(getConnectionString(), {}),
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export function createTransactionalPrismaClient(): PrismaClient {
  const connectionString = getConnectionString()
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
