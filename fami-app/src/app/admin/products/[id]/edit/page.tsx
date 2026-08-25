import { notFound } from 'next/navigation'
import { getProductById, getCategories } from '@/lib/data'
import { ProductForm } from '@/components/admin/ProductForm'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit product · Admin' }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([getProductById(Number(id)), getCategories()])
  if (!product) notFound()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">Edit — {product.name}</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
