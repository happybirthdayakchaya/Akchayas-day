import { motion } from 'framer-motion'
import { RoseMark } from '@/components/ui/RoseMark'
import { ease } from '@/motion/tokens'

/**
 * The thumbnail behind every wish clip. It sits there while the video is
 * loading and stays put if the network drops, so she always sees something
 * warm rather than a black rectangle.
 */
export function RosePoster({
  name,
  loading = false,
  failed = false,
}: {
  name?: string
  loading?: boolean
  failed?: boolean
}) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-gradient-to-br from-burgundy via-rose-deep to-burgundy-900">
      {/* soft warm light behind the rose */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(217,177,104,0.28), rgba(217,177,104,0) 65%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <motion.div
          className="text-blush/75"
          animate={{ scale: [1, 1.07, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 3.4, ease: ease.inOut, repeat: Infinity }}
        >
          <RoseMark size={64} animate={false} />
        </motion.div>

        {name && <p className="font-display text-xl text-blush/90">{name}</p>}

        {loading && (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blush/25 border-t-blush/80" />
        )}

        {failed && (
          <p className="font-body text-[0.65rem] uppercase tracking-[0.25em] text-blush/50">
            on its way… ❤️
          </p>
        )}
      </div>
    </div>
  )
}
