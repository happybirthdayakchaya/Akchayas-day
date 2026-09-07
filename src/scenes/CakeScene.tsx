import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperience } from '@/context/ExperienceProvider'
import { useAudio } from '@/context/AudioProvider'
import { content } from '@/config/content'
import { CtaButton } from '@/components/ui/CtaButton'
import { RevealText } from '@/components/ui/RevealText'
import { Confetti } from '@/components/ambient/Confetti'
import { Balloons } from '@/components/ambient/Balloons'
import { ease } from '@/motion/tokens'

/* ── Geometry (viewBox 0 0 420 380) — a three-quarter view ─────────────── */
const CX = 210
const BOTTOM = { rx: 130, ry: 21, top: 228, base: 312 }
const TOP = { rx: 92, ry: 16, top: 154, base: 220 }
const RING = { rx: 74, ry: 12, cy: 152 }
const CANDLE_H = 40

type Phase = 'lit' | 'blown' | 'cutting' | 'cut'

const tierBody = (cx: number, rx: number, ry: number, top: number, base: number) =>
  `M ${cx - rx} ${top} L ${cx - rx} ${base} A ${rx} ${ry} 0 0 0 ${cx + rx} ${base} L ${cx + rx} ${top} Z`

/** Evenly spaced points along the front (lower) half of an ellipse. */
function arcPoints(cx: number, cy: number, rx: number, ry: number, n: number) {
  return Array.from({ length: n }, (_, k) => {
    const a = Math.PI * ((k + 0.5) / n)
    return { x: cx - rx * Math.cos(a), y: cy + ry * Math.sin(a) }
  })
}

/** A piped sugar rose — the motif of the whole site, iced onto the cake. */
function Rose({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#C1121F" />
      <circle r={r} fill="url(#roseShade)" />
      <path
        d={`M ${-r * 0.6} ${r * 0.12} a ${r * 0.62} ${r * 0.62} 0 1 1 ${r * 1.2} ${-r * 0.18}`}
        fill="none"
        stroke="#8A0F1A"
        strokeWidth={r * 0.19}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d={`M ${-r * 0.32} ${r * 0.06} a ${r * 0.34} ${r * 0.34} 0 1 0 ${r * 0.66} ${-r * 0.1}`}
        fill="none"
        stroke="#8A0F1A"
        strokeWidth={r * 0.17}
        strokeLinecap="round"
        opacity={0.9}
      />
      <circle r={r * 0.17} fill="#6E0B14" />
    </g>
  )
}

function Sparkler({ x, y }: { x: number; y: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => i)
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-1} y={0} width={2} height={34} rx={1} fill="#8A7A6A" />
      <circle r={14} fill="url(#candleGlow)" opacity={0.85} />
      {rays.map((i) => (
        <g key={i} transform={`rotate(${(i / rays.length) * 360})`}>
          <rect
            className="spark-ray"
            x={3}
            y={-0.7}
            width={8 + (i % 3) * 5}
            height={1.4}
            rx={0.7}
            fill="#FFD79A"
            style={{ animationDelay: `${(i % 5) * 0.05}s` }}
          />
        </g>
      ))}
      <circle className="spark-core" r={4} fill="#FFF6D8" />
    </g>
  )
}

interface Spot {
  x: number
  y: number
  i: number
}

function Candle({ spot, blown, order }: { spot: Spot; blown: boolean; order: number }) {
  const { x, y, i } = spot
  const variant = ['flame-a', 'flame-b', 'flame-c'][i % 3]
  const wickY = -CANDLE_H - 2

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-2.2} y={-CANDLE_H} width={4.4} height={CANDLE_H} rx={2.2} fill="#FFFDF8" />
      <rect x={-2.2} y={-CANDLE_H} width={1.7} height={CANDLE_H} rx={0.9} fill="#C9A79B" opacity={0.35} />
      <rect x={-2.2} y={-CANDLE_H + 5} width={4.4} height={1.8} fill="#D9B168" opacity={0.75} />
      <rect x={-0.5} y={wickY} width={1} height={3} rx={0.5} fill="#4A3129" />

      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        animate={blown ? { opacity: 0, scaleY: 0 } : { opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.32, delay: blown ? order * 0.02 : 0, ease: ease.out }}
      >
        <g transform={`translate(0 ${wickY})`}>
          <circle className="flame-halo" cy={-8} r={13} fill="url(#candleGlow)" />
          <g className={`flame ${variant}`}>
            <path d="M0 0 C -4.2 -4 -4.6 -9.5 0 -16 C 4.6 -9.5 4.2 -4 0 0 Z" fill="#FF8A2B" />
            <path d="M0 -0.5 C -2.9 -4 -3.1 -8 0 -12.5 C 3.1 -8 2.9 -4 0 -0.5 Z" fill="#FFC24D" />
            <path d="M0 -2 C -1.4 -4.2 -1.5 -6.5 0 -9 C 1.5 -6.5 1.4 -4.2 0 -2 Z" fill="#FFF3C4" />
          </g>
        </g>
      </motion.g>

      {blown && (
        <motion.path
          d="M0 -40 c 3.5 -7 -3.5 -10 0 -17"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.6, 0], y: -22 }}
          transition={{ duration: 1.8, delay: order * 0.02, ease: ease.out }}
        />
      )}
    </g>
  )
}

export function CakeScene() {
  const { goNext } = useExperience()
  const { sfx, started, playHappyBirthday, stopMelody } = useAudio()

  const [phase, setPhase] = useState<Phase>('lit')
  const [burst, setBurst] = useState({ n: 0, x: 0.5, y: 0.45 })
  const [showKnife, setShowKnife] = useState(false)
  const [showCta, setShowCta] = useState(false)

  const blown = phase !== 'lit'
  const cut = phase === 'cut'

  const candles = useMemo<Spot[]>(() => {
    const n = content.person.milestoneAge
    return Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2
      return { i, x: CX + RING.rx * Math.cos(t), y: RING.cy + RING.ry * Math.sin(t) }
    }).sort((a, b) => a.y - b.y)
  }, [])

  const seamRoses = useMemo(() => arcPoints(CX, TOP.base - 2, TOP.rx - 4, TOP.ry, 6), [])
  // A full garland around the bottom tier, rather than a rose at each corner.
  const baseRoses = useMemo(
    () => arcPoints(CX, BOTTOM.base - 16, BOTTOM.rx - 15, BOTTOM.ry, 9),
    [],
  )
  const baseShells = useMemo(() => arcPoints(CX, BOTTOM.base - 1, BOTTOM.rx - 3, BOTTOM.ry, 17), [])
  const topShells = useMemo(() => arcPoints(CX, TOP.base - 1, TOP.rx - 3, TOP.ry, 12), [])
  const bottomPearls = useMemo(() => arcPoints(CX, BOTTOM.top, BOTTOM.rx - 2, BOTTOM.ry, 15), [])
  const topPearls = useMemo(() => arcPoints(CX, TOP.top, TOP.rx - 2, TOP.ry, 11), [])

  // The song greets her the moment she arrives.
  useEffect(() => {
    if (!started) return
    const t = window.setTimeout(playHappyBirthday, 700)
    return () => window.clearTimeout(t)
  }, [started, playHappyBirthday])

  useEffect(() => () => stopMelody(), [stopMelody])

  // Once the candles are out, invite her to cut.
  useEffect(() => {
    if (phase !== 'blown') return
    const t = window.setTimeout(() => setShowKnife(true), 1400)
    return () => window.clearTimeout(t)
  }, [phase])

  const blow = () => {
    if (phase !== 'lit') return
    setPhase('blown')
    setBurst((b) => ({ n: b.n + 1, x: 0.5, y: 0.42 }))
    sfx('whoosh')
    window.setTimeout(() => sfx('sparkle'), 650)
  }

  const doCut = () => {
    if (phase !== 'blown') return
    setPhase('cutting')
    sfx('whoosh')

    window.setTimeout(() => {
      setPhase('cut')
      sfx('chime')
      // Three staggered bursts across the screen — the big moment.
      const shots: [number, number][] = [
        [0.5, 0.45],
        [0.18, 0.55],
        [0.82, 0.55],
      ]
      // Spread them out so the cake stays visible between volleys.
      shots.forEach(([x, y], k) =>
        window.setTimeout(() => {
          setBurst((b) => ({ n: b.n + 1, x, y }))
          if (k > 0) sfx('pop')
        }, k * 420),
      )
      window.setTimeout(() => setShowCta(true), 1500)
    }, 780)
  }

  const heading = cut
    ? content.copy.cake.cutDone
    : phase === 'lit'
      ? content.copy.cake.line
      : content.copy.cake.wish

  return (
    <div className="scene relative flex flex-col items-center justify-center gap-10 text-center text-blush">
      {blown && <Balloons count={cut ? 16 : 5} poppable />}
      <Confetti trigger={burst.n} originX={burst.x} originY={burst.y} count={cut ? 85 : 110} />

      <RevealText
        key={heading}
        text={heading}
        as="h2"
        className="relative max-w-md font-display text-3xl italic sm:text-4xl"
      />

      <button
        type="button"
        onClick={phase === 'lit' ? blow : doCut}
        disabled={phase === 'cutting' || cut}
        aria-label={
          phase === 'lit'
            ? 'Tap to blow out the candles'
            : phase === 'blown'
              ? 'Tap to cut the cake'
              : 'The cake has been cut'
        }
        className="relative w-full max-w-md cursor-pointer disabled:cursor-default"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 36%, rgba(255,186,105,0.5), rgba(255,186,105,0) 62%)',
          }}
          animate={{ opacity: cut ? 0.85 : blown ? 0.15 : [0.7, 1, 0.7] }}
          transition={
            blown
              ? { duration: 1.2, ease: ease.out }
              : { duration: 3.4, ease: ease.inOut, repeat: Infinity }
          }
        />

        <motion.svg
          // Trimmed to the cake itself now the stand is gone — no dead space.
          viewBox="0 0 420 344"
          className="w-full drop-shadow-[0_26px_70px_rgba(0,0,0,0.7)]"
          initial={{ opacity: 0, y: 26, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: ease.out }}
          whileTap={blown && phase !== 'blown' ? undefined : { scale: 0.985 }}
        >
          <defs>
            <linearGradient id="icing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="55%" stopColor="#F8E7DA" />
              <stop offset="100%" stopColor="#E4C9B8" />
            </linearGradient>
            <linearGradient id="icingTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5E2D6" />
            </linearGradient>
            <radialGradient id="roseShade" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#6E0B14" stopOpacity="0.55" />
            </radialGradient>
            <radialGradient id="candleGlow">
              <stop offset="0%" stopColor="#FFD79A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFD79A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0D9A6" />
              <stop offset="100%" stopColor="#C39A54" />
            </linearGradient>
          </defs>

          {/* ── bottom tier ── */}
          <path d={tierBody(CX, BOTTOM.rx, BOTTOM.ry, BOTTOM.top, BOTTOM.base)} fill="url(#icing)" />
          <ellipse cx={CX} cy={BOTTOM.top} rx={BOTTOM.rx} ry={BOTTOM.ry} fill="url(#icingTop)" />
          {/* piped shell border at the base */}
          {baseShells.map((p, k) => (
            <circle key={k} cx={p.x} cy={p.y} r={7} fill="#FFFDF8" />
          ))}
          {baseShells.map((p, k) => (
            <circle key={`h${k}`} cx={p.x - 1.6} cy={p.y - 1.8} r={2.6} fill="#fff" opacity={0.85} />
          ))}
          {/* gold pearls along the top edge */}
          {bottomPearls.map((p, k) => (
            <circle key={k} cx={p.x} cy={p.y} r={2.6} fill="url(#gold)" />
          ))}
          <text
            x={CX}
            y={276}
            textAnchor="middle"
            fill="#C39A54"
            fontSize={34}
            fontFamily="Cormorant Garamond, serif"
            fontStyle="italic"
          >
            30
          </text>

          {/* ── top tier ── */}
          <path d={tierBody(CX, TOP.rx, TOP.ry, TOP.top, TOP.base)} fill="url(#icing)" />
          <ellipse cx={CX} cy={TOP.top} rx={TOP.rx} ry={TOP.ry} fill="url(#icingTop)" />
          {topShells.map((p, k) => (
            <circle key={k} cx={p.x} cy={p.y} r={6} fill="#FFFDF8" />
          ))}
          {topPearls.map((p, k) => (
            <circle key={k} cx={p.x} cy={p.y} r={2.3} fill="url(#gold)" />
          ))}

          {/* the cut, once she's made it */}
          {cut && (
            <g>
              <path
                d={`M ${CX} ${TOP.top} L ${CX - 30} ${TOP.top + 12} L ${CX + 2} ${TOP.top + 17} Z`}
                fill="#7A1020"
              />
              <path
                d={`M ${CX - 13} ${TOP.top + 15} L ${CX - 13} ${TOP.base + 1}`}
                stroke="#7A1020"
                strokeWidth={2.6}
                strokeLinecap="round"
                opacity={0.5}
              />
            </g>
          )}

          {/* roses hiding the seam between the tiers */}
          {seamRoses.map((p, k) => (
            <Rose key={k} x={p.x} y={p.y} r={11} />
          ))}
          {baseRoses.map((p, k) => (
            <Rose key={`b${k}`} x={p.x} y={p.y} r={12} />
          ))}

          {/* ── candles ── */}
          {candles.map((spot, order) => (
            <Candle key={spot.i} spot={spot} blown={blown} order={order} />
          ))}

          {/* sparklers ignite with the cut */}
          {cut && (
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Sparkler x={CX - 62} y={TOP.top - 46} />
              <Sparkler x={CX + 62} y={TOP.top - 46} />
            </motion.g>
          )}

          {/* the knife */}
          {(phase === 'cutting' || cut) && (
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
              initial={{ x: 110, y: -110, rotate: -45, opacity: 0 }}
              animate={
                phase === 'cutting'
                  ? { x: 0, y: 0, rotate: 6, opacity: 1 }
                  : { x: -30, y: -70, rotate: -30, opacity: 0 }
              }
              transition={{ duration: 0.72, ease: ease.out }}
            >
              <g transform={`translate(${CX - 26} ${TOP.top + 4})`}>
                <path d="M0 0 L58 -7 L66 -2 L58 5 L0 7 Z" fill="#DDE3EA" />
                <path d="M0 1 L58 -5 L58 0 L0 4 Z" fill="#fff" opacity={0.8} />
                <rect x={-40} y={-3} width={40} height={11} rx={5} fill="#5A2A1E" />
                <rect x={-40} y={-3} width={40} height={4} rx={2} fill="#7A3E2C" />
              </g>
            </motion.g>
          )}
        </motion.svg>
      </button>

      <div className="relative flex min-h-16 flex-col items-center justify-center gap-2">
        {phase === 'lit' && (
          <motion.p
            className="font-body text-sm uppercase tracking-[0.25em] text-blush/60"
            initial={{ opacity: 0.45 }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, ease: ease.inOut, repeat: Infinity }}
          >
            {content.copy.cake.hint}
          </motion.p>
        )}
        {phase === 'blown' && showKnife && (
          <motion.p
            className="font-body text-sm uppercase tracking-[0.25em] text-gold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
            transition={{ opacity: { duration: 2, repeat: Infinity }, y: { duration: 0.5 } }}
          >
            {content.copy.cake.cutHint}
          </motion.p>
        )}
        {cut && showCta && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <CtaButton variant="dark" onClick={goNext}>
              {content.copy.cake.cta}
            </CtaButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
