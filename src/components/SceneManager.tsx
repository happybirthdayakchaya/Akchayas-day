import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import type { Scene } from '@/context/ExperienceProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'
import { reducedVariants, sceneVariants, transitionForScene } from '@/motion/transitions'

import { CountInScene } from '@/scenes/CountInScene'
import { OpeningScene } from '@/scenes/OpeningScene'
import { ChapterScene } from '@/scenes/ChapterScene'
import { PhotoScene } from '@/scenes/PhotoScene'
import { BirthdayReveal } from '@/scenes/BirthdayReveal'
import { NumbersScene } from '@/scenes/NumbersScene'
import { CakeScene } from '@/scenes/CakeScene'
import { LetterScene } from '@/scenes/LetterScene'
import { GiftScene } from '@/scenes/GiftScene'
import { SpecialVideoScene } from '@/scenes/SpecialVideoScene'
import { WishesIntro } from '@/scenes/WishesIntro'
import { WishPlayer } from '@/scenes/WishPlayer'
import { ScratchScene } from '@/scenes/ScratchScene'
import { FinaleScene } from '@/scenes/FinaleScene'

function renderScene(scene: Scene) {
  switch (scene) {
    // The scene id stays `loading` — it's still the pre-roll, now a count-in.
    case 'loading':
      return <CountInScene />
    case 'opening':
      return <OpeningScene />
    case 'chapter1':
    case 'chapter2':
    case 'chapter3':
    case 'chapter4':
    case 'chapter5':
      return <ChapterScene />
    case 'photo':
      return <PhotoScene />
    case 'reveal':
      return <BirthdayReveal />
    case 'numbers':
      return <NumbersScene />
    case 'cake':
      return <CakeScene />
    case 'gift':
      return <GiftScene />
    case 'special':
      return <SpecialVideoScene />
    case 'wishesIntro':
      return <WishesIntro />
    case 'wishes':
      return <WishPlayer />
    case 'scratch':
      return <ScratchScene />
    case 'letter':
      return <LetterScene />
    case 'finale':
      return <FinaleScene />
  }
}

/**
 * Scenes are stacked absolutely and cross-faded. The incoming scene mounts
 * immediately (we don't gate it on the outgoing scene's exit), so a stalled
 * animation frame can never freeze the story mid-transition.
 */
export function SceneManager() {
  const { scene, runId } = useExperience()
  const reduced = useReducedMotion()
  const variants = reduced ? reducedVariants : sceneVariants[transitionForScene(scene)]

  // A monotonically rising stack order, so the arriving scene always paints
  // above one that is still fading out.
  const key = `${scene}-${runId}`
  const stepRef = useRef(0)
  const lastKey = useRef(key)
  if (lastKey.current !== key) {
    lastKey.current = key
    stepRef.current += 1
  }

  return (
    // `perspective` gives the `flip` transition real depth rather than a squash.
    <div className="relative min-h-[100dvh] w-full" style={{ perspective: 1400 }}>
      {/* A warm band of light sweeps across on every scene change. Keyed by
          scene, so remounting replays it exactly once. */}
      {!reduced && (
        <div
          key={`sweep-${key}`}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
          style={{ zIndex: 25 }}
        >
          <motion.div
            className="absolute -inset-y-1/2 w-1/2 rotate-12 blur-3xl"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,214,180,0.28), transparent)',
            }}
            initial={{ x: '-140%', opacity: 0 }}
            animate={{ x: '260%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: ease.inOut }}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        <motion.div
          key={key}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 overflow-y-auto"
          style={{ zIndex: stepRef.current }}
        >
          {renderScene(scene)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
