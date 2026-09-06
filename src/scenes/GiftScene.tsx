import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { CtaButton } from '@/components/ui/CtaButton'
import { RevealText } from '@/components/ui/RevealText'
import { Confetti } from '@/components/ambient/Confetti'
import { ease } from '@/motion/tokens'

export function GiftScene() {
  const { goNext } = useExperience()
  const { sfx } = useAudio()
  const [opened, setOpened] = useState(false)
  const [confetti, setConfetti] = useState(0)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    if (!opened) return
    const t = window.setTimeout(() => setShowCta(true), 1300)
    return () => window.clearTimeout(t)
  }, [opened])

  const unwrap = () => {
    if (opened) return
    setOpened(true)
    setConfetti((c) => c + 1)
    sfx('pop') // the ribbon giving way
    window.setTimeout(() => sfx('chime'), 260) // light pouring out
  }

  return (
    <div className="scene relative flex flex-col items-center justify-center gap-6 text-center text-blush">
      <Confetti trigger={confetti} originY={0.46} />

      <RevealText
        key={opened ? 'opened' : 'closed'}
        text={opened ? content.copy.gift.opened : content.copy.gift.line}
        as="h2"
        className="relative max-w-md font-display text-3xl italic sm:text-4xl"
      />

      <button
        type="button"
        onClick={unwrap}
        disabled={opened}
        aria-label={opened ? 'Gift opened' : 'Tap to unwrap the gift'}
        className="relative w-full max-w-xs cursor-pointer disabled:cursor-default"
      >
        {/* light pouring out of the box once the lid lifts */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(255,225,170,0.85), rgba(255,225,170,0) 60%)',
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={opened ? { opacity: [0, 1, 0.55], scale: 2.4 } : { opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.4, ease: ease.out }}
        />

        <motion.svg
          viewBox="0 0 240 220"
          className="w-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, y: 30 }}
          animate={
            opened
              ? { opacity: 1, y: 0 }
              : { opacity: 1, y: [0, -8, 0] }
          }
          transition={
            opened
              ? { duration: 0.6, ease: ease.out }
              : { duration: 2.8, ease: ease.inOut, repeat: Infinity }
          }
          whileTap={opened ? undefined : { scale: 0.97 }}
        >
          {/* box body */}
          <rect x={40} y={95} width={160} height={100} rx={8} fill="#C1121F" />
          <rect x={112} y={95} width={16} height={100} fill="#D9B168" />
          {/* inner shadow so the open box reads as hollow */}
          {opened && <rect x={44} y={95} width={152} height={16} fill="#4A0D16" opacity={0.75} />}

          {/* lid + bow lift away together */}
          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: 'center center' }}
            animate={
              opened
                ? { y: -120, rotate: -16, opacity: 0 }
                : { y: 0, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 1, ease: ease.out }}
          >
            <rect x={30} y={68} width={180} height={32} rx={6} fill="#8A0F1A" />
            <rect x={112} y={68} width={16} height={32} fill="#D9B168" />
            <ellipse
              cx={104}
              cy={56}
              rx={15}
              ry={10}
              transform="rotate(-22 104 56)"
              fill="#D9B168"
            />
            <ellipse
              cx={136}
              cy={56}
              rx={15}
              ry={10}
              transform="rotate(22 136 56)"
              fill="#D9B168"
            />
            <circle cx={120} cy={58} r={6.5} fill="#E8C88A" />
          </motion.g>
        </motion.svg>
      </button>

      <div className="relative flex min-h-16 items-center justify-center">
        {!opened && (
          <motion.p
            className="font-body text-sm uppercase tracking-[0.25em] text-blush/60"
            initial={{ opacity: 0.45 }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, ease: ease.inOut, repeat: Infinity }}
          >
            {content.copy.gift.hint}
          </motion.p>
        )}
        {opened && showCta && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <CtaButton variant="dark" onClick={goNext}>
              {content.copy.gift.cta}
            </CtaButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
