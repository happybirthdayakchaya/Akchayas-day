import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { content } from '@/config/content'
import { createAudioEngine } from '@/audio/engine'
import type { AudioEngine, SfxName } from '@/audio/engine'

const FILE_VOLUME = 0.55
const SYNTH_VOLUME = 0.5
/** Used only when `pauseMusicDuringVideo` is false. */
const DUCK_FACTOR = 0.1

interface AudioValue {
  started: boolean
  muted: boolean
  /** True once there is *something* to hear (a track or the synth score). */
  available: boolean
  /** Begin playback — must be called from a user gesture. */
  start: () => void
  toggleMute: () => void
  /** Silence the music so video voices stay clear. */
  duck: () => void
  /** Bring the music back after a video. */
  unduck: () => void
  /** Fire a short interaction sound. */
  sfx: (name: SfxName) => void
  /** Play "Happy Birthday" on the music box; the score pauses meanwhile. */
  playHappyBirthday: () => void
  stopMelody: () => void
}

const AudioContext_ = createContext<AudioValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const engineRef = useRef<AudioEngine | null>(null)
  const rafRef = useRef<number | null>(null)

  const startedRef = useRef(false)
  const mutedRef = useRef(false)
  const duckingRef = useRef(false)
  /** null = still probing, true = MP3 usable, false = fall back to the synth. */
  const hasFileRef = useRef<boolean | null>(null)

  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)

  // Probe for a real music file. If it is missing we simply use the synth,
  // so the site is never silent.
  useEffect(() => {
    const el = new Audio()
    el.loop = true
    el.preload = 'auto'
    el.volume = 0
    const ok = () => {
      hasFileRef.current = true
    }
    const fail = () => {
      hasFileRef.current = false
    }
    el.addEventListener('canplaythrough', ok)
    el.addEventListener('loadeddata', ok)
    el.addEventListener('error', fail)
    el.src = content.media.music
    audioRef.current = el

    return () => {
      el.removeEventListener('canplaythrough', ok)
      el.removeEventListener('loadeddata', ok)
      el.removeEventListener('error', fail)
      el.pause()
      el.src = ''
      audioRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  /** Target volume for the file player, given mute/duck state. */
  const fileTarget = useCallback(() => {
    if (mutedRef.current) return 0
    if (duckingRef.current) {
      return content.flags.pauseMusicDuringVideo ? 0 : FILE_VOLUME * DUCK_FACTOR
    }
    return FILE_VOLUME
  }, [])

  const rampFile = useCallback((to: number, ms = 700) => {
    const el = audioRef.current
    if (!el) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const from = el.volume
    const startedAt = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - startedAt) / ms)
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      el.volume = Math.max(0, Math.min(1, from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
      else if (to === 0 && content.flags.pauseMusicDuringVideo && duckingRef.current) {
        // Fully stop once faded, so nothing bleeds under the video.
        el.pause()
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  const applyMusicState = useCallback(() => {
    const engine = engineRef.current
    if (hasFileRef.current) {
      const el = audioRef.current
      if (!el) return
      const target = fileTarget()
      if (target > 0 && el.paused) void el.play().catch(() => {})
      rampFile(target, 600)
    } else if (engine) {
      const silentForVideo = duckingRef.current && content.flags.pauseMusicDuringVideo
      if (mutedRef.current || silentForVideo) {
        // Fade out *and* stop scheduling — no notes rendered into a silent bus
        // while 30 videos play.
        engine.setMusicGain(0, 300)
        engine.stopMusic()
      } else if (duckingRef.current) {
        engine.startMusic()
        engine.setMusicGain(SYNTH_VOLUME * DUCK_FACTOR, 400)
      } else {
        engine.startMusic()
        engine.setMusicGain(SYNTH_VOLUME, 900)
      }
    }
  }, [fileTarget, rampFile])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    setStarted(true)

    // The engine is always created — it powers the sound effects even when a
    // real music track is supplied.
    if (!engineRef.current) engineRef.current = createAudioEngine()
    engineRef.current.unlock()

    // Treat the file as usable if the probe said so, or if it already holds
    // enough data (the probe may not have fired yet).
    const el0 = audioRef.current
    const fileReady = hasFileRef.current === true || (el0 != null && el0.readyState >= 2)
    hasFileRef.current = fileReady

    if (fileReady) {
      const el = audioRef.current
      if (el) {
        el.volume = 0
        el.play()
          .then(() => rampFile(fileTarget()))
          .catch(() => {
            // Blocked or broken — fall back to the synth score.
            hasFileRef.current = false
            engineRef.current?.startMusic()
            applyMusicState()
          })
      }
    } else {
      engineRef.current.startMusic()
      applyMusicState()
    }
  }, [applyMusicState, fileTarget, rampFile])

  // Any first interaction starts the sound — not just the opening button — so
  // music also begins if she reloads partway through the story.
  useEffect(() => {
    const begin = () => start()
    window.addEventListener('pointerdown', begin, { once: true })
    window.addEventListener('keydown', begin, { once: true })
    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }
  }, [start])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    engineRef.current?.setMasterGain(mutedRef.current ? 0 : 1, 250)
    applyMusicState()
  }, [applyMusicState])

  const duck = useCallback(() => {
    duckingRef.current = true
    applyMusicState()
  }, [applyMusicState])

  const unduck = useCallback(() => {
    duckingRef.current = false
    applyMusicState()
  }, [applyMusicState])

  const sfx = useCallback((name: SfxName) => {
    if (!content.flags.soundEffects || mutedRef.current) return
    engineRef.current?.play(name)
  }, [])

  const playHappyBirthday = useCallback(() => {
    if (mutedRef.current) return
    // Only meaningful for the synth score; with a real track we leave the
    // music alone rather than talking over it.
    if (hasFileRef.current) return
    engineRef.current?.playHappyBirthday()
  }, [])

  const stopMelody = useCallback(() => {
    engineRef.current?.stopMelody()
  }, [])

  const value = useMemo<AudioValue>(
    () => ({
      started,
      muted,
      available: true,
      start,
      toggleMute,
      duck,
      unduck,
      sfx,
      playHappyBirthday,
      stopMelody,
    }),
    [started, muted, start, toggleMute, duck, unduck, sfx, playHappyBirthday, stopMelody],
  )

  return <AudioContext_.Provider value={value}>{children}</AudioContext_.Provider>
}

export function useAudio(): AudioValue {
  const ctx = useContext(AudioContext_)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
