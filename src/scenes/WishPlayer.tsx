import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { wishes } from '@/config/wishes'
import type { Wish } from '@/config/wishes'
import { LazyWishVideo } from '@/components/media/LazyWishVideo'
import { FullscreenButton } from '@/components/media/FullscreenButton'
import { useFullscreen } from '@/hooks/useFullscreen'
import { ease } from '@/motion/tokens'

const LAST = wishes.length - 1
const PORTRAIT = 9 / 16
const LANDSCAPE = 16 / 9

/** Best guess before the clip's real dimensions are known. */
function assumedRatio(wish: Wish) {
  if (wish.orientation === 'landscape') return LANDSCAPE
  return PORTRAIT
}

/**
 * Fit a clip of the given aspect into the space available, without cropping.
 * Portrait clips run tall; landscape clips run wide. The frame is sized in
 * pixels so it can be animated smoothly between clips.
 */
function frameSize(ratio: number, vw: number, vh: number) {
  const maxH = vh * 0.6
  const maxW = vw * 0.92
  let h = maxH
  let w = h * ratio
  if (w > maxW) {
    w = maxW
    h = w / ratio
  }
  return { w: Math.round(w), h: Math.round(h) }
}

export function WishPlayer() {
  const { goNext } = useExperience()
  const { duck, unduck } = useAudio()

  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  indexRef.current = index
  const timerRef = useRef<number | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const { isFullscreen, toggle } = useFullscreen(frameRef)

  // Measured aspect per wish id, filled in as each clip's metadata loads.
  const [ratios, setRatios] = useState<Record<number, number>>({})
  const [vp, setVp] = useState(() => ({
    w: typeof window === 'undefined' ? 390 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }))

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // Keep the music silent for the whole wishes section (the clips carry voices).
  useEffect(() => {
    duck()
    return () => {
      unduck()
      clearTimer()
    }
  }, [duck, unduck])

  const finish = useCallback(() => {
    clearTimer()
    goNext()
  }, [goNext])

  const goToIndex = useCallback((i: number) => {
    clearTimer()
    setIndex(Math.max(0, Math.min(LAST, i)))
  }, [])

  const next = useCallback(() => {
    if (indexRef.current >= LAST) finish()
    else goToIndex(indexRef.current + 1)
  }, [finish, goToIndex])

  const prev = useCallback(() => goToIndex(indexRef.current - 1), [goToIndex])

  // When the active clip ends, pause on it briefly, then drift onward.
  const handleEnded = useCallback(() => {
    if (!content.flags.autoAdvanceWishes) {
      if (indexRef.current >= LAST) finish()
      return
    }
    clearTimer()
    timerRef.current = window.setTimeout(next, content.flags.wishGapMs)
  }, [finish, next])

  const noteAspect = useCallback((id: number, ratio: number) => {
    setRatios((r) => (r[id] === ratio ? r : { ...r, [id]: ratio }))
  }, [])

  // Arrow-key navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const current = wishes[index]
  const ratio = ratios[current.id] ?? assumedRatio(current)
  const { w, h } = frameSize(ratio, vp.w, vp.h)
  const nn = String(index + 1).padStart(2, '0')
  const total = String(wishes.length).padStart(2, '0')

  return (
    <div className="scene flex flex-col items-center justify-center gap-4 text-blush">
      {/* Counter + person */}
      <div className="flex min-h-14 flex-col items-center gap-1">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-blush/60">
          {nn} <span className="text-blush/35">{content.copy.wishes.counterOf}</span> {total}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: ease.out }}
            className="text-center"
          >
            {/* Handwriting, so it reads like a signature on the wish. */}
            {current.name && (
              <p className="font-hand text-3xl leading-tight text-white sm:text-4xl">
                {current.name}
              </p>
            )}
            {current.caption && (
              <p className="font-body text-sm text-blush/70">{current.caption}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The frame reshapes to each clip — portrait clips run tall, landscape
          clips run wide — so mixed orientations are never cropped.
          Sized directly with a CSS transition rather than an animated value:
          layout must never depend on animation frames (a backgrounded tab
          would otherwise leave the frame stuck at the previous shape). */}
      <div
        className="relative shrink-0 rounded-3xl bg-gradient-to-br from-rose/50 via-gold/30 to-rose-deep/50 p-[3px] shadow-[0_30px_120px_-30px_rgba(0,0,0,0.85)] transition-[width,height] duration-500 ease-out"
        style={{ width: w + 6, height: h + 6 }}
      >
        <div
          ref={frameRef}
          className="fs-target relative h-full w-full overflow-hidden rounded-[calc(1.5rem-3px)] bg-black"
        >
          <FullscreenButton
            isFullscreen={isFullscreen}
            onToggle={toggle}
            className="absolute right-2 top-2 z-10"
          />
          {wishes.map((wish, i) => {
            if (i < index - 1 || i > index + 1) return null // 3-wide window only
            return (
              <LazyWishVideo
                key={wish.id}
                wish={wish}
                active={i === index}
                preload={i >= index ? 'auto' : 'metadata'}
                onEnded={handleEnded}
                onAspect={(r) => noteAspect(wish.id, r)}
              />
            )
          })}
        </div>
      </div>

      {/* Segmented progress */}
      <div className="flex max-w-[90vw] flex-wrap justify-center gap-1" aria-hidden="true">
        {wishes.map((w2, i) => (
          <span
            key={w2.id}
            className="h-1 w-2.5 rounded-full transition-colors duration-500"
            style={{ background: i <= index ? 'rgba(246,210,206,0.95)' : 'rgba(246,210,206,0.22)' }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous wish"
          className="font-body text-sm tracking-wide text-blush/70 transition enabled:hover:text-white disabled:opacity-25"
        >
          ← prev
        </button>
        {content.flags.allowSkip && (
          <button
            type="button"
            onClick={next}
            aria-label={index >= LAST ? 'Finish' : 'Next wish'}
            className="rounded-full border border-blush/30 px-5 py-2 font-body text-sm text-blush transition hover:bg-blush/10"
          >
            {index >= LAST ? 'finish ❤️' : 'next →'}
          </button>
        )}
      </div>
    </div>
  )
}
