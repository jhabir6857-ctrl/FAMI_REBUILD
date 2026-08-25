'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [showToast, setShowToast] = useState(false)

  function handleAdd() {
    if (product.stock === 0) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0] ?? '',
      slug: product.slug,
      stock: product.stock,
    })
    setShowToast(true)
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
      {showToast && (
        <Toast
          message={`${product.name} added to cart`}
          type="success"
          onDismiss={() => setShowToast(false)}
        />
      )}
    </>
  )
}
