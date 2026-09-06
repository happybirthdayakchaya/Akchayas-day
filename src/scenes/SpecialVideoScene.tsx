import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { CtaButton } from '@/components/ui/CtaButton'
import { RevealText } from '@/components/ui/RevealText'
import { RoseMark } from '@/components/ui/RoseMark'
import { dur, ease } from '@/motion/tokens'

/** The gift scene is the intro now, so we open straight into playback. */
type Phase = 'playing' | 'after'

export function SpecialVideoScene() {
  const { goNext } = useExperience()
  const { duck, unduck } = useAudio()
  const [phase, setPhase] = useState<Phase>('playing')
  const [showSkip, setShowSkip] = useState(false)

  // Duck the music only while the video is on screen.
  useEffect(() => {
    if (phase !== 'playing') return
    duck()
    const t = content.flags.allowSkip
      ? window.setTimeout(() => setShowSkip(true), 10_000)
      : undefined
    return () => {
      unduck()
      if (t) window.clearTimeout(t)
    }
  }, [phase, duck, unduck])

  return (
    <div className="scene flex flex-col items-center justify-center gap-8 text-center text-blush">
      {phase === 'playing' && (
          <motion.div
            className="flex w-full flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: dur.md, ease: ease.out }}
          >
            {/* Floral frame */}
            <div className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-br from-rose/40 via-gold/30 to-rose-deep/40 p-[3px] shadow-[0_30px_120px_-30px_rgba(0,0,0,0.8)]">
              <VideoPlayer
                src={content.media.specialVideo}
                className="aspect-video w-full"
                label="A special birthday video"
                posterLabel="Something made just for you"
                onEnded={() => setPhase('after')}
              />
              <span className="pointer-events-none absolute -left-3 -top-3 text-rose">
                <RoseMark size={40} animate={false} />
              </span>
              <span className="pointer-events-none absolute -bottom-3 -right-3 rotate-180 text-rose">
                <RoseMark size={40} animate={false} />
              </span>
            </div>

            {showSkip && (
              <button
                type="button"
                onClick={() => setPhase('after')}
                className="font-body text-xs uppercase tracking-[0.25em] text-blush/50 transition-colors hover:text-blush"
              >
                skip ↦
              </button>
            )}
          </motion.div>
        )}

      {phase === 'after' && (
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur.lg, ease: ease.inOut }}
        >
          <RevealText
            text={content.copy.special.afterVideo}
            as="h2"
            className="max-w-md font-display text-3xl italic text-blush sm:text-4xl"
          />
          <CtaButton variant="dark" onClick={goNext}>
            {content.copy.special.afterCta}
          </CtaButton>
        </motion.div>
      )}
    </div>
  )
}
