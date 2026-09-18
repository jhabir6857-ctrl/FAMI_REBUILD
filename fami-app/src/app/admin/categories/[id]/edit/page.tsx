import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/data'
import { CategoryEditForm } from './CategoryEditForm'

export const metadata = { title: 'Edit Category Image · Admin' }

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const catId = parseInt(id, 10)
  if (isNaN(catId)) notFound()

  const category = await getCategoryById(catId)
  if (!category) notFound()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-medium">Edit Category: {category.name}</h1>
      <div className="rounded border border-[#e0e0e0] bg-white p-6">
        <CategoryEditForm category={category} />
      </div>
    </div>
  )
}
