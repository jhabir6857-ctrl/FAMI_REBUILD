import Link from 'next/link'
import { getStores } from '@/lib/data'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata = { title: 'Stores · Admin' }

export default async function AdminStoresPage() {
  const stores = await getStores()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Store locations</h1>
        <Link href="/admin/stores/new" className="rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333]">
          + Add store
        </Link>
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        {stores.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No stores yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{s.address}</td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{s.hours || '—'}</td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{s.phone ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/stores/${s.id}/edit`} className="text-xs text-[#4a4a4a] hover:underline">Edit</Link>
                      <DeleteButton apiPath={`/api/admin/stores/${s.id}`} redirectTo="/admin/stores" />
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
