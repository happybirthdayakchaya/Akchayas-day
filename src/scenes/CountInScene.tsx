import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

const START = 10
const STEP_MS = 700
const VISITED_KEY = 'Akchaya-birthday:visited'

/** Petals thrown outward as each numeral dissolves. */
function PetalBurst({ seed }: { seed: number }) {
  const reduced = useReducedMotion()
  if (reduced) return null

  const tints = ['#C1121F', '#E8837E', '#F6D2CE', '#D9B168']
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2 + seed
          const distance = 90 + (i % 4) * 26
          const size = 9 + (i % 3) * 4
          return (
            <motion.span
              key={i}
              className="absolute rounded-[50%_0_50%_0]"
              style={{
                width: size,
                height: size * 1.4,
                background: tints[i % tints.length],
              }}
              initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: 1,
                rotate: i % 2 ? 160 : -160,
              }}
              transition={{ duration: 0.95, ease: ease.out }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * The opening: a 10 → 1 countdown, each numeral swelling in and scattering
 * into petals. This is the only pre-roll — it reads as anticipation rather
 * than waiting. A discreet skip appears only for someone who has opened the
 * page before, since ten seconds is a while to sit through twice.
 */
export function CountInScene() {
  const { goNext, goTo } = useExperience()
  const [n, setN] = useState(START)

  // Read during render, before any effect can write the flag. Doing this in an
  // effect made the very first visit look like a return visit, because React
  // runs effects twice in development.
  const [returning] = useState(() => {
    try {
      return Boolean(localStorage.getItem(VISITED_KEY))
    } catch {
      return false // storage blocked — simply never offer the skip
    }
  })

  // Warm the first heavy asset while the numbers play.
  useEffect(() => {
    const img = new Image()
    img.src = content.media.landscapeImage
  }, [])

  // Remember the visit, so the skip is offered from the second visit on.
  useEffect(() => {
    try {
      localStorage.setItem(VISITED_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (n <= 0) {
      goNext()
      return
    }
    const t = window.setTimeout(() => setN((v) => v - 1), STEP_MS)
    return () => window.clearTimeout(t)
  }, [n, goNext])

  return (
    <div className="scene relative flex flex-col items-center justify-center text-center text-ink">
      {returning && (
        <motion.button
          type="button"
          onClick={() => goTo('opening')}
          className="absolute right-5 font-body text-[0.65rem] uppercase tracking-[0.3em] text-rose/45 transition-colors hover:text-rose"
          style={{ top: 'max(env(safe-area-inset-top), 1.25rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {content.copy.countIn.skip} ›
        </motion.button>
      )}

      <div className="relative grid place-items-center">
        {n > 0 && (
          <>
            <PetalBurst key={`p${n}`} seed={n} />
            <motion.span
              key={n}
              className="font-display text-[8rem] leading-none text-rose-deep sm:text-[11rem]"
              initial={{ opacity: 0, scale: 0.45, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: ease.out }}
            >
              {n}
            </motion.span>
          </>
        )}
      </div>
    </div>
  )
}
