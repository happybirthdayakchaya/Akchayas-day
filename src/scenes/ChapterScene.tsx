import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CHAPTER_INDEX, useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { RevealText } from '@/components/ui/RevealText'
import { ease } from '@/motion/tokens'

/**
 * A full-screen story beat: "Chapter Two — The day the world got luckier".
 * Auto-advances after a breath, and a tap moves on early so it never
 * feels like waiting.
 */
export function ChapterScene() {
  const { scene, goNext } = useExperience()

  // Freeze which chapter this card shows at mount. The card stays mounted
  // while it animates out after the scene advances, and without this it
  // would re-render against the new scene and flip back to "Chapter One".
  const [{ index, onLight }] = useState(() => ({
    index: CHAPTER_INDEX[scene] ?? 0,
    // chapter1 sits on the pale backdrop; the rest are on deep burgundy.
    onLight: scene === 'chapter1',
  }))
  const chapter = content.copy.chapters[index]

  const accent = onLight ? 'text-rose/70' : 'text-gold'
  const titleColor = onLight ? 'text-rose-deep' : 'text-white'
  const ruleColor = onLight ? 'bg-rose/30' : 'bg-gold/40'

  /**
   * Advance at most once. The card stays mounted while it animates out, so
   * its timer is still live after a tap — without this guard a tap plus the
   * pending auto-advance fire twice and skip the scene that follows.
   */
  const advanced = useRef(false)
  const advance = useCallback(() => {
    if (advanced.current) return
    advanced.current = true
    goNext()
  }, [goNext])

  useEffect(() => {
    const t = window.setTimeout(advance, content.flags.chapterDurationMs)
    return () => window.clearTimeout(t)
  }, [advance])

  if (!chapter) return null

  return (
    <button
      type="button"
      onClick={advance}
      aria-label={`${chapter.label} — ${chapter.title}. Continue`}
      className="scene flex w-full cursor-pointer flex-col items-center justify-center gap-5 text-center"
    >
      <motion.p
        className={`font-body text-[0.65rem] uppercase tracking-[0.5em] ${accent}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: ease.out }}
      >
        {chapter.label}
      </motion.p>

      <motion.span
        className={`block h-px ${ruleColor}`}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 90, opacity: 1 }}
        transition={{ delay: 0.35, duration: 1, ease: ease.out }}
      />

      <RevealText
        text={chapter.title}
        as="h2"
        delay={0.6}
        stagger={0.07}
        className={`max-w-lg font-display text-4xl leading-tight sm:text-5xl ${titleColor}`}
      />
    </button>
  )
}
