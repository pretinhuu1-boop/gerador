import { CREWS } from '../data/crews';
import { RUNNER_TYPES, type RunnerTypeId } from '../data/runnerTypes';

export type SfxId =
  | 'tap'
  | 'tap-alt'
  | 'nav-slab'
  | 'lock-on'
  | 'randomize-roll'
  | 'photo-shutter'
  | 'remove-x'
  | 'equip-snap'
  | 'stamp-save'
  | 'error-buzz'
  | 'skip-cut'
  | 'hover-tick';

export type AmbientId =
  | 'boot-cold'
  | 'title-pulse'
  | 'city-signal'
  | 'hq-room'
  | 'locker-room'
  | 'guided-attention'
  | 'saved-stamp-wash';

export type VoiceCue =
  | 'boot/cidade-ouviu'
  | 'boot/sinal-ativo'
  | 'guided/step-0'
  | 'guided/step-1'
  | 'guided/step-2'
  | 'guided/step-3'
  | 'saved/cidade-pronta';

export type CrewSlug = (typeof CREWS)[number]['slug'];

const SFX_PATHS: Record<SfxId, string> = {
  tap: '/audio/ui/ui-tap.mp3',
  'tap-alt': '/audio/ui/ui-tap-alt.mp3',
  'nav-slab': '/audio/ui/ui-nav-slab.mp3',
  'lock-on': '/audio/ui/ui-lock-on.mp3',
  'randomize-roll': '/audio/ui/ui-randomize-roll.mp3',
  'photo-shutter': '/audio/ui/ui-photo-shutter.mp3',
  'remove-x': '/audio/ui/ui-remove-x.mp3',
  'equip-snap': '/audio/ui/ui-equip-snap.mp3',
  'stamp-save': '/audio/ui/ui-stamp-save.mp3',
  'error-buzz': '/audio/ui/ui-error-buzz.mp3',
  'skip-cut': '/audio/ui/ui-skip-cut.mp3',
  'hover-tick': '/audio/ui/ui-hover-tick.mp3',
};

const AMBIENT_PATHS: Record<AmbientId, string> = {
  'boot-cold': '/audio/ambient/amb-boot-cold.mp3',
  'title-pulse': '/audio/ambient/amb-title-pulse.mp3',
  'city-signal': '/audio/ambient/amb-city-signal.mp3',
  'hq-room': '/audio/ambient/amb-hq-room.mp3',
  'locker-room': '/audio/ambient/amb-locker-room.mp3',
  'guided-attention': '/audio/ambient/amb-guided-attention.mp3',
  'saved-stamp-wash': '/audio/ambient/amb-saved-stamp-wash.mp3',
};

const AMBIENT_NOLOOP = new Set<AmbientId>(['saved-stamp-wash']);

const VOICE_PATHS: Record<VoiceCue, string> = {
  'boot/cidade-ouviu': '/audio/voice/boot/voice-boot-cidade-ouviu.mp3',
  'boot/sinal-ativo': '/audio/voice/boot/voice-boot-sinal-ativo.mp3',
  'guided/step-0': '/audio/voice/guided/voice-guided-step-0.mp3',
  'guided/step-1': '/audio/voice/guided/voice-guided-step-1.mp3',
  'guided/step-2': '/audio/voice/guided/voice-guided-step-2.mp3',
  'guided/step-3': '/audio/voice/guided/voice-guided-step-3.mp3',
  'saved/cidade-pronta': '/audio/voice/saved/voice-saved-cidade-pronta.mp3',
};

const CREW_MOTIF_PATHS: Record<CrewSlug, string> = Object.fromEntries(
  CREWS.map((c) => [c.slug, `/audio/music/crew/mus-crew-${c.slug}.mp3`]),
) as Record<CrewSlug, string>;

const CREW_INTRO_VOICE_PATHS: Record<CrewSlug, string> = Object.fromEntries(
  CREWS.map((c) => [c.slug, `/audio/voice/guided/voice-crew-${c.slug}.mp3`]),
) as Record<CrewSlug, string>;

const RUNNER_TYPE_STINGER_PATHS: Record<RunnerTypeId, string> = Object.fromEntries(
  RUNNER_TYPES.map((t) => [t.id, `/audio/music/runner-type/mus-rt-${t.id}.mp3`]),
) as Record<RunnerTypeId, string>;

const VOL = {
  sfx: 0.85,
  ambient: 0.45,
  ambientDucked: 0.22,
  motif: 0.55,
  motifDucked: 0.22,
  voice: 0.9,
} as const;

const FADE_MS = {
  crossfadeAmbient: 800,
  motifCrossfade: 400,
  duckIn: 200,
  duckOut: 400,
} as const;

const MUTE_STORAGE_KEY = 'crewAudioMuted';
const HOVER_TICK_RATE_LIMIT_MS = 200;

const canUseAudio = () => typeof window !== 'undefined' && typeof Audio !== 'undefined';

function readMuted(): boolean | null {
  if (!canUseAudio()) return null;
  try {
    const raw = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (raw == null) return null;
    return raw === 'true';
  } catch {
    return null;
  }
}

function writeMuted(value: boolean): void {
  if (!canUseAudio()) return;
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

type ListenerKind = 'mute';
type Listener = (muted: boolean) => void;

type LoopVoice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  buffer: AudioBuffer;
  pendingStop: number | null;
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Web Audio buffers (ambient + motifs)
  private ambientBuffers = new Map<AmbientId, AudioBuffer>();
  private ambientFetches = new Map<AmbientId, Promise<AudioBuffer | null>>();
  private motifBuffers = new Map<CrewSlug, AudioBuffer>();
  private motifFetches = new Map<CrewSlug, Promise<AudioBuffer | null>>();

  private currentAmbient: { id: AmbientId; voice: LoopVoice } | null = null;
  private currentMotif: { slug: CrewSlug; voice: LoopVoice } | null = null;

  // HTMLAudio (sfx + voice — one-shot, no loop)
  private sfxCache = new Map<SfxId, HTMLAudioElement[]>();
  private activeVoice: HTMLAudioElement | null = null;

  private muted: boolean;
  private unlocked = false;
  private lastHoverTickAt = 0;
  private listeners = new Map<ListenerKind, Set<Listener>>();

  constructor() {
    const stored = readMuted();
    if (stored != null) {
      this.muted = stored;
    } else {
      this.muted = prefersReducedMotion();
      if (this.muted) writeMuted(true);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    if (this.muted === muted) return;
    this.muted = muted;
    writeMuted(muted);
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.15);
    }
    if (muted && this.activeVoice) {
      this.activeVoice.pause();
      this.activeVoice = null;
    }
    this.notify('mute', muted);
  }

  onMuteChange(listener: Listener): () => void {
    if (!this.listeners.has('mute')) this.listeners.set('mute', new Set());
    this.listeners.get('mute')!.add(listener);
    return () => this.listeners.get('mute')?.delete(listener);
  }

  private notify(kind: ListenerKind, value: boolean): void {
    this.listeners.get(kind)?.forEach((fn) => {
      try {
        fn(value);
      } catch {
        // ignore
      }
    });
  }

  // Call from any user-gesture handler. Lazily creates AudioContext and resumes
  // it; required to satisfy browser autoplay policies (especially iOS Safari).
  unlock(): void {
    if (!canUseAudio()) return;
    this.ensureCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    if (this.unlocked) return;
    this.unlocked = true;
    // If an ambient was queued before unlock, start it now.
    if (this.currentAmbient && this.currentAmbient.voice.source.context.state === 'suspended') {
      void this.ctx?.resume();
    }
  }

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (!canUseAudio()) return null;
    const Ctor: typeof AudioContext | undefined =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  }

  // ---------- SFX (HTMLAudio pool) ----------

  playSfx(id: SfxId): void {
    if (this.muted || !canUseAudio()) return;
    if (id === 'hover-tick') {
      const now = performance.now();
      if (now - this.lastHoverTickAt < HOVER_TICK_RATE_LIMIT_MS) return;
      this.lastHoverTickAt = now;
    }
    const effectiveId: SfxId = id === 'tap' && Math.random() < 0.5 ? 'tap-alt' : id;
    const el = this.acquireSfxElement(effectiveId);
    if (!el) return;
    el.currentTime = 0;
    el.volume = VOL.sfx;
    void el.play().catch(() => {});
  }

  private acquireSfxElement(id: SfxId): HTMLAudioElement | null {
    const path = SFX_PATHS[id];
    if (!path) return null;
    const pool = this.sfxCache.get(id) ?? [];
    const free = pool.find((el) => el.paused || el.ended);
    if (free) return free;
    if (pool.length < 4) {
      const fresh = new Audio(path);
      fresh.preload = 'auto';
      pool.push(fresh);
      this.sfxCache.set(id, pool);
      return fresh;
    }
    return pool[0];
  }

  preloadSfx(ids: SfxId[]): void {
    if (!canUseAudio()) return;
    for (const id of ids) this.acquireSfxElement(id);
  }

  playRunnerTypeStinger(typeId: RunnerTypeId): void {
    if (this.muted || !canUseAudio()) return;
    const path = RUNNER_TYPE_STINGER_PATHS[typeId];
    if (!path) return;
    const el = new Audio(path);
    el.volume = VOL.sfx;
    void el.play().catch(() => {});
  }

  // ---------- Web Audio buffer loader ----------

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    const ctx = this.ensureCtx();
    if (!ctx) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      return await ctx.decodeAudioData(arr);
    } catch {
      return null;
    }
  }

  private async getAmbientBuffer(id: AmbientId): Promise<AudioBuffer | null> {
    const cached = this.ambientBuffers.get(id);
    if (cached) return cached;
    let pending = this.ambientFetches.get(id);
    if (!pending) {
      pending = this.loadBuffer(AMBIENT_PATHS[id]).then((buf) => {
        if (buf) this.ambientBuffers.set(id, buf);
        this.ambientFetches.delete(id);
        return buf;
      });
      this.ambientFetches.set(id, pending);
    }
    return pending;
  }

  private async getMotifBuffer(slug: CrewSlug): Promise<AudioBuffer | null> {
    const cached = this.motifBuffers.get(slug);
    if (cached) return cached;
    let pending = this.motifFetches.get(slug);
    if (!pending) {
      pending = this.loadBuffer(CREW_MOTIF_PATHS[slug]).then((buf) => {
        if (buf) this.motifBuffers.set(slug, buf);
        this.motifFetches.delete(slug);
        return buf;
      });
      this.motifFetches.set(slug, pending);
    }
    return pending;
  }

  private startLoopVoice(
    buffer: AudioBuffer,
    targetVol: number,
    fadeMs: number,
    loop: boolean,
  ): LoopVoice | null {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return null;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(targetVol, now + fadeMs / 1000);
    source.connect(gain).connect(this.masterGain);
    source.start(now);
    return { source, gain, buffer, pendingStop: null };
  }

  private fadeOutLoopVoice(voice: LoopVoice, fadeMs: number): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
    try {
      voice.source.stop(now + fadeMs / 1000 + 0.05);
    } catch {
      // already stopped
    }
  }

  private rampGain(gain: GainNode, target: number, fadeMs: number): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + fadeMs / 1000);
  }

  // ---------- Ambient (looped via Web Audio = seamless) ----------

  async crossfadeAmbient(id: AmbientId, durationMs = FADE_MS.crossfadeAmbient): Promise<void> {
    if (!canUseAudio()) return;
    if (this.currentAmbient?.id === id) return;

    const buffer = await this.getAmbientBuffer(id);
    if (!buffer) return;
    // Race: another crossfade may have superseded us while awaiting buffer.
    if (this.currentAmbient?.id === id) return;

    const prev = this.currentAmbient;
    const loop = !AMBIENT_NOLOOP.has(id);
    const voice = this.startLoopVoice(buffer, VOL.ambient, durationMs, loop);
    if (!voice) return;

    this.currentAmbient = { id, voice };

    if (!loop) {
      voice.source.onended = () => {
        if (this.currentAmbient?.voice === voice) this.currentAmbient = null;
      };
    }

    if (prev) this.fadeOutLoopVoice(prev.voice, durationMs);
  }

  // ---------- Crew motif (looped via Web Audio = seamless) ----------

  async layerCrewMotif(slug: CrewSlug, durationMs = FADE_MS.motifCrossfade): Promise<void> {
    if (!canUseAudio()) return;
    if (this.currentMotif?.slug === slug) return;

    const buffer = await this.getMotifBuffer(slug);
    if (!buffer) return;
    if (this.currentMotif?.slug === slug) return;

    const prev = this.currentMotif;
    const voice = this.startLoopVoice(buffer, VOL.motif, durationMs, true);
    if (!voice) return;

    this.currentMotif = { slug, voice };

    if (prev) this.fadeOutLoopVoice(prev.voice, durationMs);
  }

  stopCrewMotif(durationMs = FADE_MS.motifCrossfade): void {
    if (!this.currentMotif) return;
    this.fadeOutLoopVoice(this.currentMotif.voice, durationMs);
    this.currentMotif = null;
  }

  // ---------- Voice (HTMLAudio one-shot + duck Web Audio gains) ----------

  async playVoice(cue: VoiceCue | { src: string }): Promise<void> {
    if (this.muted || !canUseAudio()) return;
    const src = typeof cue === 'string' ? VOICE_PATHS[cue] : cue.src;
    if (!src) return;

    if (this.activeVoice) {
      this.activeVoice.pause();
      this.activeVoice = null;
    }

    const el = new Audio(src);
    el.volume = VOL.voice;
    this.activeVoice = el;

    if (this.currentAmbient) this.rampGain(this.currentAmbient.voice.gain, VOL.ambientDucked, FADE_MS.duckIn);
    if (this.currentMotif) this.rampGain(this.currentMotif.voice.gain, VOL.motifDucked, FADE_MS.duckIn);

    const restore = () => {
      if (this.currentAmbient) this.rampGain(this.currentAmbient.voice.gain, VOL.ambient, FADE_MS.duckOut);
      if (this.currentMotif) this.rampGain(this.currentMotif.voice.gain, VOL.motif, FADE_MS.duckOut);
      if (this.activeVoice === el) this.activeVoice = null;
    };

    el.addEventListener('ended', restore, { once: true });
    el.addEventListener('error', restore, { once: true });

    try {
      await el.play();
    } catch {
      restore();
    }
  }

  playCrewIntroVoice(slug: CrewSlug): void {
    const src = CREW_INTRO_VOICE_PATHS[slug];
    if (!src) return;
    void this.playVoice({ src });
  }
}

export const audio = new AudioEngine();
