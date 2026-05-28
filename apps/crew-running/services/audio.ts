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

// Volume targets per channel (matches LUFS-aware mix from brand bible §4)
const VOL = {
  sfx: 0.85,
  ambient: 0.45,
  ambientDucked: 0.22, // -6 dB-ish
  motif: 0.55,
  motifDucked: 0.22, // -8 dB-ish
  voice: 0.9,
} as const;

const FADE_MS = {
  crossfadeAmbient: 800,
  motifCrossfade: 400,
  duckIn: 200,
  duckOut: 400,
  wash: 50,
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type ListenerKind = 'mute';
type Listener = (muted: boolean) => void;

class AudioEngine {
  private sfxCache = new Map<SfxId, HTMLAudioElement[]>();
  private currentAmbient: { id: AmbientId; el: HTMLAudioElement } | null = null;
  private currentMotif: { slug: CrewSlug; el: HTMLAudioElement } | null = null;
  private activeVoice: HTMLAudioElement | null = null;
  private muted: boolean;
  private unlocked = false;
  private lastHoverTickAt = 0;
  private listeners = new Map<ListenerKind, Set<Listener>>();
  private rampHandles = new WeakMap<HTMLAudioElement, number>();

  private cancelRamp(el: HTMLAudioElement): void {
    const prior = this.rampHandles.get(el);
    if (prior != null) {
      window.clearInterval(prior);
      this.rampHandles.delete(el);
    }
  }

  private ramp(el: HTMLAudioElement, toValue: number, durationMs: number): void {
    this.cancelRamp(el);
    const startValue = el.volume;
    const startTime = performance.now();
    const handle = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startTime) / Math.max(1, durationMs));
      el.volume = clamp(startValue + (toValue - startValue) * t, 0, 1);
      if (t >= 1) {
        window.clearInterval(handle);
        this.rampHandles.delete(el);
        if (toValue === 0) el.pause();
      }
    }, 30);
    this.rampHandles.set(el, handle);
  }

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
    if (muted) {
      this.pauseAll();
    } else if (this.currentAmbient) {
      this.currentAmbient.el.volume = VOL.ambient;
      void this.currentAmbient.el.play().catch(() => {});
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
        // listener errors should not crash audio
      }
    });
  }

  // Call from any user-gesture handler once. Required to satisfy browser autoplay policies.
  unlock(): void {
    if (this.unlocked || !canUseAudio()) return;
    this.unlocked = true;
    if (this.currentAmbient && !this.muted) {
      void this.currentAmbient.el.play().catch(() => {});
    }
  }

  playSfx(id: SfxId): void {
    if (this.muted || !canUseAudio()) return;

    // Hover-tick rate limit
    if (id === 'hover-tick') {
      const now = performance.now();
      if (now - this.lastHoverTickAt < HOVER_TICK_RATE_LIMIT_MS) return;
      this.lastHoverTickAt = now;
    }

    // 50/50 alt for 'tap'
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
    // Reuse a finished element
    const free = pool.find((el) => el.paused || el.ended);
    if (free) return free;
    // Grow pool up to 4 concurrent voices
    if (pool.length < 4) {
      const fresh = new Audio(path);
      fresh.preload = 'auto';
      pool.push(fresh);
      this.sfxCache.set(id, pool);
      return fresh;
    }
    // Steal oldest
    return pool[0];
  }

  preloadSfx(ids: SfxId[]): void {
    if (!canUseAudio()) return;
    for (const id of ids) this.acquireSfxElement(id);
  }

  async crossfadeAmbient(id: AmbientId, durationMs = FADE_MS.crossfadeAmbient): Promise<void> {
    if (!canUseAudio()) return;
    if (this.currentAmbient?.id === id) return;

    const path = AMBIENT_PATHS[id];
    if (!path) return;

    const next = new Audio(path);
    next.loop = !AMBIENT_NOLOOP.has(id);
    next.preload = 'auto';
    next.volume = 0;

    const prev = this.currentAmbient;
    this.currentAmbient = { id, el: next };

    if (!this.muted) {
      try {
        await next.play();
        this.ramp(next, VOL.ambient, durationMs);
      } catch {
        // Autoplay blocked — will start when unlock() runs
      }
    }

    if (prev) this.ramp(prev.el, 0, durationMs);

    if (AMBIENT_NOLOOP.has(id)) {
      next.addEventListener(
        'ended',
        () => {
          if (this.currentAmbient?.el === next) this.currentAmbient = null;
        },
        { once: true },
      );
    }
  }

  layerCrewMotif(slug: CrewSlug): void {
    if (!canUseAudio()) return;
    if (this.currentMotif?.slug === slug) return;

    const path = CREW_MOTIF_PATHS[slug];
    if (!path) return;

    const next = new Audio(path);
    next.loop = true;
    next.preload = 'auto';
    next.volume = 0;

    const prev = this.currentMotif;
    this.currentMotif = { slug, el: next };

    if (!this.muted) {
      void next.play().catch(() => {});
      this.ramp(next, VOL.motif, FADE_MS.motifCrossfade);
    }

    if (prev) this.ramp(prev.el, 0, FADE_MS.motifCrossfade);
  }

  stopCrewMotif(): void {
    if (!this.currentMotif) return;
    this.ramp(this.currentMotif.el, 0, FADE_MS.motifCrossfade);
    this.currentMotif = null;
  }

  playRunnerTypeStinger(typeId: RunnerTypeId): void {
    if (this.muted || !canUseAudio()) return;
    const path = RUNNER_TYPE_STINGER_PATHS[typeId];
    if (!path) return;
    const el = new Audio(path);
    el.volume = VOL.sfx;
    void el.play().catch(() => {});
  }

  async playVoice(cue: VoiceCue | { src: string }): Promise<void> {
    if (this.muted || !canUseAudio()) return;
    const src = typeof cue === 'string' ? VOICE_PATHS[cue] : cue.src;
    if (!src) return;

    // Stop prior voice
    if (this.activeVoice) {
      this.activeVoice.pause();
      this.activeVoice = null;
    }

    const el = new Audio(src);
    el.volume = VOL.voice;
    this.activeVoice = el;

    // Duck ambient + motif
    if (this.currentAmbient) this.ramp(this.currentAmbient.el, VOL.ambientDucked, FADE_MS.duckIn);
    if (this.currentMotif) this.ramp(this.currentMotif.el, VOL.motifDucked, FADE_MS.duckIn);

    const restore = () => {
      if (this.currentAmbient && !this.muted) {
        this.ramp(this.currentAmbient.el, VOL.ambient, FADE_MS.duckOut);
      }
      if (this.currentMotif && !this.muted) {
        this.ramp(this.currentMotif.el, VOL.motif, FADE_MS.duckOut);
      }
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

  private pauseAll(): void {
    if (this.currentAmbient) {
      this.cancelRamp(this.currentAmbient.el);
      this.currentAmbient.el.pause();
    }
    if (this.currentMotif) {
      this.cancelRamp(this.currentMotif.el);
      this.currentMotif.el.pause();
    }
    if (this.activeVoice) {
      this.activeVoice.pause();
      this.activeVoice = null;
    }
  }
}

export const audio = new AudioEngine();
