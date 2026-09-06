import { useCallback, useEffect, useRef, useState } from 'react'
import { FullscreenButton } from './FullscreenButton'
import { RosePoster } from './RosePoster'
import { useFullscreen } from '@/hooks/useFullscreen'

interface Props {
  src: string
  poster?: string
  onEnded?: () => void
  onPlay?: () => void
  onPause?: () => void
  autoPlay?: boolean
  className?: string
  /** aria description of the clip. */
  label?: string
  /** Caption on the rose thumbnail shown while loading or if it fails. */
  posterLabel?: string
}

/**
 * A custom-chromed HTML5 player: attempts autoplay (with sound, since it
 * mounts right after a user gesture), gracefully falls back to a tap-to-play
 * button, and exposes play/pause/seek without the generic browser UI.
 * Handles buffering and load-failure states so the story never hard-stops.
 */
export function VideoPlayer({
  src,
  poster,
  onEnded,
  onPlay,
  onPause,
  autoPlay = true,
  className = '',
  label = 'video',
  posterLabel,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const hideTimer = useRef<number | null>(null)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(shellRef, ref)

  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [progress, setProgress] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)

  const play = useCallback(() => {
    const v = ref.current
    if (!v) return
    v.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true))
  }, [])

  const toggle = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.paused) play()
    else v.pause()
  }, [play])

  // Attempt playback as soon as the element is ready.
  useEffect(() => {
    if (autoPlay) play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (ref.current && !ref.current.paused) setControlsVisible(false)
    }, 2600)
  }, [])

  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current) }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      toggle()
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = ref.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }

  return (
    <div
      ref={shellRef}
      className={`fs-target group relative overflow-hidden rounded-2xl bg-black ${className}`}
      onPointerMove={revealControls}
      onKeyDown={onKey}
      tabIndex={0}
      role="group"
      aria-label={label}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        className="h-full w-full object-contain"
        onPlay={() => {
          setPlaying(true)
          setBuffering(false)
          onPlay?.()
          revealControls()
        }}
        onPause={() => {
          setPlaying(false)
          setControlsVisible(true)
          onPause?.()
        }}
        onLoadedData={() => {
          setReady(true)
          setBuffering(false)
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (v.duration) setProgress(v.currentTime / v.duration)
        }}
        onEnded={() => {
          setPlaying(false)
          setControlsVisible(true)
          onEnded?.()
        }}
        onError={() => {
          setError(true)
          setBuffering(false)
        }}
      />

      {/* Rose thumbnail — covers loading and load failure alike. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !ready || error ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <RosePoster name={posterLabel} loading={!error && buffering} failed={error} />
      </div>

      {/* Always reachable, even while the thumbnail is up. */}
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        className="absolute right-3 top-3 z-10"
      />

      {/* Center play (initial / after tap-to-play fallback) */}
      {!error && ready && (needsTap || (!playing && progress === 0)) && (
        <button
          type="button"
          onClick={play}
          aria-label="Play video"
          className="absolute inset-0 grid place-items-center bg-black/25"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-xl">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 5l11 7-11 7V5z" fill="#c1121f" />
            </svg>
          </span>
        </button>
      )}

      {/* Bottom control bar */}
      {!error && (
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5l11 7-11 7V5z" />
              </svg>
            )}
          </button>
          <div
            className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/25"
            onClick={seek}
            role="presentation"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
