import { decayInk } from './gamification';
import type { SpZoneId } from './spLiveMap';

// Fractional days elapsed between two epoch timestamps. Negative gaps
// (clock skew or future-stored timestamps) clamp to 0 so we never amplify
// ink by applying a negative exponent.
const daysBetween = (fromMs: number, toMs: number): number => {
  const diffMs = toMs - fromMs;
  if (diffMs <= 0) return 0;
  return diffMs / 86_400_000;
};

// Returns a fresh inkPerZone map with each zone's ink scaled by the decay
// curve from gamification.ts (geometric decay at INK_DECAY_PER_DAY rate).
// Undefined zones in the input map stay undefined in the output — we only
// touch keys the runner actually has ink in.
export const applyInkDecay = (
  inkPerZone: Partial<Record<SpZoneId, number>>,
  lastUpdatedAt: number,
  now: number,
): Partial<Record<SpZoneId, number>> => {
  const days = daysBetween(lastUpdatedAt, now);
  if (days === 0) return { ...inkPerZone };
  const out: Partial<Record<SpZoneId, number>> = {};
  for (const key of Object.keys(inkPerZone) as SpZoneId[]) {
    const value = inkPerZone[key];
    if (value === undefined) continue;
    out[key] = decayInk(value, days);
  }
  return out;
};
