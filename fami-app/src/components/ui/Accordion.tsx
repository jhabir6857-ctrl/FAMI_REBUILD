'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col border-t border-[#2b1f2e]/10">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="border-b border-[#2b1f2e]/10">
            <button
              onClick={() => toggle(item.id)}
              className="flex items-center justify-between w-full py-4 text-left touch-target group"
              aria-expanded={isOpen}
            >
              <span className="font-ui text-sm font-medium tracking-wider uppercase text-[var(--color-ink-plum)] group-hover:text-[var(--color-rose-gold)] transition-micro">
                {item.title}
              </span>
              <span className="text-[var(--color-ink-plum)] transition-transform duration-300">
                {isOpen ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-400 ease-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
            >
              <div className="font-ui text-sm text-[var(--color-text-muted)] leading-relaxed prose prose-sm prose-p:my-2">
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
