import { motion } from 'framer-motion'
import { ease } from '@/motion/tokens'

/**
 * The recurring rose motif — a single elegant line-rose that reappears
 * across scenes. Inherits `currentColor`, so each scene tints it.
 */
export function RoseMark({
  size = 48,
  className = '',
  animate = true,
}: {
  size?: number
  className?: string
  animate?: boolean
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      initial={animate ? { opacity: 0, scale: 0.6, rotate: -12 } : false}
      animate={animate ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      transition={{ duration: 1.1, ease: ease.out }}
    >
      <g
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* bloom */}
        <path d="M32 39c-6 0-11-4-11-11 0-6 4-10 9-10 4 0 7 3 7 7 0 3-2 6-5 6-2.2 0-4-1.8-4-4 0-1.3 1-3 3-3" />
        <path d="M32 39c6 0 11-4 11-11 0-3-1-5.5-2.6-7.4" />
        <path d="M23 20.5C25 18 28 16.5 32 16.5" />
        {/* leaves */}
        <path d="M21 34c-3.5 1.2-7 .2-9.5-3.2 3.4-1.6 6.9-1 9.5 1.6" />
        <path d="M43 34c3.5 1.2 7 .2 9.5-3.2-3.4-1.6-6.9-1-9.5 1.6" />
        {/* stem */}
        <path d="M32 39v12" />
      </g>
    </motion.svg>
  )
}
