import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Vertical striping reads as folds of heavy velvet. */
const VELVET =
  'repeating-linear-gradient(90deg, #4E070E 0px, #7E0D18 13px, #92131F 24px, #6A0B14 37px, #4E070E 52px)'

/**
 * Two velvet drapes that part to reveal whatever is behind them, so the
 * collage opens like a stage rather than simply fading in.
 *
 * The motion is pure CSS on purpose — a JS-driven animation is fast-forwarded
 * to its end state whenever the tab is hidden, which would mean she could open
 * the link, glance away, and come back to find the curtain already gone.
 */
export function CurtainReveal() {
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div
        className="curtain-left absolute inset-y-0 left-0 w-1/2"
        style={{
          background: VELVET,
          borderRight: '3px solid #D9B168',
          boxShadow: 'inset -26px 0 48px rgba(0,0,0,0.55), 6px 0 26px rgba(0,0,0,0.5)',
        }}
      />
      <div
        className="curtain-right absolute inset-y-0 right-0 w-1/2"
        style={{
          background: VELVET,
          borderLeft: '3px solid #D9B168',
          boxShadow: 'inset 26px 0 48px rgba(0,0,0,0.55), -6px 0 26px rgba(0,0,0,0.5)',
        }}
      />
      {/* warm light spilling through the parting */}
      <div
        className="curtain-glow absolute inset-y-0 left-1/2 w-24 blur-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,214,170,0.55), transparent)',
        }}
      />
    </div>
  )
}
