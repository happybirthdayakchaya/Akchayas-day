import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { CtaButton } from '@/components/ui/CtaButton'
import { RevealText } from '@/components/ui/RevealText'
import { RoseMark } from '@/components/ui/RoseMark'
import { Confetti } from '@/components/ambient/Confetti'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

/** Fraction of foil that must be scratched away before it opens fully. */
const REVEAL_AT = 0.32
/** Radius of the scratching tip, in CSS pixels. */
const BRUSH = 34

export function ScratchScene() {
  const { goNext } = useExperience()
  const { sfx } = useAudio()
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const touched = useRef(false)
  const ticks = useRef(0)
  /** Previous pointer position, so we can erase a continuous stroke. */
  const lastPt = useRef<{ x: number; y: number } | null>(null)

  const [revealed, setRevealed] = useState(false)
  const [confetti, setConfetti] = useState(0)
  const [showCta, setShowCta] = useState(false)

  const reveal = useCallback(() => {
    setRevealed((was) => {
      if (!was) {
        setConfetti((c) => c + 1)
        sfx('sparkle')
      }
      return true
    })
  }, [sfx])

  useEffect(() => {
    if (!revealed) return
    const t = window.setTimeout(() => setShowCta(true), 1200)
    return () => window.clearTimeout(t)
  }, [revealed])

  // Paint the foil layer.
  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const paint = () => {
      if (touched.current) return // don't wipe progress on resize
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      /**
       * Measure the canvas itself, and never write style.width/height on it.
       * CSS (`absolute inset-0`) owns its size; setting inline pixels froze it
       * at whatever the card measured on first paint, so any later layout
       * change left a strip of the card uncovered down one side.
       */
      const r = canvas.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return

      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      const g = ctx.createLinearGradient(0, 0, r.width, r.height)
      g.addColorStop(0, '#8A0F1A')
      g.addColorStop(0.5, '#C1121F')
      g.addColorStop(1, '#D9B168')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, r.width, r.height)

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.textAlign = 'center'
      ctx.font = '500 13px Manrope, system-ui, sans-serif'
      // Canvas renders emoji poorly — draw the plain text only.
      const label = content.copy.scratch.hint.replace(/[^\x20-\x7E]/g, '').trim()
      ctx.fillText(label.toUpperCase(), r.width / 2, r.height / 2)
    }

    paint()
    // Watch the canvas (not the card) so the foil is repainted to match
    // exactly whatever CSS is rendering.
    const ro = new ResizeObserver(paint)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [reduced])

  const measure = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const { width, height } = canvas
    if (!width || !height) return
    const data = ctx.getImageData(0, 0, width, height).data
    let clear = 0
    let total = 0
    // Sample sparsely — we only need a rough percentage.
    for (let i = 3; i < data.length; i += 4 * 64) {
      total++
      if (data[i] < 40) clear++
    }
    if (total > 0 && clear / total >= REVEAL_AT) reveal()
  }, [reveal])

  /**
   * Erase along the path the finger actually travelled. Stamping a circle at
   * each pointer event alone leaves gaps between them on a normal drag — the
   * foil never clears and the card feels broken.
   */
  const scratchAt = (clientX: number, clientY: number, isStart = false) => {
    const canvas = canvasRef.current
    if (!canvas || revealed) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const r = canvas.getBoundingClientRect()
    const x = clientX - r.left
    const y = clientY - r.top
    touched.current = true

    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = BRUSH * 2

    const prev = isStart ? null : lastPt.current
    if (prev) {
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2)
    ctx.fill()

    lastPt.current = { x, y }
    if (++ticks.current % 5 === 0) measure()
  }

  return (
    <div className="scene relative flex flex-col items-center justify-center gap-6 text-center text-blush">
      <Confetti trigger={confetti} originY={0.45} />

      <RevealText
        text={content.copy.scratch.line}
        as="h2"
        className="relative max-w-md font-display text-3xl italic sm:text-4xl"
      />

      {/* The card: message underneath, foil on top. */}
      <div
        ref={wrapRef}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-burgundy-900/80 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]"
      >
        <div className="flex flex-col items-center gap-4 px-7 py-10">
          <span className="text-gold">
            <RoseMark size={40} animate={false} />
          </span>
          <p className="font-display text-xl leading-relaxed text-blush sm:text-2xl">
            {content.copy.scratch.message}
          </p>
        </div>

        {!reduced && (
          <canvas
            ref={canvasRef}
            // CSS-driven fade: a JS animation can stall, and the one thing we
            // must never do is leave foil sitting over her message.
            className="absolute inset-0 h-full w-full transition-opacity duration-700"
            style={{
              touchAction: 'none',
              cursor: 'grab',
              opacity: revealed ? 0 : 1,
              pointerEvents: revealed ? 'none' : 'auto',
            }}
            aria-hidden="true"
            onPointerDown={(e) => {
              if (revealed) return
              drawing.current = true
              lastPt.current = null
              e.currentTarget.setPointerCapture(e.pointerId)
              scratchAt(e.clientX, e.clientY, true)
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return
              scratchAt(e.clientX, e.clientY)
            }}
            onPointerUp={() => {
              drawing.current = false
              lastPt.current = null
              measure()
            }}
            onPointerCancel={() => {
              drawing.current = false
              lastPt.current = null
            }}
          />
        )}
      </div>

      <div className="relative flex min-h-16 items-center justify-center">
        {!revealed && (
          // Always-available fallback so keyboard users are never stuck.
          <motion.button
            type="button"
            onClick={reveal}
            className="font-body text-xs uppercase tracking-[0.25em] text-blush/50 transition-colors hover:text-blush"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            or tap here to reveal
          </motion.button>
        )}
        {revealed && showCta && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <CtaButton variant="dark" onClick={goNext}>
              {content.copy.scratch.cta}
            </CtaButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
