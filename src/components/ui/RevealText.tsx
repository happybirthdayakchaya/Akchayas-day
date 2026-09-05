import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { dur, ease } from '@/motion/tokens'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span'

interface Props {
  text: string
  as?: Tag
  className?: string
  /** Seconds before the first word appears. */
  delay?: number
  /** Seconds between words. */
  stagger?: number
}

/**
 * Word-by-word reveal with a soft blur settle. Collapses to a single fade
 * when the viewer prefers reduced motion. The full string stays readable to
 * screen readers via aria-label; the animated words are hidden from them.
 */
export function RevealText({
  text,
  as = 'p',
  className = '',
  delay = 0,
  stagger = 0.055,
}: Props) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  const container: Variants = {
    hidden: {},
    show: {
      transition: reduced
        ? { duration: dur.sm }
        : { staggerChildren: stagger, delayChildren: delay },
    },
  }

  const child: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: dur.sm } } }
    : {
        hidden: { opacity: 0, y: '0.5em', filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: dur.md, ease: ease.out },
        },
      }

  const MotionTag = motion[as]

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={child} aria-hidden="true" className="inline-block whitespace-pre">
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  )
}
