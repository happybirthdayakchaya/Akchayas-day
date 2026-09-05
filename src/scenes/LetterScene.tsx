import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { content } from '@/config/content'
import { CtaButton } from '@/components/ui/CtaButton'
import { RoseMark } from '@/components/ui/RoseMark'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

/** Milliseconds per character. Punctuation pauses a little longer. */
const SPEED = 34
const PAUSE_AFTER = new Set(['.', ',', '!', '?', '\n'])

/**
 * A letter that writes itself out in handwriting. Tapping once completes it
 * instantly, so she is never made to wait for a long message.
 */
export function LetterScene() {
  const { goNext } = useExperience()
  const reduced = useReducedMotion()
  const { greeting, body, signOff, signedBy, cta } = content.copy.letter

  const [shown, setShown] = useState(reduced ? body.length : 0)
  const timerRef = useRef<number | null>(null)
  const done = shown >= body.length

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    const write = (i: number) => {
      if (cancelled || i > body.length) return
      setShown(i)
      if (i === body.length) return
      const ch = body[i]
      const delay = PAUSE_AFTER.has(ch) ? SPEED * 9 : SPEED
      timerRef.current = window.setTimeout(() => write(i + 1), delay)
    }
    // A beat after the paper settles, the pen starts.
    timerRef.current = window.setTimeout(() => write(0), 1100)

    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [body, reduced])

  const finishNow = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setShown(body.length)
  }

  return (
    <div className="scene flex flex-col items-center justify-center gap-6 text-center text-blush">
      {/* The page */}
      <motion.div
        onClick={done ? undefined : finishNow}
        role={done ? undefined : 'button'}
        aria-label={done ? undefined : 'Show the whole letter'}
        tabIndex={done ? undefined : 0}
        onKeyDown={(e) => {
          if (!done && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            finishNow()
          }
        }}
        className={`relative w-full max-w-lg rounded-2xl border border-gold/25 bg-[#FFF8F0] px-7 py-9 text-left shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)] sm:px-10 ${
          done ? '' : 'cursor-pointer'
        }`}
        initial={{ opacity: 0, y: 30, rotate: -1.2 }}
        animate={{ opacity: 1, y: 0, rotate: -0.6 }}
        transition={{ duration: 1, ease: ease.out }}
      >
        <span className="pointer-events-none absolute -right-3 -top-3 text-rose/60">
          <RoseMark size={38} animate={false} />
        </span>

        <p className="font-hand text-2xl text-ink/80 sm:text-3xl">{greeting}</p>

        <p className="mt-4 whitespace-pre-wrap font-hand text-xl leading-relaxed text-ink/75 sm:text-2xl">
          {body.slice(0, shown)}
          {!done && (
            <motion.span
              aria-hidden="true"
              className="ml-0.5 inline-block h-5 w-px bg-ink/50 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </p>

        {done && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: ease.out }}
          >
            <p className="font-hand text-xl text-ink/70 sm:text-2xl">{signOff}</p>
            {signedBy && (
              <p className="font-hand text-2xl text-rose sm:text-3xl">{signedBy}</p>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className="flex min-h-16 items-center justify-center">
        {!done ? (
          <motion.p
            className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-blush/40"
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: ease.inOut }}
          >
            tap to read it all at once
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <CtaButton variant="dark" onClick={goNext}>
              {cta}
            </CtaButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
