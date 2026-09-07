import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { content } from '@/config/content'

/** The ordered universe of scenes. */
export const SCENES = [
  'loading',
  'opening',
  'chapter1',
  'photo',
  'chapter2',
  'reveal',
  'numbers',
  'cake',
  'chapter3',
  'gift',
  'special',
  'scratch',
  'chapter4',
  'wishesIntro',
  'wishes',
  'letter',
  'chapter5',
  'finale',
] as const

export type Scene = (typeof SCENES)[number]

/** Which entry of `content.copy.chapters` each chapter card shows. */
export const CHAPTER_INDEX: Partial<Record<Scene, number>> = {
  chapter1: 0,
  chapter2: 1,
  chapter3: 2,
  chapter4: 3,
  chapter5: 4,
}

const STORAGE_KEY = 'Akchaya-birthday:scene'

interface ExperienceValue {
  scene: Scene
  /** Bumped on replay so scenes can reset internal state via `key`. */
  runId: number
  /** Advance to the next scene in the active flow. */
  goNext: () => void
  /** Jump directly to a named scene. */
  goTo: (scene: Scene) => void
  /** Restart the story (skips the count-in, keeps music playing). */
  restart: () => void
}

const ExperienceContext = createContext<ExperienceValue | null>(null)

function readSavedScene(): Scene | null {
  if (!content.flags.resume) return null
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved && (SCENES as readonly string[]).includes(saved) && saved !== 'loading') {
      return saved as Scene
    }
  } catch {
    /* storage blocked — fall through */
  }
  return null
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  // Scenes played in order; `loading` (the count-in) always precedes flow[0].
  const flow = useMemo<Scene[]>(
    () => [
      'opening',
      'chapter1',
      'photo',
      'chapter2',
      'reveal',
      'numbers',
      'cake',
      'chapter3',
      'gift',
      'special',
      // The scratch card sits here as a playful breather between the two
      // video-heavy stretches; the letter is saved as the final intimate beat.
      'scratch',
      'chapter4',
      'wishesIntro',
      'wishes',
      'letter',
      'chapter5',
      'finale',
    ],
    [],
  )

  const [scene, setScene] = useState<Scene>(() => readSavedScene() ?? 'loading')
  const [runId, setRunId] = useState(0)

  const persist = useCallback((next: Scene) => {
    if (!content.flags.resume) return
    try {
      if (next === 'loading') sessionStorage.removeItem(STORAGE_KEY)
      else sessionStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const goTo = useCallback(
    (next: Scene) => {
      setScene(next)
      persist(next)
    },
    [persist],
  )

  const goNext = useCallback(() => {
    setScene((current) => {
      let next: Scene
      if (current === 'loading') {
        next = flow[0]
      } else {
        const i = flow.indexOf(current)
        next = i >= 0 && i < flow.length - 1 ? flow[i + 1] : current
      }
      persist(next)
      return next
    })
  }, [flow, persist])

  const restart = useCallback(() => {
    setRunId((r) => r + 1)
    goTo('opening')
  }, [goTo])

  const value = useMemo<ExperienceValue>(
    () => ({ scene, runId, goNext, goTo, restart }),
    [scene, runId, goNext, goTo, restart],
  )

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
}

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be used within ExperienceProvider')
  return ctx
}
