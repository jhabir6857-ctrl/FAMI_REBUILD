import { StoreForm } from '@/components/admin/StoreForm'

export const metadata = { title: 'New store · Admin' }

export default function NewStorePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">Add store location</h1>
      <StoreForm />
    </div>
  )
}
