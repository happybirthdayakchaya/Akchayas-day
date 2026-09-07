import { useCallback, useEffect, useRef, useState } from 'react'
import { FullscreenButton } from './FullscreenButton'
import { MuteButton } from './MuteButton'
import { RosePoster } from './RosePoster'
import { useFullscreen } from '@/hooks/useFullscreen'

interface Props {
  /**
   * The video, in order. More than one entry is treated as a single video cut
   * into parts — they play back to back with no visible break.
   */
  sources: string[]
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
 * A custom-chromed HTML5 player.
 *
 * Multi-part playback: a long video that had to be split for upload is handed
 * over as several files. Every part is mounted at once; the next one is warmed
 * up in the background while the current plays, so switching at the boundary
 * is instant. Duration, the scrubber and seeking all work across the whole
 * thing, so it behaves exactly like one continuous video.
 */
export function VideoPlayer({
  sources,
  poster,
  onEnded,
  onPlay,
  onPause,
  autoPlay = true,
  className = '',
  label = 'video',
  posterLabel,
}: Props) {
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const shellRef = useRef<HTMLDivElement | null>(null)
  const hideTimer = useRef<number | null>(null)
  const warmed = useRef(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(shellRef)

  const [index, setIndex] = useState(0)
  const [durations, setDurations] = useState<number[]>(() => sources.map(() => 0))
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)

  const total = durations.reduce((a, b) => a + b, 0)
  const before = useCallback(
    (i: number) => durations.slice(0, i).reduce((a, b) => a + b, 0),
    [durations],
  )

  const play = useCallback(() => {
    const v = videos.current[index]
    if (!v) return
    v.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true))
  }, [index])

  const toggle = useCallback(() => {
    const v = videos.current[index]
    if (!v) return
    if (v.paused) play()
    else v.pause()
  }, [index, play])

  useEffect(() => {
    if (autoPlay) play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep every element's muted flag in step with the button.
  useEffect(() => {
    videos.current.forEach((v) => {
      if (v) v.muted = muted
    })
  }, [muted, index])

  // Only ever one part playing.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (v && i !== index) v.pause()
    })
  }, [index])

  /** Start buffering the later parts once the first one is actually rolling. */
  const warmRest = useCallback(() => {
    if (warmed.current || sources.length < 2) return
    warmed.current = true
    videos.current.forEach((v, i) => {
      if (v && i !== 0) {
        v.preload = 'auto'
        v.load()
      }
    })
  }, [sources.length])

  const advance = useCallback(() => {
    const next = index + 1
    if (next >= sources.length) {
      setPlaying(false)
      setControlsVisible(true)
      onEnded?.()
      return
    }
    const v = videos.current[next]
    setIndex(next)
    if (v) {
      v.currentTime = 0
      v.muted = muted
      void v.play().catch(() => setNeedsTap(true))
    }
  }, [index, muted, onEnded, sources.length])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      const v = videos.current[index]
      if (v && !v.paused) setControlsVisible(false)
    }, 2600)
  }, [index])

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    },
    [],
  )

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      toggle()
    }
  }

  /** Seek anywhere across the whole video, whichever part that lands in. */
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!total) return
    const rect = e.currentTarget.getBoundingClientRect()
    const target = ((e.clientX - rect.left) / rect.width) * total

    let acc = 0
    for (let i = 0; i < sources.length; i++) {
      const d = durations[i] || 0
      const last = i === sources.length - 1
      if (target < acc + d || last) {
        const offset = Math.max(0, Math.min(d, target - acc))
        if (i !== index) {
          videos.current[index]?.pause()
          setIndex(i)
        }
        const v = videos.current[i]
        if (v) {
          v.currentTime = offset
          if (playing) void v.play().catch(() => {})
        }
        setProgress(target / total)
        return
      }
      acc += d
    }
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
      {sources.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            videos.current[i] = el
          }}
          src={src}
          poster={i === 0 ? poster : undefined}
          playsInline
          preload={i === 0 ? 'auto' : 'metadata'}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-150"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration
            if (Number.isFinite(d)) {
              setDurations((prev) => {
                if (prev[i] === d) return prev
                const next = [...prev]
                next[i] = d
                return next
              })
            }
          }}
          onLoadedData={() => {
            if (i === index) {
              setReady(true)
              setBuffering(false)
            }
          }}
          onPlay={() => {
            if (i !== index) return
            setPlaying(true)
            setBuffering(false)
            warmRest()
            onPlay?.()
            revealControls()
          }}
          onPause={() => {
            if (i !== index) return
            setPlaying(false)
            setControlsVisible(true)
            onPause?.()
          }}
          onWaiting={() => i === index && setBuffering(true)}
          onPlaying={() => i === index && setBuffering(false)}
          onCanPlay={() => i === index && setBuffering(false)}
          onTimeUpdate={(e) => {
            if (i !== index || !total) return
            setProgress((before(i) + e.currentTarget.currentTime) / total)
          }}
          onEnded={() => i === index && advance()}
          onError={() => {
            if (i !== index) return
            setError(true)
            setBuffering(false)
          }}
        />
      ))}

      {/* Rose thumbnail — covers loading and load failure alike. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !ready || error ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <RosePoster name={posterLabel} loading={!error && buffering} failed={error} />
      </div>

      {/* Always reachable, even while the thumbnail is up. */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />
        <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
      </div>

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
          {/* One scrubber for the whole video, spanning every part. */}
          <div
            className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/25"
            onClick={seek}
            role="presentation"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
