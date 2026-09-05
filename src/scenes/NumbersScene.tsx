import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { RevealText } from '@/components/ui/RevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

const BORN = Date.parse(content.birthDateISO)

function since(ms: number) {
  const clamped = Math.max(0, ms)
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    mins: Math.floor((clamped / 60_000) % 60),
    secs: Math.floor((clamped / 1000) % 60),
  }
}

function Unit({ value, label, pad = 2 }: { value: number; label: string; pad?: number }) {
  return (
    <div className="flex min-w-16 flex-col items-center">
      <span className="font-display text-4xl leading-none text-white tabular-nums sm:text-5xl">
        {String(value).padStart(pad, '0')}
      </span>
      <span className="mt-1 font-body text-[0.6rem] uppercase tracking-[0.25em] text-blush/50">
        {label}
      </span>
    </div>
  )
}

/**
 * A live count of how long she has been alive, ticking every second. The days
 * figure counts up from zero on arrival so the number feels *earned* rather
 * than just printed.
 */
export function NumbersScene() {
  const { goNext } = useExperience()
  const reduced = useReducedMotion()
  const [elapsed, setElapsed] = useState(() => Date.now() - BORN)
  const [days, setDays] = useState(() => (reduced ? since(Date.now() - BORN).days : 0))

  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Date.now() - BORN), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Roll the day count up to its real value once, on arrival.
  useEffect(() => {
    if (reduced) return
    const target = since(Date.now() - BORN).days
    const duration = 1800
    const startedAt = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - startedAt) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDays(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const { hours, mins, secs } = since(elapsed)

  return (
    <div className="scene flex flex-col items-center justify-center gap-8 text-center text-blush">
      <motion.div
        className="text-gold"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: ease.out }}
      >
        <RoseMark size={48} animate={false} />
      </motion.div>

      <RevealText
        text={content.copy.numbers.line}
        as="h2"
        className="font-display text-2xl italic text-blush/80 sm:text-3xl"
      />

      {/* The headline number gets its own moment. */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: ease.out }}
      >
        <span className="font-display text-6xl leading-none text-white tabular-nums sm:text-8xl">
          {days.toLocaleString()}
        </span>
        <span className="mt-2 font-body text-[0.65rem] uppercase tracking-[0.45em] text-gold">
          days
        </span>
      </motion.div>

      <motion.div
        className="flex items-start gap-5 sm:gap-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1, ease: ease.out }}
      >
        <Unit value={hours} label="hours" />
        <Unit value={mins} label="mins" />
        <Unit value={secs} label="secs" />
      </motion.div>

      <motion.p
        className="max-w-md font-body text-base leading-relaxed text-blush/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1.2, ease: ease.out }}
      >
        {content.copy.numbers.sub}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.9, duration: 0.9, ease: ease.out }}
      >
        <CtaButton variant="dark" onClick={goNext}>
          {content.copy.numbers.cta}
        </CtaButton>
      </motion.div>
    </div>
  )
}
