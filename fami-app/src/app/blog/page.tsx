import Image from 'next/image'
import Link from 'next/link'
import { getBlogPosts, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Journal' }

export default async function BlogPage() {
  const [posts, categories, stores, session] = await Promise.all([getBlogPosts(), getCategories(), getStores(), auth()])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10">
        <h1 className="font-display text-3xl md:text-5xl font-medium text-[var(--color-ink-plum)] mb-2">The Journal</h1>
        <p className="font-ui text-sm text-[var(--color-text-muted)] mb-10">Style notes, care guides, and curatorial thoughts from the FaMi team.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
              {post.imageUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)]">
                  <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(tag => <span key={tag} className="font-ui text-xs text-[var(--color-terracotta)] uppercase tracking-wide">{tag}</span>)}
                </div>
                <h2 className="font-editorial text-xl text-[var(--color-ink-plum)] leading-snug group-hover:text-[var(--color-rose-gold)] transition-micro">{post.title}</h2>
                <p className="font-ui text-sm text-[var(--color-text-muted)] line-clamp-3">{post.excerpt}</p>
                <span className="font-ui text-xs text-[var(--color-rose-gold)] font-medium mt-1">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
