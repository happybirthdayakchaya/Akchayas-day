import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COLORS = ['#C1121F', '#E8837E', '#F6D2CE', '#D9B168', '#FFFFFF']

interface Bit {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  life: number
  maxLife: number
  color: string
  petal: boolean
}

/** Minimum pointer travel before another petal is dropped. */
const SPACING = 26

/**
 * Rose petals and sparkles that trail wherever she touches or moves the
 * cursor. Global and always on, but idle-cheap: the animation loop only runs
 * while there are bits alive, and it never intercepts clicks.
 */
export function TouchTrail() {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bits = useRef<Bit[]>([])
  const rafRef = useRef<number | null>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)

      const alive: Bit[] = []
      for (const b of bits.current) {
        b.life += dt
        if (b.life >= b.maxLife) continue
        b.vy += 120 * dt // a little gravity so petals drift down
        b.vx *= 0.97
        b.x += b.vx * dt
        b.y += b.vy * dt
        b.rot += b.vr * dt

        const fade = 1 - b.life / b.maxLife
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.rot)
        ctx.globalAlpha = Math.max(0, fade * 0.85)
        ctx.fillStyle = b.color
        if (b.petal) {
          const s = b.size
          ctx.beginPath()
          ctx.moveTo(0, -s / 2)
          ctx.quadraticCurveTo(s / 2, 0, 0, s / 2)
          ctx.quadraticCurveTo(-s / 2, 0, 0, -s / 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, b.size * 0.22, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
        alive.push(b)
      }
      bits.current = alive
      ctx.globalAlpha = 1

      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        rafRef.current = null // idle — stop burning frames
      }
    }

    const spawn = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const petal = Math.random() < 0.65
        bits.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 70,
          vy: (Math.random() - 0.5) * 40 - 10,
          size: petal ? 7 + Math.random() * 7 : 6 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 3,
          life: 0,
          maxLife: 0.9 + Math.random() * 0.8,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          petal,
        })
      }
      if (rafRef.current === null) {
        last = performance.now()
        rafRef.current = requestAnimationFrame(frame)
      }
    }

    const onMove = (e: PointerEvent) => {
      const p = lastPoint.current
      if (p) {
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        if (Math.hypot(dx, dy) < SPACING) return
      }
      lastPoint.current = { x: e.clientX, y: e.clientY }
      spawn(e.clientX, e.clientY, 1)
    }

    const onDown = (e: PointerEvent) => {
      lastPoint.current = { x: e.clientX, y: e.clientY }
      spawn(e.clientX, e.clientY, 6) // a small puff on tap
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      bits.current = []
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 45 }}
    />
  )
}
