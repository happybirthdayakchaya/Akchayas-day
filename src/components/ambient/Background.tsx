import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import type { Scene } from '@/context/ExperienceProvider'
import { dur, ease } from '@/motion/tokens'

/**
 * A single persistent backdrop that lives behind every scene, so the mood
 * shifts continuously rather than cutting: airy white at the open, a bright
 * blush celebration at the reveal, a dim theatre for the videos, and a deep
 * burgundy glow for the finale.
 */
const BG: Record<Scene, { base: string; glow: number }> = {
  loading: { base: '#FFF8F5', glow: 0.12 },
  opening: { base: '#FFF8F5', glow: 0.22 },
  chapter1: { base: '#FFF3EF', glow: 0.2 },
  photo: { base: '#100A0B', glow: 0.0 },
  chapter2: { base: '#2A0710', glow: 0.4 },
  reveal: { base: '#FBE7E4', glow: 0.5 },
  numbers: { base: '#240610', glow: 0.5 },
  cake: { base: '#1A0509', glow: 0.45 },
  chapter3: { base: '#3A0A12', glow: 0.45 },
  gift: { base: '#2A0710', glow: 0.6 },
  special: { base: '#3A0A12', glow: 0.55 },
  chapter4: { base: '#320A11', glow: 0.45 },
  wishesIntro: { base: '#320A11', glow: 0.5 },
  wishes: { base: '#17090C', glow: 0.32 },
  scratch: { base: '#43101B', glow: 0.6 },
  letter: { base: '#2A0710', glow: 0.55 },
  chapter5: { base: '#2E070D', glow: 0.55 },
  finale: { base: '#2E070D', glow: 0.75 },
}

export function Background() {
  const { scene } = useExperience()
  const { base, glow } = BG[scene]
  const gold = scene === 'finale' ? 0.42 : 0

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      {/* `initial={false}` snaps to the right colour on first paint (no flash
          of the pale body colour) while still tweening between scenes. */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ backgroundColor: base }}
        transition={{ duration: dur.xl, ease: ease.inOut }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 85% at 50% 18%, rgba(193,18,31,0.9), rgba(193,18,31,0) 60%)',
        }}
        initial={false}
        animate={{ opacity: glow }}
        transition={{ duration: dur.xl, ease: ease.inOut }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 70% at 50% 92%, rgba(217,177,104,0.5), rgba(217,177,104,0) 60%)',
        }}
        initial={false}
        animate={{ opacity: gold }}
        transition={{ duration: dur.xl, ease: ease.inOut }}
      />
      {/* Soft vignette to keep the frame cinematic. */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 220px 40px rgba(0,0,0,0.28)' }}
      />
    </div>
  )
}
