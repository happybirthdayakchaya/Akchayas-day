import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { wishes } from '@/config/wishes'
import { RevealText } from '@/components/ui/RevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { ease } from '@/motion/tokens'

export function WishesIntro() {
  const { goNext } = useExperience()

  return (
    <div className="scene flex flex-col items-center justify-center gap-8 text-center text-blush">
      <motion.div
        className="flex items-center gap-3 text-gold"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: ease.out }}
      >
        <RoseMark size={40} />
        <span className="font-display text-6xl leading-none">{wishes.length}</span>
        <RoseMark size={40} />
      </motion.div>

      <RevealText
        text={content.copy.wishesIntro.line}
        as="h2"
        stagger={0.06}
        className="max-w-lg font-display text-3xl leading-snug sm:text-4xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.9, ease: ease.out }}
      >
        <CtaButton variant="dark" onClick={goNext}>
          {content.copy.wishesIntro.cta}
        </CtaButton>
      </motion.div>
    </div>
  )
}
