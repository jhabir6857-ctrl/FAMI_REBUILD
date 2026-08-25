const hits = new Map<string, number[]>()

/**
 * Returns true if `key` (typically `${route}:${ip}`) has stayed under
 * `limit` requests within the trailing `windowMs`. Records the current
 * request as a side effect when allowed.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (hits.get(key) ?? []).filter(t => t > windowStart)

  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)
  return true
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
