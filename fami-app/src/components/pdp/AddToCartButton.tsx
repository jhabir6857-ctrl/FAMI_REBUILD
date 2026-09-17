'use client'

import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  function handleAdd() {
    if (product.stock === 0) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0] ?? '/hero.jpg',
      slug: product.slug,
      stock: product.stock,
    })
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        disabled={product.stock === 0}
        onClick={handleAdd}
        className="w-full"
      >
        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
      </Button>
    </>
  )
}
