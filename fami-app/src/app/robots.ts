import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://famibd.shop'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/account', '/login', '/register'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
