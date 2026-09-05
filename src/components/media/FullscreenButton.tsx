/** Expand / contract control shared by every video on the site. */
export function FullscreenButton({
  isFullscreen,
  onToggle,
  className = '',
}: {
  isFullscreen: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation() // never let it double as a play/pause tap
        onToggle()
      }}
      aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {isFullscreen ? (
          <path
            d="M9 3v6H3M15 21v-6h6M3 15h6v6M21 9h-6V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}
