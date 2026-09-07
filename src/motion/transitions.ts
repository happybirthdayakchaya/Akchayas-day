import type { Variants } from 'framer-motion'
import { dur, ease } from './tokens'
import type { Scene } from '@/context/ExperienceProvider'

/**
 * A vocabulary of scene transitions — deliberately varied, so the story keeps
 * surprising the eye. Chapter cards always use `curtain`, which turns the
 * repetition into a motif rather than a rut.
 */
export type TransitionName =
  | 'bloom'
  | 'dissolve'
  | 'rise'
  | 'deepen'
  | 'iris'
  | 'curtain'
  | 'swoosh'
  | 'flip'
  | 'zoomThrough'

export const sceneVariants: Record<TransitionName, Variants> = {
  // White radial expand — light blooming open.
  bloom: {
    initial: { opacity: 0, scale: 1.06, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: dur.lg, ease: ease.out },
    },
    exit: {
      opacity: 0,
      scale: 0.985,
      filter: 'blur(8px)',
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },

  // Quiet crossfade — used where nothing should distract (the wish videos).
  dissolve: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: dur.scene, ease: ease.inOut } },
    exit: { opacity: 0, transition: { duration: dur.md, ease: ease.inOut } },
  },

  // Content lifts in from below.
  rise: {
    initial: { opacity: 0, y: 48 },
    animate: { opacity: 1, y: 0, transition: { duration: dur.lg, ease: ease.out } },
    exit: { opacity: 0, y: -36, transition: { duration: dur.md, ease: ease.inOut } },
  },

  // Slow and weighty — for when the mood deepens.
  deepen: {
    initial: { opacity: 0, scale: 1.03 },
    animate: { opacity: 1, scale: 1, transition: { duration: dur.xl, ease: ease.soft } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: dur.md, ease: ease.inOut } },
  },

  // A circle opening up like an eye.
  iris: {
    initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
    animate: {
      clipPath: 'circle(80% at 50% 50%)',
      transition: { duration: 1.15, ease: ease.out },
    },
    exit: {
      clipPath: 'circle(0% at 50% 50%)',
      opacity: 0,
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },

  // Theatre curtains parting from the centre.
  curtain: {
    initial: { clipPath: 'inset(50% 0% 50% 0%)', opacity: 0.6 },
    animate: {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      transition: { duration: 1.05, ease: ease.out },
    },
    exit: {
      clipPath: 'inset(50% 0% 50% 0%)',
      opacity: 0,
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },

  // Slides in with a playful tilt and a spring settle.
  swoosh: {
    initial: { opacity: 0, x: '30%', rotate: 3, scale: 0.94 },
    animate: {
      opacity: 1,
      x: 0,
      rotate: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 70, damping: 15, mass: 0.9 },
    },
    exit: {
      opacity: 0,
      x: '-22%',
      rotate: -2.5,
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },

  // A card turning over — used where something is being revealed.
  flip: {
    initial: { opacity: 0, rotateY: 55, scale: 0.9 },
    animate: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { duration: 1.05, ease: ease.out },
    },
    exit: {
      opacity: 0,
      rotateY: -40,
      scale: 0.94,
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },

  // Rushing forward into the next moment.
  zoomThrough: {
    initial: { opacity: 0, scale: 1.45, filter: 'blur(14px)' },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 1.25, ease: ease.out },
    },
    exit: {
      opacity: 0,
      scale: 0.86,
      filter: 'blur(10px)',
      transition: { duration: dur.md, ease: ease.inOut },
    },
  },
}

/** Which transition greets each scene. */
const map: Record<Scene, TransitionName> = {
  loading: 'dissolve',
  opening: 'bloom',
  chapter1: 'curtain',
  // Kept plain: the scene's own velvet curtains do the reveal.
  photo: 'dissolve',
  chapter2: 'curtain',
  reveal: 'zoomThrough',
  numbers: 'swoosh',
  cake: 'rise',
  chapter3: 'curtain',
  gift: 'flip',
  special: 'zoomThrough',
  scratch: 'swoosh',
  chapter4: 'curtain',
  wishesIntro: 'iris',
  wishes: 'dissolve', // stay calm — the clips are the content
  letter: 'rise',
  chapter5: 'curtain',
  finale: 'iris',
}

export function transitionForScene(scene: Scene): TransitionName {
  return map[scene]
}

/** Flat crossfade used when the viewer prefers reduced motion. */
export const reducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: dur.sm } },
  exit: { opacity: 0, transition: { duration: dur.xs } },
}
