import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COLORS = ['#C1121F', '#E8837E', '#F6D2CE', '#D9B168', '#FFFFFF', '#8A0F1A']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  w: number
  h: number
  color: string
  life: number
  maxLife: number
  round: boolean
}

interface Props {
  /** Increment this to fire a burst. 0 = nothing yet. */
  trigger: number
  /** Roughly how many pieces per burst. */
  count?: number
  /** Vertical origin of the burst, 0 (top) → 1 (bottom). */
  originY?: number
  /** Horizontal origin of the burst, 0 (left) → 1 (right). */
  originX?: number
}

/**
 * A one-shot confetti burst on a throwaway canvas. The rAF loop only runs
 * while pieces are alive, then stops itself — nothing idles in the
 * background. Skipped entirely under prefers-reduced-motion.
 */
export function Confetti({ trigger, count = 130, originY = 0.42, originX = 0.5 }: Props) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particles = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced || trigger <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Spawn a fresh burst from the origin, thrown outward and upward.
    const ox = w * originX
    const oy = h * originY
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 140 + Math.random() * 420
      const maxLife = 2.2 + Math.random() * 1.8
      particles.current.push({
        x: ox + (Math.random() - 0.5) * 60,
        y: oy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed * 0.6,
        vy: Math.sin(angle) * speed * 0.5 - 220,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 9,
        w: 6 + Math.random() * 7,
        h: 9 + Math.random() * 9,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
        maxLife,
        round: Math.random() < 0.25,
      })
    }

    if (rafRef.current !== null) return // a loop is already running

    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)

      const alive: Particle[] = []
      for (const p of particles.current) {
        p.life += dt
        if (p.life >= p.maxLife) continue
        p.vy += 900 * dt // gravity
        p.vx *= 0.99 // drag
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        if (p.y > h + 40) continue

        const fade = 1 - p.life / p.maxLife
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * 1.4))
        ctx.fillStyle = p.color
        if (p.round) {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Squash horizontally over time so pieces appear to flutter.
          ctx.scale(Math.cos(p.life * 6) * 0.5 + 0.5, 1)
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
        alive.push(p)
      }
      particles.current = alive

      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, w, h)
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // Stop the loop if the scene unmounts mid-burst.
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      particles.current = []
    },
    [],
  )

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 40 }}
    />
  )
}
