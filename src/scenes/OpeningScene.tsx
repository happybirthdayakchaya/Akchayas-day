import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { CtaButton } from '@/components/ui/CtaButton'
import { ease } from '@/motion/tokens'

export function OpeningScene() {
  const { goNext } = useExperience()
  const { start } = useAudio()

  const open = () => {
    start() // first user gesture — safe to begin music here
    goNext()
  }

  return (
    <div className="scene flex flex-col items-center justify-center gap-10 text-center text-ink">
      <motion.p
        className="font-body text-[0.7rem] uppercase tracking-[0.4em] text-rose/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1.4, ease: ease.out }}
      >
        {content.copy.opening.whisper}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 1, ease: ease.out }}
      >
        <CtaButton variant="light" onClick={open}>
          {content.copy.opening.button}
        </CtaButton>
      </motion.div>
    </div>
  )
}
