import { getCategories } from '@/lib/data'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = { title: 'New product · Admin' }

export default async function NewProductPage() {
  const categories = await getCategories()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">New product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
