import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBlogPostBySlug, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  return { title: post?.title ?? 'Journal' }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, categories, stores, session] = await Promise.all([getBlogPostBySlug(slug), getCategories(), getStores(), auth()])
  if (!post) notFound()
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10 max-w-3xl">
        <Link href="/blog" className="font-ui text-xs text-[var(--color-text-muted)] hover:text-[var(--color-rose-gold)] transition-micro mb-8 inline-block">← Back to journal</Link>
        <div className="flex gap-2 flex-wrap mb-4">
          {post.tags.map(tag => <span key={tag} className="font-ui text-xs text-[var(--color-terracotta)] uppercase tracking-wide">{tag}</span>)}
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-medium text-[var(--color-ink-plum)] leading-tight mb-6">{post.title}</h1>
        {post.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-sm)] mb-8">
            <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" priority />
          </div>
        )}
        <div
          className="font-ui text-base text-[var(--color-ink-plum)] leading-relaxed prose-p:mb-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
