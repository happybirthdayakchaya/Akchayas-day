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
const REVEAL_AT = 0.45

export function ScratchScene() {
  const { goNext } = useExperience()
  const { sfx } = useAudio()
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const touched = useRef(false)
  const ticks = useRef(0)

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
      const r = wrap.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
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
    const ro = new ResizeObserver(paint)
    ro.observe(wrap)
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

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || revealed) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const r = canvas.getBoundingClientRect()
    touched.current = true
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(clientX - r.left, clientY - r.top, 30, 0, Math.PI * 2)
    ctx.fill()
    if (++ticks.current % 10 === 0) measure()
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
          <motion.canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: 'none', cursor: 'grab' }}
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: 0.9, ease: ease.out }}
            aria-hidden="true"
            onPointerDown={(e) => {
              if (revealed) return
              drawing.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              scratchAt(e.clientX, e.clientY)
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return
              scratchAt(e.clientX, e.clientY)
            }}
            onPointerUp={() => {
              drawing.current = false
              measure()
            }}
            onPointerCancel={() => {
              drawing.current = false
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
