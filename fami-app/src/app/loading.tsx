import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-6 opacity-80">
        {/* We use a bespoke pulse animation (defined in globals.css) */}
        <div className="absolute inset-0 bg-[var(--color-rose-gold)]/20 animate-fami-pulse rounded-full" />
        <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center">
          <Image
            src="/logo.jpg"
            alt="Loading..."
            width={48}
            height={48}
            className="object-contain rounded-full opacity-60"
            priority
          />
        </div>
      </div>
      <p className="font-ui text-xs text-[var(--color-text-muted)] tracking-widest uppercase animate-fade-in-up">
        Curating...
      </p>
    </div>
  )
}
