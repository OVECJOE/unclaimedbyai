/**
 * Seeded procedural sound. No samples, no AI, no network: every cue is
 * synthesized from oscillators and filtered noise at the moment it is
 * heard, and the whole character of a cue — scale, pitch, timing,
 * contour, timbre — is derived from a hash of (a per-browser salt) +
 * (a text seed) + (the mood). Two consequences the product leans on:
 *
 *  - the same action with the same content always sounds the same, so
 *    a search "has a sound" and the interface feels like an object
 *    rather than a webpage;
 *  - every visitor hears a different interface, because the salt and
 *    the seed differ per person and per moment.
 *
 * The moods follow published psychoacoustic guidance for UI sounds:
 * long releases and ascending contours cue comfort and confidence,
 * short releases cue interruption, low spectral centroids cue calm
 * (Wiley HBE&T 2025, "Designing Emotional and Intuitive Sounds").
 */

export type SoundMood =
  | "tap" // any click; neutral, quiet, immediate
  | "launch" // submitting a brief: a breath up and out
  | "reveal" // first results arriving: an ascending shimmer
  | "complete" // a run settling: a warm rolled chord
  | "error" // a soft descending fall — informative, not punishing
  | "spark" // micro-rewards: copy, star, toggle on
  | "reward" // money moments: credits, payment, unlock

const SOUND_STORAGE_KEY = "uba-sound"
const SALT_STORAGE_KEY = "uba-sonic-salt"
const MIN_GAP_MS = 40
/** Distinct moods may layer (tap → launch); identical ones coalesce
 *  (an explicitly played error and the toast's own error cue). */
const MOOD_GAP_MS = 250
const MAX_VOICES = 14

/* ------------------------------------------------------------------ */
/* Enabled store (hydrated from localStorage, subscribable for React)  */
/* ------------------------------------------------------------------ */

type Listener = () => void

const listeners = new Set<Listener>()
let enabled = true
let hydrated = false

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    if (window.localStorage.getItem(SOUND_STORAGE_KEY) === "off") {
      enabled = false
    }
  } catch {
    // Private mode: stay at the default.
  }
}

export function isSoundEnabled(): boolean {
  hydrate()
  return enabled
}

export function setSoundEnabled(next: boolean): void {
  hydrate()
  enabled = next
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off")
  } catch {
    // Private mode: the preference lives for the session only.
  }
  listeners.forEach((listener) => listener())
}

/** Adopt a value another tab wrote, without writing it back. */
export function syncSoundEnabledFromStorage(): void {
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY)
    if (raw !== null && (raw === "on") !== enabled) {
      enabled = raw === "on"
      listeners.forEach((listener) => listener())
    }
  } catch {
    // Private mode: nothing to sync.
  }
}

export function subscribeSound(listener: Listener): () => void {
  hydrate()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* ------------------------------------------------------------------ */
/* Seeding                                                            */
/* ------------------------------------------------------------------ */

function hashSeed(text: string): number {
  // FNV-1a, 32-bit.
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function userSalt(): string {
  try {
    let salt = window.localStorage.getItem(SALT_STORAGE_KEY)
    if (!salt) {
      salt =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.localStorage.setItem(SALT_STORAGE_KEY, salt)
    }
    return salt
  } catch {
    // Private mode: a session-scoped salt still varies per page load.
    return "uba-session"
  }
}

/* ------------------------------------------------------------------ */
/* Engine: context, master chain, shared space                         */
/* ------------------------------------------------------------------ */

type Engine = {
  ctx: AudioContext
  master: GainNode
  dry: GainNode
  convolver: ConvolverNode | null
  wet: GainNode
}

let engine: Engine | null = null
let noise: AudioBuffer | null = null
let activeVoices = 0
const lastPlayedAt: Record<string, number> = {}

function ensureEngine(): Engine | null {
  if (engine) return engine
  if (typeof window === "undefined") return null
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  try {
    const ctx = new Ctor()
    // A gentle limiter keeps every cue below conversation volume no
    // matter how many overlap.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -14
    limiter.knee.value = 18
    limiter.ratio.value = 5
    limiter.attack.value = 0.003
    limiter.release.value = 0.3
    limiter.connect(ctx.destination)
    const master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(limiter)
    const dry = ctx.createGain()
    dry.connect(master)
    const wet = ctx.createGain()
    wet.gain.value = 0.7
    wet.connect(master)
    engine = { ctx, master, dry, convolver: null, wet }
    return engine
  } catch {
    return null
  }
}

/** Create the AudioContext inside the first user gesture, if needed. */
export function resumeSoundContext(): void {
  if (!isSoundEnabled()) return
  const e = ensureEngine()
  if (e && e.ctx.state !== "running") {
    void e.ctx.resume().catch(() => {})
  }
}

function space(e: Engine): ConvolverNode {
  if (!e.convolver) {
    const convolver = e.ctx.createConvolver()
    convolver.buffer = impulseResponse(e.ctx)
    convolver.connect(e.wet)
    e.convolver = convolver
  }
  return e.convolver
}

/** A short, dark room: seeded noise decaying into silence. */
function impulseResponse(ctx: AudioContext): AudioBuffer {
  const seconds = 1.1
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  const rng = mulberry32(0x5eed5eed ^ length)
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      const t = i / length
      const fadeIn = Math.min(1, i / 256)
      data[i] = (rng() * 2 - 1) * Math.pow(1 - t, 2.6) * fadeIn
    }
  }
  return buffer
}

function noiseBuffer(e: Engine): AudioBuffer {
  if (noise) return noise
  const length = Math.floor(e.ctx.sampleRate)
  const buffer = e.ctx.createBuffer(1, length, e.ctx.sampleRate)
  const data = buffer.getChannelData(0)
  const rng = mulberry32(0x1234abcd)
  for (let i = 0; i < length; i += 1) data[i] = rng() * 2 - 1
  noise = buffer
  return buffer
}

/* ------------------------------------------------------------------ */
/* Voice helpers                                                       */
/* ------------------------------------------------------------------ */

type VoiceOpts = {
  hz: number
  /** Seconds from now. */
  at?: number
  attack: number
  release: number
  gain: number
  type?: OscillatorType
  detune?: number
  lp?: number
  hp?: number
  /** 0..1 — how much of the voice goes through the room. */
  send?: number
  /** Exponential glide over `glide` seconds. */
  glideTo?: number
  glide?: number
}

function tone(e: Engine, opts: VoiceOpts): void {
  if (activeVoices >= MAX_VOICES) return
  const ctx = e.ctx
  const t0 = ctx.currentTime + (opts.at ?? 0)
  const release = Math.max(opts.release, 0.04)
  const osc = ctx.createOscillator()
  osc.type = opts.type ?? "sine"
  osc.frequency.setValueAtTime(opts.hz, t0)
  if (opts.glideTo) {
    osc.frequency.exponentialRampToValueAtTime(
      opts.glideTo,
      t0 + Math.max(opts.glide ?? 0.12, 0.02)
    )
  }
  if (opts.detune) osc.detune.value = opts.detune
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(opts.gain, 0.0003),
    t0 + Math.max(opts.attack, 0.003)
  )
  gain.gain.setTargetAtTime(0.0001, t0 + opts.attack, release / 3)
  let source: AudioNode = osc
  if (opts.lp || opts.hp) {
    const filter = ctx.createBiquadFilter()
    if (opts.lp) {
      filter.type = "lowpass"
      filter.frequency.value = opts.lp
      filter.Q.value = 0.7
    } else {
      filter.type = "highpass"
      filter.frequency.value = opts.hp ?? 4000
    }
    source.connect(filter)
    source = filter
  }
  source.connect(gain)
  gain.connect(e.dry)
  if (opts.send) {
    const send = ctx.createGain()
    send.gain.value = opts.send
    gain.connect(send)
    send.connect(space(e))
  }
  activeVoices += 1
  osc.onended = () => {
    activeVoices -= 1
  }
  osc.start(t0)
  osc.stop(t0 + opts.attack + release + 0.2)
}

/** Filtered noise: whooshes, breaths, sparkles. */
function noiseSweep(
  e: Engine,
  opts: {
    from: number
    to: number
    at?: number
    dur: number
    gain: number
    type?: BiquadFilterType
    q?: number
    hp?: number
    send?: number
  }
): void {
  if (activeVoices >= MAX_VOICES) return
  const ctx = e.ctx
  const t0 = ctx.currentTime + (opts.at ?? 0)
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(e)
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = opts.type ?? "bandpass"
  filter.Q.value = opts.q ?? 1.1
  filter.frequency.setValueAtTime(opts.from, t0)
  filter.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(opts.gain, 0.0003),
    t0 + opts.dur * 0.4
  )
  gain.gain.setTargetAtTime(0.0001, t0 + opts.dur * 0.4, opts.dur / 3)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(e.dry)
  if (opts.send) {
    const send = ctx.createGain()
    send.gain.value = opts.send
    gain.connect(send)
    send.connect(space(e))
  }
  activeVoices += 1
  source.onended = () => {
    activeVoices -= 1
  }
  source.start(t0)
  source.stop(t0 + opts.dur + 0.4)
}

/** Two-operator FM bell: the bright, money-coded timbre. */
function bell(
  e: Engine,
  opts: {
    hz: number
    ratio: number
    at?: number
    release: number
    gain: number
    send?: number
  }
): void {
  if (activeVoices >= MAX_VOICES) return
  const ctx = e.ctx
  const t0 = ctx.currentTime + (opts.at ?? 0)
  const release = Math.max(opts.release, 0.2)
  const carrier = ctx.createOscillator()
  carrier.type = "sine"
  carrier.frequency.value = opts.hz
  const mod = ctx.createOscillator()
  mod.type = "sine"
  mod.frequency.value = opts.hz * opts.ratio
  const modGain = ctx.createGain()
  modGain.gain.setValueAtTime(opts.hz * 1.4, t0)
  modGain.gain.setTargetAtTime(0.0001, t0, release / 4)
  mod.connect(modGain)
  modGain.connect(carrier.frequency)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(opts.gain, 0.0003),
    t0 + 0.004
  )
  gain.gain.setTargetAtTime(0.0001, t0 + 0.004, release / 3)
  carrier.connect(gain)
  gain.connect(e.dry)
  if (opts.send) {
    const send = ctx.createGain()
    send.gain.value = opts.send
    gain.connect(send)
    send.connect(space(e))
  }
  activeVoices += 2
  const done = () => {
    activeVoices -= 1
  }
  carrier.onended = done
  mod.onended = done
  carrier.start(t0)
  mod.start(t0)
  carrier.stop(t0 + release + 0.3)
  mod.stop(t0 + release + 0.3)
}

/* ------------------------------------------------------------------ */
/* Moods                                                               */
/* ------------------------------------------------------------------ */

const SCALES: number[][] = [
  [0, 2, 4, 7, 9], // major pentatonic — bright
  [0, 2, 3, 7, 8], // hirajoshi — contemplative
  [0, 3, 5, 7, 10], // minor pentatonic — cool
  [0, 2, 5, 7, 9], // insen-like — airy
]

function schedule(mood: SoundMood, e: Engine, rng: () => number): void {
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(rng() * items.length)]
  const between = (min: number, max: number) => min + rng() * (max - min)
  const scale = pick(SCALES)
  const degree = (steps: number): number => {
    const octaves = Math.floor(steps / scale.length)
    const index = ((steps % scale.length) + scale.length) % scale.length
    return scale[index] + 12 * octaves
  }
  const hz = (root: number, semitones: number) =>
    root * Math.pow(2, semitones / 12)
  const detune = () => between(-22, 22)

  switch (mood) {
    case "tap": {
      // Quiet neutral blip. The whole interface "has grain" without
      // ever demanding attention.
      const root = between(494, 554)
      tone(e, {
        hz: hz(root, degree(Math.floor(rng() * 3))),
        attack: 0.004,
        release: between(0.1, 0.15),
        gain: between(0.15, 0.19),
        type: "triangle",
        detune: detune(),
        lp: 3400,
      })
      break
    }
    case "launch": {
      // A breath out: filtered noise sweeping up under an ascending
      // pair — confidence before the work even starts.
      const root = between(392, 466)
      const step = Math.floor(rng() * 2)
      noiseSweep(e, {
        from: between(300, 380),
        to: between(1500, 1900),
        dur: 0.3,
        gain: 0.07,
        send: 0.2,
      })
      tone(e, {
        hz: hz(root, degree(step)),
        at: 0.02,
        attack: 0.01,
        release: 0.3,
        gain: 0.15,
        detune: detune(),
        send: 0.25,
      })
      tone(e, {
        hz: hz(root, degree(step + 2)),
        at: 0.12,
        attack: 0.012,
        release: 0.4,
        gain: 0.17,
        type: "triangle",
        detune: detune(),
        send: 0.3,
      })
      break
    }
    case "reveal": {
      // Three ascending notes through the room: something has arrived.
      const root = between(523, 659)
      const step = Math.floor(rng() * 2)
      for (let i = 0; i < 3; i += 1) {
        tone(e, {
          hz: hz(root, degree(step + i * 2)),
          at: i * 0.075,
          attack: 0.008,
          release: 0.45,
          gain: 0.11 * (1 + i * 0.08),
          detune: detune(),
          send: 0.3,
        })
      }
      break
    }
    case "complete": {
      // A warm rolled chord with a top ping: the reward for waiting.
      const root = between(261, 329)
      const bright = rng() > 0.35
      const tones = [0, 2, 4, 7]
      tones.forEach((steps, i) => {
        tone(e, {
          hz: hz(root, degree(steps)),
          at: i * 0.05,
          attack: 0.02,
          release: 1.0,
          gain: 0.1,
          type: bright ? "triangle" : "sine",
          detune: detune(),
          send: 0.4,
        })
      })
      tone(e, {
        hz: hz(root, degree(9)),
        at: 0.26,
        attack: 0.015,
        release: 0.7,
        gain: 0.07,
        send: 0.45,
      })
      break
    }
    case "error": {
      // Descending, short, muffled: unmistakable, unharsh. The point
      // is information, not blame.
      const root = between(220, 277)
      const top = 2 + Math.floor(rng() * 2)
      tone(e, {
        hz: hz(root, degree(top)),
        attack: 0.005,
        release: 0.2,
        gain: 0.15,
        lp: 1200,
        send: 0.1,
      })
      tone(e, {
        hz: hz(root, degree(top - 1)),
        at: 0.1,
        attack: 0.006,
        release: 0.28,
        gain: 0.13,
        lp: 1000,
        send: 0.12,
      })
      break
    }
    case "spark": {
      // Micro-reward: a chirp up plus a breath of air.
      const from = between(660, 880)
      tone(e, {
        hz: from,
        glideTo: from * between(1.9, 2.4),
        glide: 0.13,
        attack: 0.004,
        release: 0.2,
        gain: 0.15,
        send: 0.3,
      })
      noiseSweep(e, {
        from: 5000,
        to: 7500,
        at: 0.04,
        dur: 0.09,
        gain: 0.03,
        hp: 4000,
      })
      break
    }
    case "reward": {
      // Money moments: two FM bells a fifth apart, bright at the
      // strike and long in the decay.
      const root = between(523, 784)
      const ratio = pick([1.41, 2.01, 2.76, 3.01])
      const send = 0.35
      bell(e, {
        hz: hz(root, 0),
        ratio,
        release: 0.7,
        gain: 0.13,
        send,
      })
      bell(e, {
        hz: hz(root, degree(2)),
        at: 0.13,
        ratio,
        release: 0.9,
        gain: 0.11,
        send,
      })
      break
    }
  }
}

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function playSound(mood: SoundMood, seed = ""): void {
  if (typeof window === "undefined") return
  if (!isSoundEnabled()) return
  // Background tabs stay silent; announce() brings the reward back
  // when the visitor returns.
  if (document.visibilityState === "hidden") return
  const now = performance.now()
  const gap = mood === "tap" ? MIN_GAP_MS : MOOD_GAP_MS
  if (now - (lastPlayedAt[mood] ?? Number.NEGATIVE_INFINITY) < gap) return
  const e = ensureEngine()
  if (!e) return
  if (e.ctx.state !== "running") {
    // Not yet inside a user gesture; the next real gesture resumes it.
    void e.ctx.resume().catch(() => {})
    return
  }
  lastPlayedAt[mood] = now
  const rng = mulberry32(hashSeed(`${userSalt()}|${mood}|${seed}`))
  schedule(mood, e, rng)
}
