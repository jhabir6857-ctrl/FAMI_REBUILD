import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/data'

export const metadata = { title: 'Categories · Admin' }

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Categories</h1>
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        {categories.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                  <th className="px-5 py-3 font-medium w-16">Image</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#e0e0e0] bg-[#f5f5f5]">
                        {cat.imageUrl ? (
                          <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#8a8a8a]">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium">{cat.name}</td>
                    <td className="px-5 py-3 text-[#8a8a8a]">{cat.slug}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/categories/${cat.id}/edit`} className="rounded bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#333]">
                        Edit Image
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
