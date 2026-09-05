import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COLORS = ['#C1121F', '#E8837E', '#F6D2CE', '#D9B168', '#FFFFFF', '#FF8FA3']

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  trail: boolean
}

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
}

/**
 * Rockets that climb, burst, and rain down. Self-managing: the loop only runs
 * while the component is mounted, and stops on unmount or reduced motion.
 * `burstAt` (normalised 0–1) launches an extra firework on demand.
 */
export function Fireworks({
  burst,
  burstAt,
}: {
  /** Increment to launch one at `burstAt`. */
  burst?: number
  burstAt?: { x: number; y: number }
}) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rockets = useRef<Rocket[]>([])
  const sparks = useRef<Spark[]>([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const launchRef = useRef<((nx?: number, ny?: number) => void) | null>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const launch = (nx?: number, ny?: number) => {
      const { w, h } = sizeRef.current
      const x = nx != null ? nx * w : w * (0.2 + Math.random() * 0.6)
      const targetY = ny != null ? ny * h : h * (0.18 + Math.random() * 0.3)
      rockets.current.push({
        x,
        y: h + 10,
        vy: -(520 + Math.random() * 160),
        targetY,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      })
    }
    launchRef.current = launch

    const explode = (x: number, y: number, color: string) => {
      const count = 46 + ((Math.random() * 22) | 0)
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2
        const speed = 60 + Math.random() * 190
        sparks.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 1.1 + Math.random() * 1.1,
          color: Math.random() < 0.18 ? '#FFFFFF' : color,
          trail: Math.random() < 0.5,
        })
      }
    }

    let last = performance.now()
    let nextLaunch = 900
    let raf = 0

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const { w, h } = sizeRef.current

      // Fade rather than clear, so sparks leave soft trails. `destination-out`
      // *erases* a little alpha each frame — filling with translucent black
      // instead would build up an opaque sheet over the whole page.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      nextLaunch -= dt * 1000
      if (nextLaunch <= 0) {
        launch()
        nextLaunch = 1400 + Math.random() * 1800
      }

      for (let i = rockets.current.length - 1; i >= 0; i--) {
        const r = rockets.current[i]
        r.vy += 420 * dt // gravity slows the climb
        r.y += r.vy * dt
        ctx.globalAlpha = 0.9
        ctx.fillStyle = r.color
        ctx.beginPath()
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r.x, r.y, r.color)
          rockets.current.splice(i, 1)
        }
      }

      const alive: Spark[] = []
      for (const s of sparks.current) {
        s.life += dt
        if (s.life >= s.maxLife) continue
        s.vy += 150 * dt
        s.vx *= 0.985
        s.vy *= 0.985
        s.x += s.vx * dt
        s.y += s.vy * dt
        const fade = 1 - s.life / s.maxLife
        ctx.globalAlpha = Math.max(0, fade)
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.trail ? 2 : 1.4, 0, Math.PI * 2)
        ctx.fill()
        alive.push(s)
      }
      sparks.current = alive
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      rockets.current = []
      sparks.current = []
      launchRef.current = null
    }
  }, [reduced])

  // Launch one on demand (e.g. she tapped the screen).
  useEffect(() => {
    if (!burst || burst <= 0) return
    launchRef.current?.(burstAt?.x, burstAt?.y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      // Behind the closing words — fireworks belong in the sky, not over her face.
      style={{ zIndex: 0 }}
    />
  )
}
