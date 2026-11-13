/**
 * Procedural interface sound. No samples and no network: every cue is
 * synthesized from oscillators and filtered noise when it is heard.
 *
 * What makes it feel like one instrument rather than a box of beeps:
 *
 *  - One voice per visitor. A per-browser salt picks a key and a scale
 *    once, and every cue (taps, chords, bells, the canvas fields) plays
 *    inside it, so everything you hear belongs together and nobody
 *    else's interface sounds quite like yours.
 *  - Melodic memory. Taps walk the scale from the last note instead of
 *    jumping at random, so clicking around plays a little tune; after a
 *    pause the phrase starts again from home.
 *  - Space. Cues are panned to where they happened on screen, voices
 *    are doubled and spread slightly left and right, and everything
 *    runs through a soft saturator and a short dark room.
 *
 * The moods follow published guidance for UI sound: long releases and
 * rising contours cue comfort, short releases cue interruption, low
 * bright-less tones cue calm. Everything is quiet, throttled, and off
 * in background tabs.
 */

export type SoundMood =
  | "tap" // any click: one note of the running melody
  | "launch" // submitting a brief: a breath up and out
  | "reveal" // first results arriving: an ascending shimmer
  | "complete" // a run settling: a warm rolled chord
  | "error" // a soft descending fall: informative, not punishing
  | "spark" // micro-rewards: copy, star, toggle on
  | "reward" // money moments: credits, payment, unlock
  | "page" // moving to another page: a low air
  | "key" // typing in a box that asks for it: a tiny tick

export type PlayOptions = {
  /** Where it happened, -1 (left edge) to 1 (right edge). */
  pan?: number
}

const SOUND_STORAGE_KEY = "uba-sound"
const SALT_STORAGE_KEY = "uba-sonic-salt"
const GAPS: Partial<Record<SoundMood, number>> = { tap: 40, key: 28 }
/** Distinct moods may layer (tap → launch); identical ones coalesce
 *  (an explicitly played error and the toast's own error cue). */
const MOOD_GAP_MS = 250
const MAX_VOICES = 28
/** A tap more than this long after the last starts a new phrase. */
const PHRASE_MS = 3500

/* ------------------------------------------------------------------ */
/* Enabled store (hydrated from localStorage, subscribable for React)  */
/* ------------------------------------------------------------------ */

type Listener = () => void

const listeners = new Set<Listener>()
const activityListeners = new Set<Listener>()
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

/** Called every time something is actually heard (for level meters). */
export function subscribeActivity(listener: Listener): () => void {
  activityListeners.add(listener)
  return () => {
    activityListeners.delete(listener)
  }
}

function emitActivity(): void {
  activityListeners.forEach((listener) => listener())
}

/* ------------------------------------------------------------------ */
/* Seeding and the visitor's voice                                     */
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

let salt: string | null = null

function userSalt(): string {
  if (salt) return salt
  try {
    let stored = window.localStorage.getItem(SALT_STORAGE_KEY)
    if (!stored) {
      stored =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.localStorage.setItem(SALT_STORAGE_KEY, stored)
    }
    salt = stored
  } catch {
    // Private mode: a session-scoped salt.
    salt = `session-${Math.random().toString(36).slice(2)}`
  }
  return salt
}

const SCALES: number[][] = [
  [0, 2, 4, 7, 9], // major pentatonic: bright
  [0, 2, 3, 7, 8], // hirajoshi: contemplative
  [0, 3, 5, 7, 10], // minor pentatonic: cool
  [0, 2, 5, 7, 9], // insen-like: airy
  [0, 2, 4, 7, 11], // major with a seventh: dreamy
]

type Voice = { scale: number[]; key: number }
let voice: Voice | null = null

/** The visitor's key and scale, fixed for this browser. */
function identity(): Voice {
  if (voice) return voice
  const rng = mulberry32(hashSeed(`${userSalt()}|identity`))
  const scale = SCALES[Math.floor(rng() * SCALES.length)]
  // A key between A3 and E4; cues pick their octave from there.
  const key = 220 * Math.pow(2, Math.floor(rng() * 8) / 12)
  voice = { scale, key }
  return voice
}

/** Frequency of a scale step, `octave` times the visitor's key. */
function note(step: number, octave = 1): number {
  const { scale, key } = identity()
  const octaves = Math.floor(step / scale.length)
  const index = ((step % scale.length) + scale.length) % scale.length
  return key * octave * Math.pow(2, (scale[index] + 12 * octaves) / 12)
}

// The running melody taps walk along.
let tapStep = 2
let lastTapAt = Number.NEGATIVE_INFINITY

/* ------------------------------------------------------------------ */
/* Engine: context, master chain, shared room                          */
/* ------------------------------------------------------------------ */

type Engine = {
  ctx: AudioContext
  bus: GainNode
  master: GainNode
  convolver: ConvolverNode | null
  wet: GainNode
}

/** One cue's output: panned to where it happened. */
type Out = { e: Engine; node: AudioNode }

let engine: Engine | null = null
let noise: AudioBuffer | null = null
let activeVoices = 0
const lastPlayedAt: Record<string, number> = {}

/** Gentle tanh saturation: rounds off peaks and adds a little warmth. */
function softCurve(): Float32Array<ArrayBuffer> {
  const samples = 1024
  const curve = new Float32Array(samples)
  const drive = 1.8
  const norm = Math.tanh(drive)
  for (let i = 0; i < samples; i += 1) {
    const x = (i / (samples - 1)) * 2 - 1
    curve[i] = Math.tanh(drive * x) / norm
  }
  return curve
}

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
    // A soft top: the high end of every voice is rounded slightly so
    // nothing ever sounds like a system beep.
    const tilt = ctx.createBiquadFilter()
    tilt.type = "highshelf"
    tilt.frequency.value = 5200
    tilt.gain.value = -4
    tilt.connect(master)
    const shaper = ctx.createWaveShaper()
    shaper.curve = softCurve()
    shaper.oversample = "2x"
    shaper.connect(tilt)
    const bus = ctx.createGain()
    bus.gain.value = 1.15
    bus.connect(shaper)
    const wet = ctx.createGain()
    wet.gain.value = 0.75
    wet.connect(master)
    engine = { ctx, bus, master, convolver: null, wet }
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

/** True when a sound played now would actually be heard. */
export function soundReady(): boolean {
  return (
    typeof window !== "undefined" &&
    isSoundEnabled() &&
    engine !== null &&
    engine.ctx.state === "running" &&
    document.visibilityState !== "hidden"
  )
}

function room(e: Engine): ConvolverNode {
  if (!e.convolver) {
    const convolver = e.ctx.createConvolver()
    convolver.buffer = impulseResponse(e.ctx)
    convolver.connect(e.wet)
    e.convolver = convolver
  }
  return e.convolver
}

/** A short, dark room: seeded noise decaying into silence, with the
 *  two channels decorrelated so the tail opens out in stereo. */
function impulseResponse(ctx: AudioContext): AudioBuffer {
  const seconds = 1.4
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const rng = mulberry32(0x5eed5eed ^ (length + channel * 7919))
    const data = buffer.getChannelData(channel)
    let smooth = 0
    for (let i = 0; i < length; i += 1) {
      const t = i / length
      const fadeIn = Math.min(1, i / 384)
      // A one-pole low-pass that closes over time: the tail darkens.
      const k = 0.55 - t * 0.4
      smooth += k * (rng() * 2 - 1 - smooth)
      data[i] = smooth * Math.pow(1 - t, 2.8) * fadeIn * 1.6
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

/** A panner for one cue, released once the cue has rung out. */
function output(e: Engine, pan = 0): Out {
  if (!pan || typeof e.ctx.createStereoPanner !== "function") {
    return { e, node: e.bus }
  }
  const panner = e.ctx.createStereoPanner()
  panner.pan.value = Math.max(-1, Math.min(1, pan)) * 0.7
  panner.connect(e.bus)
  window.setTimeout(() => panner.disconnect(), 4000)
  return { e, node: panner }
}

function send(out: Out, gain: AudioNode, amount?: number): void {
  if (!amount) return
  const node = out.e.ctx.createGain()
  node.gain.value = amount
  gain.connect(node)
  node.connect(room(out.e))
}

/* ------------------------------------------------------------------ */
/* Voice helpers                                                       */
/* ------------------------------------------------------------------ */

type ToneOpts = {
  hz: number
  /** Seconds from now. */
  at?: number
  attack: number
  release: number
  gain: number
  type?: OscillatorType
  lp?: number
  hp?: number
  /** 0..1: how much of the voice goes through the room. */
  send?: number
  /** Exponential glide over `glide` seconds. */
  glideTo?: number
  glide?: number
  /** Double the voice, detuned and spread left and right. */
  wide?: boolean
}

function tone(out: Out, opts: ToneOpts): void {
  const count = opts.wide ? 2 : 1
  if (activeVoices + count > MAX_VOICES) return
  const ctx = out.e.ctx
  const t0 = ctx.currentTime + (opts.at ?? 0)
  const release = Math.max(opts.release, 0.04)
  const end = t0 + opts.attack + release + 0.25

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(opts.gain, 0.0003),
    t0 + Math.max(opts.attack, 0.003)
  )
  gain.gain.setTargetAtTime(0.0001, t0 + opts.attack, release / 3)

  let into: AudioNode = gain
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
    filter.connect(gain)
    into = filter
  }

  const spread = [
    { cents: opts.wide ? -6 : 0, pan: opts.wide ? -0.35 : 0 },
    { cents: 6, pan: 0.35 },
  ].slice(0, count)
  for (const { cents, pan } of spread) {
    const osc = ctx.createOscillator()
    osc.type = opts.type ?? "sine"
    osc.frequency.setValueAtTime(opts.hz, t0)
    if (opts.glideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        opts.glideTo,
        t0 + Math.max(opts.glide ?? 0.12, 0.02)
      )
    }
    osc.detune.value = cents
    const level = ctx.createGain()
    level.gain.value = opts.wide ? 0.6 : 1
    osc.connect(level)
    if (pan && typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner()
      panner.pan.value = pan
      level.connect(panner)
      panner.connect(into)
    } else {
      level.connect(into)
    }
    activeVoices += 1
    osc.onended = () => {
      activeVoices -= 1
    }
    osc.start(t0)
    osc.stop(end)
  }
  gain.connect(out.node)
  send(out, gain, opts.send)
}

/** Filtered noise: whooshes, breaths, ticks, sparkles. */
function noiseSweep(
  out: Out,
  opts: {
    from: number
    to: number
    at?: number
    dur: number
    gain: number
    type?: BiquadFilterType
    q?: number
    send?: number
  }
): void {
  if (activeVoices >= MAX_VOICES) return
  const ctx = out.e.ctx
  const t0 = ctx.currentTime + (opts.at ?? 0)
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(out.e)
  source.loop = true
  // Start somewhere different in the buffer each time, so repeated
  // ticks don't sound identical.
  const offset = Math.random() * 0.9
  const filter = ctx.createBiquadFilter()
  filter.type = opts.type ?? "bandpass"
  filter.Q.value = opts.q ?? 1.1
  filter.frequency.setValueAtTime(opts.from, t0)
  filter.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(
    Math.max(opts.gain, 0.0003),
    t0 + Math.max(opts.dur * 0.4, 0.002)
  )
  gain.gain.setTargetAtTime(0.0001, t0 + opts.dur * 0.4, opts.dur / 3)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(out.node)
  send(out, gain, opts.send)
  activeVoices += 1
  source.onended = () => {
    activeVoices -= 1
  }
  source.start(t0, offset)
  source.stop(t0 + opts.dur + 0.4)
}

/** Two-operator FM bell: the bright, money-coded timbre. */
function bell(
  out: Out,
  opts: {
    hz: number
    ratio: number
    at?: number
    release: number
    gain: number
    send?: number
  }
): void {
  if (activeVoices + 2 > MAX_VOICES) return
  const ctx = out.e.ctx
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
  gain.connect(out.node)
  send(out, gain, opts.send)
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

function schedule(mood: SoundMood, out: Out, rng: () => number): void {
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(rng() * items.length)]
  const between = (min: number, max: number) => min + rng() * (max - min)

  switch (mood) {
    case "tap": {
      // One note of a running tune: each tap steps along the scale
      // from the last, so a few clicks make a phrase. The control's
      // own words decide which way the step goes.
      const now = performance.now()
      if (now - lastTapAt > PHRASE_MS) {
        tapStep = pick([0, 2, 2, 4])
      } else {
        tapStep += pick([-2, -1, 1, 1, 2])
        if (tapStep > 5) tapStep = 3 + (tapStep - 5)
        if (tapStep < -2) tapStep = 0
      }
      lastTapAt = now
      tone(out, {
        hz: note(tapStep, 2),
        attack: 0.004,
        release: between(0.12, 0.17),
        gain: between(0.13, 0.16),
        type: "triangle",
        lp: 3000,
        send: 0.12,
        wide: true,
      })
      break
    }
    case "launch": {
      // A breath out: filtered noise sweeping up under a rising
      // three-note figure: confidence before the work even starts.
      noiseSweep(out, {
        from: between(300, 380),
        to: between(1500, 1900),
        dur: 0.32,
        gain: 0.06,
        send: 0.25,
      })
      ;[0, 2, 4].forEach((step, i) => {
        tone(out, {
          hz: note(step, 2),
          at: 0.02 + i * 0.085,
          attack: 0.01,
          release: 0.32 + i * 0.1,
          gain: 0.13 - i * 0.015,
          type: i === 1 ? "triangle" : "sine",
          send: 0.3,
          wide: true,
        })
      })
      break
    }
    case "reveal": {
      // Three ascending notes through the room: something has arrived.
      const step = Math.floor(rng() * 2)
      for (let i = 0; i < 3; i += 1) {
        tone(out, {
          hz: note(step + i * 2, 2),
          at: i * 0.075,
          attack: 0.008,
          release: 0.5,
          gain: 0.1 * (1 + i * 0.08),
          send: 0.35,
          wide: i === 2,
        })
      }
      break
    }
    case "complete": {
      // A warm rolled chord with a top ping: the reward for waiting.
      const bright = rng() > 0.35
      ;[0, 2, 4, 7].forEach((step, i) => {
        tone(out, {
          hz: note(step),
          at: i * 0.05,
          attack: 0.02,
          release: 1.1,
          gain: 0.09,
          type: bright ? "triangle" : "sine",
          lp: 2600,
          send: 0.4,
          wide: true,
        })
      })
      tone(out, {
        hz: note(9),
        at: 0.26,
        attack: 0.015,
        release: 0.8,
        gain: 0.06,
        send: 0.5,
      })
      break
    }
    case "error": {
      // Descending, short, muffled: unmistakable, unharsh. The point
      // is information, not blame.
      const top = 2 + Math.floor(rng() * 2)
      tone(out, {
        hz: note(top),
        attack: 0.005,
        release: 0.2,
        gain: 0.15,
        lp: 1200,
        send: 0.1,
      })
      tone(out, {
        hz: note(top - 1),
        at: 0.1,
        attack: 0.006,
        release: 0.3,
        gain: 0.13,
        lp: 1000,
        send: 0.12,
      })
      break
    }
    case "spark": {
      // Micro-reward: a chirp up from the current note of the tune,
      // plus a breath of air.
      const from = note(tapStep + 2, 2)
      tone(out, {
        hz: from,
        glideTo: from * 2,
        glide: 0.13,
        attack: 0.004,
        release: 0.22,
        gain: 0.13,
        send: 0.3,
        wide: true,
      })
      tone(out, {
        hz: note(tapStep + 4, 4),
        at: 0.09,
        attack: 0.004,
        release: 0.3,
        gain: 0.035,
        send: 0.5,
      })
      noiseSweep(out, {
        from: 5000,
        to: 7500,
        at: 0.04,
        dur: 0.09,
        gain: 0.025,
        type: "highpass",
      })
      break
    }
    case "reward": {
      // Money moments: two FM bells a step apart, bright at the
      // strike and long in the decay, over a soft low root.
      const ratio = pick([1.41, 2.01, 2.76, 3.01])
      bell(out, { hz: note(0, 2), ratio, release: 0.8, gain: 0.12, send: 0.35 })
      bell(out, {
        hz: note(2, 2),
        at: 0.13,
        ratio,
        release: 1.0,
        gain: 0.1,
        send: 0.4,
      })
      tone(out, {
        hz: note(0, 0.5),
        attack: 0.03,
        release: 0.9,
        gain: 0.06,
        send: 0.2,
      })
      break
    }
    case "page": {
      // A low air moving past, with the home note under it: the
      // interface turning a page, not announcing one.
      noiseSweep(out, {
        from: between(900, 1100),
        to: between(240, 300),
        dur: 0.38,
        gain: 0.03,
        type: "lowpass",
        q: 0.6,
        send: 0.3,
      })
      tone(out, {
        hz: note(0, 0.5),
        at: 0.04,
        attack: 0.05,
        release: 0.5,
        gain: 0.045,
        send: 0.35,
        wide: true,
      })
      break
    }
    case "key": {
      // A dry tick, a little different every time.
      noiseSweep(out, {
        from: between(2600, 3800),
        to: between(1800, 2400),
        dur: 0.025,
        gain: 0.03,
        q: 2.4,
      })
      tone(out, {
        hz: note(Math.floor(rng() * 5), 4),
        attack: 0.002,
        release: 0.045,
        gain: 0.012,
      })
      break
    }
  }
}

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function playSound(
  mood: SoundMood,
  seed = "",
  options: PlayOptions = {}
): void {
  if (typeof window === "undefined") return
  if (!isSoundEnabled()) return
  // Background tabs stay silent; announce() brings the reward back
  // when the visitor returns.
  if (document.visibilityState === "hidden") return
  const now = performance.now()
  const gap = GAPS[mood] ?? MOOD_GAP_MS
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
  schedule(mood, output(e, options.pan), rng)
  if (mood !== "key") emitActivity()
}

const recentNotes: number[] = []

/**
 * A single note in the visitor's key, for the canvas fields: a name
 * flashing free or taken, a dot being claimed. Never more than a few
 * in any short stretch, so a wave across a field is a ripple of notes
 * rather than a wall of them. Silent until the visitor has interacted.
 */
export function playNote(opts: {
  /** Scale step from the visitor's home note. */
  step: number
  pan?: number
  /** 0..1 relative loudness. */
  level?: number
  /** Bright (a good outcome) or muted (a bad one). */
  bright?: boolean
  /** Octave multiple of the key; 2 by default. */
  octave?: number
}): void {
  if (!soundReady() || !engine) return
  const now = performance.now()
  while (recentNotes.length && now - recentNotes[0] > 240) recentNotes.shift()
  if (recentNotes.length >= 4) return
  if (recentNotes.length && now - recentNotes[recentNotes.length - 1] < 45)
    return
  recentNotes.push(now)
  const out = output(engine, opts.pan)
  const level = Math.max(0, Math.min(1, opts.level ?? 1))
  if (opts.bright === false) {
    tone(out, {
      hz: note(opts.step, (opts.octave ?? 2) / 2),
      attack: 0.004,
      release: 0.16,
      gain: 0.09 * level,
      lp: 900,
      send: 0.15,
    })
  } else {
    tone(out, {
      hz: note(opts.step, opts.octave ?? 2),
      attack: 0.003,
      release: 0.38,
      gain: 0.075 * level,
      type: "triangle",
      lp: 2800,
      send: 0.35,
      wide: true,
    })
  }
  emitActivity()
}
