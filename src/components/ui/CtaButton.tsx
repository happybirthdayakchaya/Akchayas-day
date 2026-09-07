import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ease } from '@/motion/tokens'

interface Props {
  children: ReactNode
  onClick: () => void
  /** `light` = for pale scenes, `dark` = for deep/burgundy scenes. */
  variant?: 'light' | 'dark'
  className?: string
}

export function CtaButton({ children, onClick, variant = 'light', className = '' }: Props) {
  const isLight = variant === 'light'

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Breathing glow behind the button. */}
      <motion.span
        aria-hidden="true"
        className="absolute -inset-4 rounded-full blur-2xl"
        style={{ background: isLight ? 'rgba(193,18,31,0.35)' : 'rgba(246,210,206,0.4)' }}
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 3.4, ease: ease.inOut, repeat: Infinity }}
      />
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: ease.out }}
        className={[
          'relative select-none rounded-full px-8 py-4 font-body text-base tracking-wide',
          'backdrop-blur-md transition-colors',
          'min-h-12 min-w-12', // comfortable tap target
          isLight
            ? 'bg-white/80 text-rose border border-rose/25 shadow-[0_10px_50px_-12px_rgba(193,18,31,0.5)] hover:bg-white'
            : 'bg-white/10 text-white border border-white/35 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.6)] hover:bg-white/20',
        ].join(' ')}
      >
        {children}
      </motion.button>
    </div>
  )
}
