import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content, displayName } from '@/config/content'
import { RevealText } from '@/components/ui/RevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { Confetti } from '@/components/ambient/Confetti'
import { Balloons } from '@/components/ambient/Balloons'
import { Fireworks } from '@/components/ambient/Fireworks'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

function Hearts() {
  const hearts = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {hearts.map((i) => {
        const left = (i * 12 + 6) % 100
        const dur = 7 + (i % 4) * 1.6
        const delay = (i % 5) * 1.1
        const size = 12 + (i % 3) * 8
        return (
          <motion.div
            key={i}
            className="absolute text-rose"
            style={{ left: `${left}%`, bottom: -40 }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: -560, x: [0, i % 2 ? 20 : -20, 0] }}
            transition={{ duration: dur, delay, ease: ease.inOut, repeat: Infinity }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-7-4.5-9.5-8.5C.5 9 2 5.5 5.3 5.5c2 0 3.2 1.3 3.9 2.4C10 6.8 11.2 5.5 13.2 5.5c3.3 0 4.8 3.5 2.8 7C19 16.5 12 21 12 21z" />
            </svg>
          </motion.div>
        )
      })}
    </div>
  )
}

export function FinaleScene() {
  const { restart } = useExperience()
  const { sfx } = useAudio()
  const reduced = useReducedMotion()
  const [noteOpen, setNoteOpen] = useState(false)
  // One burst object so taps can throw confetti from wherever she touches.
  const [burst, setBurst] = useState({ n: 0, x: 0.5, y: 0.5 })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNoteOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // One last celebration as the closing words arrive.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setBurst({ n: 1, x: 0.5, y: 0.5 })
      sfx('chime')
    }, 900)
    return () => window.clearTimeout(t)
  }, [sfx])

  /** Tapping the background sends up a firework from that spot. */
  const celebrate = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setBurst((b) => ({
      n: b.n + 1,
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    }))
    sfx('sparkle')
  }

  const share = () => {
    const data = {
      title: `Happy Birthday, ${displayName}`,
      text: content.copy.finale.shareText,
      url: window.location.href,
    }
    if (navigator.share) {
      navigator.share(data).catch(() => {})
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`,
        '_blank',
        'noopener',
      )
    }
  }

  return (
    <div
      onClick={celebrate}
      className="scene relative flex flex-col items-center justify-center gap-7 overflow-hidden text-center text-blush"
    >
      {!reduced && <Hearts />}
      <Balloons count={7} poppable />
      <Fireworks burst={burst.n} burstAt={{ x: burst.x, y: burst.y }} />
      <Confetti trigger={burst.n} originX={burst.x} originY={burst.y} count={70} />

      <motion.div
        className="relative text-gold"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: ease.out }}
      >
        <RoseMark size={64} animate={false} />
      </motion.div>

      <RevealText
        text={content.copy.finale.headline}
        as="h1"
        stagger={0.08}
        className="relative max-w-2xl font-display text-4xl leading-tight text-white text-shadow-glow sm:text-6xl"
      />

      <motion.p
        className="relative max-w-md font-body text-base leading-relaxed text-blush/85 sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1.4, ease: ease.out }}
      >
        {content.copy.finale.message}
      </motion.p>

      <motion.p
        className="relative font-display text-xl italic text-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1.4, ease: ease.out }}
      >
        — {content.signature}
      </motion.p>

      <motion.div
        className="relative mt-2 flex items-center gap-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 1, ease: ease.out }}
      >
        <CtaButton variant="dark" onClick={restart}>
          {content.copy.finale.replay}
        </CtaButton>
        {content.flags.shareEnabled && (
          <button
            type="button"
            onClick={share}
            aria-label="Share"
            className="grid h-11 w-11 place-items-center rounded-full border border-blush/30 text-blush transition hover:bg-blush/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 8a3 3 0 10-2.8-4M6 12a3 3 0 100 .01M18 20a3 3 0 10-2.8-4M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </motion.div>

      <motion.p
        className="relative font-body text-[0.62rem] uppercase tracking-[0.3em] text-blush/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.4, duration: 1.4, ease: ease.out }}
      >
        {content.copy.finale.tapHint}
      </motion.p>

      {/* Hidden rose — the Easter egg. */}
      <button
        type="button"
        onClick={() => setNoteOpen(true)}
        aria-label="A hidden note"
        className="absolute bottom-4 left-4 text-blush/20 transition-colors hover:text-rose"
        style={{ bottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        <RoseMark size={30} animate={false} />
      </button>

      <AnimatePresence>
        {noteOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNoteOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative max-w-sm rounded-3xl border border-gold/30 bg-burgundy-900/95 p-8 text-center"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: ease.out }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex justify-center text-gold">
                <RoseMark size={44} />
              </div>
              <p className="font-display text-xl leading-relaxed text-blush">{content.secretNote}</p>
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                className="mt-6 font-body text-xs uppercase tracking-[0.25em] text-blush/50 hover:text-blush"
              >
                close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
