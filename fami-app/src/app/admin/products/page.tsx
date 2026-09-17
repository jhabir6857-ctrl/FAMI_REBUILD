import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { formatBDT } from '@/lib/currency'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata = { title: 'Products · Admin' }

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333]">
          + Add product
        </Link>
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        {products.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No products yet. <Link href="/admin/products/new" className="underline">Add one →</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Flags</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-[#8a8a8a]">{p.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{p.categoryName}</td>
                  <td className="px-5 py-3">{formatBDT(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={p.stock === 0 ? 'text-[#a02020]' : p.stock <= 5 ? 'text-[#b05000]' : 'text-[#1a6f3a]'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {p.isNew && <span className="rounded-full bg-[#e8f5ef] px-2 py-0.5 text-xs text-[#1a6f3a]">New</span>}
                      {p.isFeatured && <span className="rounded-full bg-[#f0e8f5] px-2 py-0.5 text-xs text-[#6a1a9a]">Featured</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-[#4a4a4a] hover:underline">Edit</Link>
                      <DeleteButton apiPath={`/api/admin/products/${p.id}`} redirectTo="/admin/products" />
                    </div>
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
