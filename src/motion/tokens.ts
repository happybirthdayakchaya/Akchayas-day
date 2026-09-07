/**
 * Central timing + easing so every scene feels part of one film.
 * Tweak here to re-pace the whole experience.
 */
type Cubic = [number, number, number, number]

export const ease = {
  /** Confident, cinematic ease-out (default for entrances). */
  out: [0.22, 1, 0.36, 1] as Cubic,
  /** Symmetrical, for crossfades and color shifts. */
  inOut: [0.65, 0, 0.35, 1] as Cubic,
  /** Gentle, romantic settle. */
  soft: [0.25, 0.46, 0.45, 0.94] as Cubic,
}

export const dur = {
  xs: 0.3,
  sm: 0.5,
  md: 0.8,
  lg: 1.2,
  xl: 1.8,
  /** Scene-to-scene transition length. */
  scene: 1.0,
}

export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 },
  gentle: { type: 'spring', stiffness: 90, damping: 18 },
} as const
