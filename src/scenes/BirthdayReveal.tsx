import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { RevealText } from '@/components/ui/RevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { Confetti } from '@/components/ambient/Confetti'
import { ease } from '@/motion/tokens'

export function BirthdayReveal() {
  const { goNext } = useExperience()
  const { sfx } = useAudio()
  const { reveal } = content.copy
  const [confetti, setConfetti] = useState(0)

  // Fire the burst as the headline lands.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setConfetti(1)
      sfx('chime')
    }, 1250)
    return () => window.clearTimeout(t)
  }, [sfx])

  return (
    <div className="scene relative flex flex-col items-center justify-center gap-6 text-center">
      <Confetti trigger={confetti} originY={0.4} />
      {/* Warm bloom of light behind the words. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-[70vmin] w-[70vmin] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.9), rgba(246,210,206,0.35) 45%, transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: ease.out }}
      />

      <motion.div
        className="relative text-rose"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: ease.out }}
      >
        <RoseMark size={68} animate={false} />
      </motion.div>

      <RevealText
        text={reveal.headline}
        as="h1"
        delay={0.7}
        stagger={0.09}
        className="relative max-w-2xl font-display text-5xl font-medium leading-[1.05] text-rose-deep sm:text-7xl"
      />

      <RevealText
        text={reveal.message}
        as="p"
        delay={1.9}
        stagger={0.03}
        className="relative max-w-md font-body text-base leading-relaxed text-ink/75 sm:text-lg"
      />

      <motion.p
        className="relative font-display text-xl italic text-rose/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.1, duration: 1.2, ease: ease.out }}
      >
        {reveal.cute}
      </motion.p>

      <motion.div
        className="relative mt-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.8, duration: 0.9, ease: ease.out }}
      >
        <CtaButton variant="light" onClick={goNext}>
          {reveal.cta}
        </CtaButton>
      </motion.div>
    </div>
  )
}
