export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="relative aspect-[3/4] bg-black overflow-hidden rounded-[var(--radius-lg)]">
      <video src={src} poster={poster} autoPlay muted loop playsInline className="w-full h-full object-cover" />
    </div>
  )
}
