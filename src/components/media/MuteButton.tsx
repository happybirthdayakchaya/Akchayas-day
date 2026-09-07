/** Mute / unmute control for a video, styled to match the fullscreen button. */
export function MuteButton({
  muted,
  onToggle,
  className = '',
}: {
  muted: boolean
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
      aria-label={muted ? 'Unmute video' : 'Mute video'}
      aria-pressed={muted}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {muted ? (
          <path
            d="M17 9.5l4 5m0-5l-4 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M16.5 8.8a4.5 4.5 0 010 6.4M19 6.5a8 8 0 010 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  )
}
