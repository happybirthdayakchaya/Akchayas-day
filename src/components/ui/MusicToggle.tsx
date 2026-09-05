import { AnimatePresence, motion } from 'framer-motion'
import { useAudio } from '@/context/AudioProvider'

/**
 * A small, unobtrusive mute control. Appears only once the music has
 * actually started (and the track loaded), so it never lies about state.
 */
export function MusicToggle() {
  const { started, muted, available, toggleMute } = useAudio()

  return (
    <AnimatePresence>
      {started && available && (
        <motion.button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={muted}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-md"
          style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 18V6l10-2v12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
            {muted && (
              <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
