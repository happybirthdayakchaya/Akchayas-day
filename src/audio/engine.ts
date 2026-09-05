/**
 * A tiny Web Audio engine.
 *
 *  • Music  — a soft, looping music-box score used when no MP3 is supplied.
 *             Warm I–V–vi–IV progression, arpeggiated, with a pad underneath.
 *             Non-fatiguing on repeat, and it needs no asset or licence.
 *  • SFX    — short synthesised effects (pop / whoosh / sparkle / chime) for
 *             the interactive moments.
 *
 * Everything is created lazily on the first user gesture, because browsers
 * refuse to start an AudioContext before one.
 */

export type SfxName = 'pop' | 'whoosh' | 'sparkle' | 'chime'

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

/** I – V – vi – IV, in a music-box register. */
const CHORDS = [
  [72, 76, 79, 84], // C
  [71, 74, 79, 83], // G
  [69, 72, 76, 81], // Am
  [65, 69, 72, 77], // F
]

/** The same progression an octave or two down, held as a soft pad. */
const PADS = [
  [48, 55, 64],
  [43, 50, 59],
  [45, 52, 60],
  [41, 48, 57],
]

const ARP = [0, 1, 2, 3, 2, 1, 0, 1]
const EIGHTH = 60 / 72 / 2 // 72 BPM
const STEPS_PER_BAR = 8
const LOOKAHEAD_MS = 90
const SCHEDULE_AHEAD = 0.35

/**
 * "Happy Birthday to You" — the melody is public domain, and this is
 * synthesised on the spot rather than shipped as a recording.
 * [midi note, length in beats]
 */
const HAPPY_BIRTHDAY: [number, number][] = [
  [67, 0.5], [67, 0.5], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.5], [67, 0.5], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.5], [67, 0.5], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.5], [77, 0.5], [76, 1], [72, 1], [74, 1], [72, 2],
]
const MELODY_BEAT = 60 / 96 // a gentle 96 BPM

export interface AudioEngine {
  /** Create/resume the context. Must be called from a user gesture. */
  unlock: () => void
  startMusic: () => void
  stopMusic: () => void
  /** Ramp the music bus (0–1). */
  setMusicGain: (value: number, ms?: number) => void
  /** Ramp everything (music + effects). */
  setMasterGain: (value: number, ms?: number) => void
  play: (name: SfxName) => void
  /**
   * Play "Happy Birthday" on the music box. The ambient score pauses for the
   * duration and resumes afterwards. Returns roughly how long it will take.
   */
  playHappyBirthday: () => number
  /** Cut the melody short (e.g. the scene was left) and resume the score. */
  stopMelody: () => void
  dispose: () => void
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let musicBus: GainNode | null = null
  let sfxBus: GainNode | null = null
  let noise: AudioBuffer | null = null

  let timer: number | null = null
  let step = 0
  let nextTime = 0
  let musicOn = false

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') void ctx.resume()
      return
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()

    master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)

    // Gentle low-pass keeps the synth soft rather than glassy.
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2600
    tone.Q.value = 0.4
    tone.connect(master)

    musicBus = ctx.createGain()
    musicBus.gain.value = 0
    musicBus.connect(tone)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.5
    sfxBus.connect(master)

    // One reusable noise buffer for the percussive effects.
    const len = Math.floor(ctx.sampleRate * 1.2)
    noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }

  function ramp(node: GainNode | null, value: number, ms: number) {
    if (!ctx || !node) return
    const now = ctx.currentTime
    node.gain.cancelScheduledValues(now)
    node.gain.setValueAtTime(node.gain.value, now)
    node.gain.linearRampToValueAtTime(value, now + Math.max(ms, 1) / 1000)
  }

  /** A single music-box note. Returns its oscillators so callers can cancel. */
  function pluck(time: number, freq: number, gain: number, dest: AudioNode): OscillatorNode[] {
    if (!ctx) return []
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    // A quiet octave above adds the metallic shimmer of a music box.
    const shimmer = ctx.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.value = freq * 2

    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(gain, time + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, time + 2.4)

    const sg = ctx.createGain()
    sg.gain.setValueAtTime(0, time)
    sg.gain.linearRampToValueAtTime(gain * 0.22, time + 0.006)
    sg.gain.exponentialRampToValueAtTime(0.0001, time + 1.1)

    osc.connect(g).connect(dest)
    shimmer.connect(sg).connect(dest)
    osc.start(time)
    shimmer.start(time)
    osc.stop(time + 2.5)
    shimmer.stop(time + 1.2)
    return [osc, shimmer]
  }

  function padChord(time: number, notes: number[], duration: number) {
    if (!ctx || !musicBus) return
    for (const n of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = midi(n)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.05, time + 0.9)
      g.gain.linearRampToValueAtTime(0.035, time + duration * 0.7)
      g.gain.linearRampToValueAtTime(0, time + duration)
      osc.connect(g).connect(musicBus)
      osc.start(time)
      osc.stop(time + duration + 0.1)
    }
  }

  function scheduleStep(index: number, time: number) {
    if (!musicBus) return
    const bar = Math.floor(index / STEPS_PER_BAR) % CHORDS.length
    const inBar = index % STEPS_PER_BAR
    const note = CHORDS[bar][ARP[inBar]]
    // Accent the downbeat a touch so it breathes.
    pluck(time, midi(note), inBar === 0 ? 0.16 : 0.1, musicBus)
    if (inBar === 0) padChord(time, PADS[bar], EIGHTH * STEPS_PER_BAR)
  }

  function tick() {
    if (!ctx || !musicOn) return
    while (nextTime < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(step, nextTime)
      step++
      nextTime += EIGHTH
    }
  }

  function startMusic() {
    unlock()
    if (!ctx || musicOn) return
    musicOn = true
    nextTime = ctx.currentTime + 0.08
    tick()
    timer = window.setInterval(tick, LOOKAHEAD_MS)
  }

  function stopMusic() {
    musicOn = false
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  function play(name: SfxName) {
    if (!ctx || !sfxBus || !noise) return
    const t = ctx.currentTime

    if (name === 'pop') {
      const src = ctx.createBufferSource()
      src.buffer = noise
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1400
      bp.Q.value = 1.6
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.5, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
      src.connect(bp).connect(g).connect(sfxBus)
      src.start(t)
      src.stop(t + 0.1)

      const blip = ctx.createOscillator()
      blip.type = 'sine'
      blip.frequency.setValueAtTime(760, t)
      blip.frequency.exponentialRampToValueAtTime(180, t + 0.1)
      const bg = ctx.createGain()
      bg.gain.setValueAtTime(0.28, t)
      bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      blip.connect(bg).connect(sfxBus)
      blip.start(t)
      blip.stop(t + 0.13)
      return
    }

    if (name === 'whoosh') {
      // Breath across the candles.
      const src = ctx.createBufferSource()
      src.buffer = noise
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.setValueAtTime(1800, t)
      lp.frequency.exponentialRampToValueAtTime(260, t + 0.75)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.42, t + 0.12)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85)
      src.connect(lp).connect(g).connect(sfxBus)
      src.start(t)
      src.stop(t + 0.9)
      return
    }

    if (name === 'sparkle') {
      for (let i = 0; i < 6; i++) {
        const time = t + i * 0.055
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = 1200 + Math.random() * 1500
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, time)
        g.gain.linearRampToValueAtTime(0.14, time + 0.008)
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3)
        osc.connect(g).connect(sfxBus)
        osc.start(time)
        osc.stop(time + 0.32)
      }
      return
    }

    // chime — a little rising flourish
    const notes = [72, 76, 79, 84]
    notes.forEach((n, i) => {
      pluck(t + i * 0.1, midi(n), 0.2, sfxBus as AudioNode)
    })
  }

  let melodyNodes: OscillatorNode[] = []
  let melodyTimer: number | null = null
  let wasPlayingScore = false

  function playHappyBirthday() {
    unlock()
    if (!ctx || !musicBus) return 0

    stopMelody()
    // Step aside so the arpeggio doesn't clash with the tune.
    wasPlayingScore = musicOn
    stopMusic()

    let t = ctx.currentTime + 0.25
    for (const [note, beats] of HAPPY_BIRTHDAY) {
      melodyNodes.push(...pluck(t, midi(note), 0.22, musicBus))
      t += beats * MELODY_BEAT
    }
    const total = t - ctx.currentTime + 0.6

    if (wasPlayingScore) {
      melodyTimer = window.setTimeout(() => {
        melodyTimer = null
        startMusic()
      }, total * 1000)
    }
    return total * 1000
  }

  function stopMelody() {
    for (const osc of melodyNodes) {
      try {
        osc.stop()
      } catch {
        /* already stopped */
      }
    }
    melodyNodes = []
    if (melodyTimer !== null) {
      window.clearTimeout(melodyTimer)
      melodyTimer = null
    }
  }

  function dispose() {
    stopMelody()
    stopMusic()
    if (ctx) void ctx.close()
    ctx = null
    master = null
    musicBus = null
    sfxBus = null
    noise = null
  }

  return {
    unlock,
    startMusic,
    stopMusic,
    setMusicGain: (v, ms = 600) => ramp(musicBus, v, ms),
    setMasterGain: (v, ms = 400) => ramp(master, v, ms),
    play,
    playHappyBirthday,
    stopMelody,
    dispose,
  }
}
