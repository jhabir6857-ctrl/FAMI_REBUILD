'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/types'

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' }
]

export function ShopControls({ categories, totalItems, currentCategory }: { categories: Category[], totalItems: number, currentCategory?: string }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentSort = searchParams.get('sort') || 'newest'
  const inStock = searchParams.get('inStock') === 'true'

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (isFilterOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isFilterOpen])

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newSort === 'newest') params.delete('sort')
    else params.set('sort', newSort)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleInStockChange = (newInStock: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newInStock) params.set('inStock', 'true')
    else params.delete('inStock')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">{currentCategory || 'All products'}</h1>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">{totalItems} items</p>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer font-ui text-sm text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro">
            <input 
              type="checkbox" 
              checked={inStock}
              onChange={(e) => handleInStockChange(e.target.checked)}
              className="rounded-sm border-[#2b1f2e]/20 text-[var(--color-rose-gold)] focus:ring-[var(--color-rose-gold)]" 
            />
            In Stock Only
          </label>
          <div className="relative group">
            <button className="flex items-center gap-2 font-ui text-sm text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro">
              Sort by <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#2b1f2e]/5 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2 flex flex-col">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`text-left px-4 py-2 font-ui text-sm transition-micro ${currentSort === option.value ? 'text-[var(--color-rose-gold)] bg-[var(--color-parchment)]/30' : 'text-[var(--color-ink-plum)] hover:bg-[var(--color-parchment)]/50'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Trigger */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-[#2b1f2e]/10 font-ui text-sm font-medium text-[var(--color-ink-plum)] hover:bg-[#2b1f2e]/5 transition-micro"
        >
          <SlidersHorizontal size={16} />
          Filter & Sort
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <button 
            aria-label="Close filters"
            className="absolute inset-0 bg-[var(--color-ink-plum)]/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Sheet */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-[20px] shadow-2xl flex flex-col animate-fade-in-up" style={{ animationDuration: '400ms' }}>
            <div className="flex items-center justify-between p-6 border-b border-[#2b1f2e]/5">
              <h2 className="font-editorial text-xl font-medium text-[var(--color-ink-plum)]">Filter & Sort</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
                className="touch-target flex items-center justify-center text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {/* Category Navigation */}
              <div>
                <h3 className="font-ui text-sm font-medium text-[var(--color-ink-plum)] uppercase tracking-wider mb-4">Categories</h3>
                <div className="flex flex-col gap-4">
                  <Link href={`/shop?${searchParams.toString()}`} onClick={() => setIsFilterOpen(false)} className={`font-ui text-base transition-micro ${!currentCategory ? 'text-[var(--color-rose-gold)] font-medium' : 'text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)]'}`}>
                    All Products
                  </Link>
                  {categories.map(cat => (
                    <Link key={cat.id} href={`/shop/${cat.slug}?${searchParams.toString()}`} onClick={() => setIsFilterOpen(false)} className={`font-ui text-base transition-micro ${currentCategory === cat.name ? 'text-[var(--color-rose-gold)] font-medium' : 'text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)]'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="font-ui text-sm font-medium text-[var(--color-ink-plum)] uppercase tracking-wider mb-4">Filters</h3>
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={inStock}
                    onChange={(e) => handleInStockChange(e.target.checked)}
                    className="w-5 h-5 rounded-sm border-[#2b1f2e]/20 text-[var(--color-rose-gold)] focus:ring-[var(--color-rose-gold)]" 
                  />
                  <span className="font-ui text-base text-[var(--color-ink-plum)]">In Stock Only</span>
                </label>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="font-ui text-sm font-medium text-[var(--color-ink-plum)] uppercase tracking-wider mb-4">Sort By</h3>
                <div className="flex flex-col gap-3">
                  {SORT_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        checked={currentSort === option.value}
                        onChange={() => handleSortChange(option.value)}
                        className="w-5 h-5 border-[#2b1f2e]/20 text-[var(--color-rose-gold)] focus:ring-[var(--color-rose-gold)]" 
                      />
                      <span className={`font-ui text-base transition-micro ${currentSort === option.value ? 'text-[var(--color-rose-gold)] font-medium' : 'text-[var(--color-ink-plum)]'}`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#2b1f2e]/5 bg-white">
              <Button className="w-full h-14 text-base tracking-wider" onClick={() => setIsFilterOpen(false)}>
                Show {totalItems} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
