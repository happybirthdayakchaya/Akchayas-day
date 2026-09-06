import { useEffect, useRef } from 'react'
import { useExperience } from '@/context/ExperienceProvider'
import type { Scene } from '@/context/ExperienceProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Ambient = { count: number; palette: string[]; alpha: number }

const LIGHT = ['#C1121F', '#E8837E', '#F6D2CE', '#D9B168']
const DARK = ['#F6D2CE', '#FBE6E3', '#D9B168', '#FFFFFF']

/** How thick the petal-fall is, and in which palette, per scene. */
const AMBIENT: Record<Scene, Ambient> = {
  loading: { count: 10, palette: LIGHT, alpha: 0.22 },
  opening: { count: 16, palette: LIGHT, alpha: 0.24 },
  chapter1: { count: 12, palette: LIGHT, alpha: 0.2 },
  photo: { count: 10, palette: LIGHT, alpha: 0.18 },
  chapter2: { count: 14, palette: DARK, alpha: 0.32 },
  reveal: { count: 30, palette: LIGHT, alpha: 0.32 },
  numbers: { count: 14, palette: DARK, alpha: 0.3 },
  cake: { count: 12, palette: DARK, alpha: 0.3 }, // sparse — the cake is the star
  chapter3: { count: 14, palette: DARK, alpha: 0.34 },
  gift: { count: 16, palette: DARK, alpha: 0.36 },
  special: { count: 18, palette: DARK, alpha: 0.4 },
  chapter4: { count: 16, palette: DARK, alpha: 0.36 },
  wishesIntro: { count: 20, palette: DARK, alpha: 0.4 },
  wishes: { count: 10, palette: DARK, alpha: 0.28 }, // sparse — keep focus on video
  scratch: { count: 14, palette: DARK, alpha: 0.34 },
  letter: { count: 10, palette: DARK, alpha: 0.26 }, // quiet — let her read
  chapter5: { count: 20, palette: DARK, alpha: 0.42 },
  finale: { count: 34, palette: DARK, alpha: 0.5 },
}

interface Petal {
  x: number
  y: number
  size: number
  rot: number
  rotSpeed: number
  fall: number
  swayPhase: number
  swaySpeed: number
  swayAmp: number
  alpha: number
  color: string
}

function makePetal(w: number, h: number, cfg: Ambient, seedTop = false): Petal {
  const size = 8 + Math.random() * 12
  return {
    x: Math.random() * w,
    y: seedTop ? -size - Math.random() * h : Math.random() * h,
    size,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.6,
    fall: 16 + Math.random() * 26,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.4 + Math.random() * 0.6,
    swayAmp: 12 + Math.random() * 22,
    alpha: (0.5 + Math.random() * 0.5) * cfg.alpha,
    color: cfg.palette[(Math.random() * cfg.palette.length) | 0],
  }
}

export function PetalCanvas() {
  const { scene } = useExperience()
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cfgRef = useRef<Ambient>(AMBIENT[scene])

  // Keep the live loop pointed at the current scene's ambient config.
  cfgRef.current = AMBIENT[scene]

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let petals: Petal[] = []
    let raf = 0
    let last = performance.now()

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
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

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      const s = p.size
      ctx.beginPath()
      ctx.moveTo(0, -s / 2)
      ctx.quadraticCurveTo(s / 2, 0, 0, s / 2)
      ctx.quadraticCurveTo(-s / 2, 0, 0, -s / 2)
      ctx.fill()
      ctx.restore()
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const cfg = cfgRef.current

      // Gently grow/shrink the population toward the scene target.
      if (petals.length < cfg.count) {
        petals.push(makePetal(w, h, cfg, true))
      } else if (petals.length > cfg.count) {
        petals.splice(0, petals.length - cfg.count)
      }

      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.fall * dt
        p.x += Math.sin(now / 1000 * p.swaySpeed + p.swayPhase) * p.swayAmp * dt
        p.rot += p.rotSpeed * dt
        if (p.y > h + p.size) {
          Object.assign(p, makePetal(w, h, cfg, false), { y: -p.size, x: Math.random() * w })
        }
        drawPetal(p)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0"
      style={{ zIndex: 1 }}
    />
  )
}
