import { BlogForm } from '@/components/admin/BlogForm'

export const metadata = { title: 'New post · Admin' }

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">New blog post</h1>
      <BlogForm />
    </div>
  )
}
