import { db } from './db'
import { rateLimits } from './db/schema'
import { eq, gt } from 'drizzle-orm'

/**
 * Returns true if `key` (typically `${route}:${ip}`) has stayed under
 * `limit` requests within the trailing `windowMs`. Records the current
 * request as a side effect when allowed.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  // SQLite/Turso doesn't have a direct 'delete older than' in a single easy Drizzle call without raw SQL,
  // but we can query recent first, check length, then insert.
  
  const recent = await db.query.rateLimits.findMany({
    where: (rl, { and, eq, gt }) => and(eq(rl.key, key), gt(rl.timestamp, windowStart))
  })

  if (recent.length >= limit) {
    return false
  }

  await db.insert(rateLimits).values({ key, timestamp: now })
  return true
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
