import { notFound } from 'next/navigation'
import { getBlogPostById } from '@/lib/data'
import { BlogForm } from '@/components/admin/BlogForm'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit post · Admin' }

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  const post = await getBlogPostById(Number(id))
  if (!post) notFound()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">Edit — {post.title}</h1>
      <BlogForm post={post} />
    </div>
  )
}
