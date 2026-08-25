import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/data'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? '5')
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 10) : 5

  if (!q.trim()) return NextResponse.json({ products: [] })

  const products = await searchProducts(q, limit)
  return NextResponse.json({ products })
}
