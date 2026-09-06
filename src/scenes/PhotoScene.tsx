import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { RevealText } from '@/components/ui/RevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { CurtainReveal } from '@/components/ui/CurtainReveal'
import { ease } from '@/motion/tokens'

export function PhotoScene() {
  const { goNext } = useExperience()
  const [error, setError] = useState(false)
  const [showCta, setShowCta] = useState(false)

  // Held back until the curtains have finished parting.
  useEffect(() => {
    const t = window.setTimeout(() => setShowCta(true), 4400)
    return () => window.clearTimeout(t)
  }, [])

  return (
    // Fixed to the viewport so the collage stays centred — the caption is
    // overlaid rather than adding height and pushing the image off-centre.
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* A blurred, cropped copy fills the letterbox bands so a wide collage
          on a tall phone never sits in dead black. Same file, so it costs no
          extra download. */}
      {!error && (
        <img
          src={content.media.landscapeImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
        />
      )}

      {!error ? (
        // `object-contain` keeps every photo in the collage visible; on a
        // portrait phone `cover` would crop a 16:9 collage to a thin slice.
        // The zoom settles to 1 rather than growing past the frame, so
        // nothing ends up cropped at rest.
        <motion.img
          src={content.media.landscapeImage}
          alt="A collage of favourite memories"
          onError={() => setError(true)}
          className="absolute inset-0 h-full w-full object-contain"
          initial={{ scale: 1.07, x: 6 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ duration: 12, ease: ease.soft }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-rose-deep to-burgundy-900">
          <div className="absolute inset-0 grid place-items-center text-blush/10">
            <RoseMark size={240} animate={false} />
          </div>
        </div>
      )}

      {/* Lower-third scrim: readable text without dimming the whole collage. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 via-40% to-transparent" />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-7 px-6 text-center"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)' }}
      >
        <RevealText
          text={content.copy.photo.caption}
          as="h2"
          delay={2.5}
          className="max-w-lg font-display text-3xl leading-snug text-white text-shadow-soft sm:text-4xl"
        />
        {/* Reserved height keeps the caption from shifting when the CTA lands. */}
        <div className="flex min-h-14 items-center justify-center">
          {showCta && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: ease.out }}
            >
              <CtaButton variant="dark" onClick={goNext}>
                {content.copy.photo.cta}
              </CtaButton>
            </motion.div>
          )}
        </div>
      </div>

      {/* Velvet curtains part to reveal the memories. */}
      <CurtainReveal />
    </div>
  )
}
