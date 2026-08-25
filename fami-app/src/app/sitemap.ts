import type { MetadataRoute } from 'next'
import { getProducts, getBlogPosts } from '@/lib/data'

const BASE = process.env.NEXTAUTH_URL ?? 'https://famibd.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts(), getBlogPosts()])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE}/shop`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE}/blog`, lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly' },
    { url: `${BASE}/about`, lastModified: new Date(), priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/contact`, lastModified: new Date(), priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/loyalty`, lastModified: new Date(), priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/store-locator`, lastModified: new Date(), priority: 0.6, changeFrequency: 'monthly' },
  ]

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(),
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  }))

  const blogPages: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.createdAt),
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
