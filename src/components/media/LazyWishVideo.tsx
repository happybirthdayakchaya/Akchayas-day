import { useEffect, useRef, useState } from 'react'
import type { Wish } from '@/config/wishes'
import { RosePoster } from './RosePoster'

interface Props {
  wish: Wish
  active: boolean
  /** `auto` for current/next (preload); `metadata` otherwise. */
  preload: 'auto' | 'metadata'
  onEnded: () => void
  /** Reports width/height once known, so the frame can match the clip. */
  onAspect?: (ratio: number) => void
}

/**
 * One wish clip that manages its own element. The parent only keeps a 3-wide
 * window mounted (previous / current / next), so unmounting a LazyWishVideo
 * releases its buffers — never all 35 videos in memory at once.
 * Only the active clip plays; a failed clip auto-advances so it can't stall.
 */
export function LazyWishVideo({ wish, active, preload, onEnded, onAspect }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  // Play when we become the active clip; rewind + pause when we leave.
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) {
      v.currentTime = 0
      v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true))
    } else {
      v.pause()
    }
  }, [active])

  // A broken active clip shouldn't trap the viewer — move on gracefully.
  useEffect(() => {
    if (!active || !error) return
    const t = window.setTimeout(onEnded, 2400)
    return () => window.clearTimeout(t)
  }, [active, error, onEnded])

  const tap = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true))
    else v.pause()
  }

  // Show the rose until there is an actual frame to show, or if it failed.
  const showPoster = !ready || error

  return (
    <div
      // Short cross-fade: with no gap between clips, a long fade would itself
      // read as a delay.
      className="absolute inset-0 transition-opacity duration-300"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
    >
      <video
        ref={ref}
        src={wish.src}
        poster={wish.poster}
        playsInline
        preload={preload}
        // `contain` guarantees nothing is cropped; the parent reshapes the
        // frame to the clip's own aspect, so there are no bars in practice.
        className="h-full w-full object-contain"
        onClick={tap}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          if (v.videoWidth && v.videoHeight) onAspect?.(v.videoWidth / v.videoHeight)
        }}
        onLoadedData={() => {
          setReady(true)
          setBuffering(false)
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => active && onEnded()}
        onError={() => {
          setError(true)
          setBuffering(false)
        }}
      />

      {/* Rose thumbnail — covers loading and network failure alike. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          showPoster ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <RosePoster name={wish.name} loading={!error && buffering} failed={error} />
      </div>

      {active && needsTap && !error && (
        <button
          type="button"
          onClick={tap}
          aria-label="Play wish"
          className="absolute inset-0 grid place-items-center bg-black/20"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 shadow-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 5l11 7-11 7V5z" fill="#c1121f" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
