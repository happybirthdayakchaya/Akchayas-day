import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '@/context/AudioProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ease } from '@/motion/tokens'

const TINTS = ['#C1121F', '#8A0F1A', '#F6D2CE', '#D9B168', '#E8837E']

function Balloon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" fill="none" aria-hidden="true">
      <ellipse cx="20" cy="22" rx="15" ry="19" fill={color} />
      {/* soft highlight so it reads as glossy, not flat */}
      <ellipse cx="14" cy="15" rx="4.5" ry="7" fill="#fff" opacity="0.25" />
      <path d="M20 41l-3 4h6l-3-4z" fill={color} />
      <path
        d="M20 45c3 4-3 7 0 11"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** The little shower of scraps left behind when a balloon pops. */
function PopBurst({ color, size }: { color: string; size: number }) {
  return (
    <div className="relative" style={{ width: size, height: size * 1.5 }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2
        const distance = size * 0.9
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: size / 2,
              top: size / 2,
              width: 5,
              height: 5,
              background: color,
            }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 0.4,
            }}
            transition={{ duration: 0.65, ease: ease.out }}
          />
        )
      })}
    </div>
  )
}

/**
 * A few balloons drifting up the screen — deliberately sparse so the
 * celebration reads as elegant. When `poppable`, tapping one pops it with a
 * sound and a scatter of scraps.
 */
export function Balloons({ count = 6, poppable = false }: { count?: number; poppable?: boolean }) {
  const reduced = useReducedMotion()
  const { sfx } = useAudio()
  const [popped, setPopped] = useState<number[]>([])

  if (reduced) return null

  const pop = (i: number) => {
    if (popped.includes(i)) return
    setPopped((p) => [...p, i])
    sfx('pop')
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${poppable ? '' : 'pointer-events-none'}`}
      aria-hidden={poppable ? undefined : 'true'}
    >
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 17 + 7) % 92
        const size = 26 + (i % 3) * 12
        const duration = 16 + (i % 4) * 5
        const delay = (i % 5) * 3.2
        const color = TINTS[i % TINTS.length]
        const isPopped = popped.includes(i)

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${left}%`, bottom: -120, opacity: 0.55 }}
            initial={{ y: 0 }}
            animate={{
              y: [0, -(window.innerHeight + 240)],
              x: [0, i % 2 ? 26 : -26, 0],
            }}
            transition={{
              duration,
              delay,
              ease: ease.inOut,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            {isPopped ? (
              <PopBurst color={color} size={size} />
            ) : poppable ? (
              <button
                type="button"
                onClick={() => pop(i)}
                aria-label="Pop the balloon"
                className="cursor-pointer border-0 bg-transparent p-0"
              >
                <Balloon color={color} size={size} />
              </button>
            ) : (
              <Balloon color={color} size={size} />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
