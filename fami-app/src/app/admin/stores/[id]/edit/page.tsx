import { notFound } from 'next/navigation'
import { getStores } from '@/lib/data'
import { StoreForm } from '@/components/admin/StoreForm'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit store · Admin' }

export default async function EditStorePage({ params }: Props) {
  const { id } = await params
  const stores = await getStores()
  const store = stores.find(s => s.id === Number(id))
  if (!store) notFound()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">Edit — {store.name}</h1>
      <StoreForm store={store} />
    </div>
  )
}
