import Link from 'next/link'
import { getAllBlogPostsAdmin } from '@/lib/data'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata = { title: 'Blog · Admin' }

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Blog posts</h1>
        <Link href="/admin/blog/new" className="rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333]">
          + New post
        </Link>
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        {posts.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No posts yet. <Link href="/admin/blog/new" className="underline">Write one →</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Published</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-[#8a8a8a] line-clamp-1">{p.excerpt}</div>
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{p.tags.join(', ') || '—'}</td>
                  <td className="px-5 py-3 text-[#8a8a8a]">{new Date(p.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/blog/${p.slug}`} target="_blank" className="text-xs text-[#4a4a4a] hover:underline">View</Link>
                      <Link href={`/admin/blog/${p.id}/edit`} className="text-xs text-[#4a4a4a] hover:underline">Edit</Link>
                      <DeleteButton apiPath={`/api/admin/blog/${p.id}`} redirectTo="/admin/blog" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
