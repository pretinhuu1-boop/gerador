import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectPosition } from './geoDetect';
import { SP_CENTER } from '../data/spLiveMap';

const installGeo = (impl: Partial<Geolocation>) => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: impl,
  });
};

const removeGeo = () => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: undefined,
  });
};

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  removeGeo();
});

describe('detectPosition', () => {
  it('returns GPS position when geolocation succeeds', async () => {
    installGeo({
      getCurrentPosition: (ok: PositionCallback) =>
        ok({
          coords: { latitude: -23.56, longitude: -46.64, accuracy: 10 },
          timestamp: Date.now(),
        } as GeolocationPosition),
    });
    const result = await detectPosition();
    expect(result.source).toBe('gps');
    expect(result.position.lat).toBeCloseTo(-23.56);
    expect(result.position.lng).toBeCloseTo(-46.64);
  });

  it('falls back to IP when GPS denied', async () => {
    installGeo({
      getCurrentPosition: (_ok: PositionCallback, err?: (e: GeolocationPositionError) => void) => {
        const error = new GeolocationPositionError();
        Object.defineProperties(error, {
          code: { value: 1 },
          message: { value: 'denied' },
        });
        err?.(error);
      },
    });
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ latitude: -23.55, longitude: -46.63 }), { status: 200 }),
    );
    const result = await detectPosition();
    expect(result.source).toBe('ip');
    expect(result.position.lat).toBeCloseTo(-23.55);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to SP_CENTER when both GPS and IP fail', async () => {
    removeGeo();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));
    const result = await detectPosition();
    expect(result.source).toBe('fallback');
    expect(result.position).toEqual(SP_CENTER);
  });

  it('falls back to SP_CENTER when IP returns bad shape', async () => {
    removeGeo();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ city: 'Sao Paulo' }), { status: 200 }),
    );
    const result = await detectPosition();
    expect(result.source).toBe('fallback');
    expect(result.position).toEqual(SP_CENTER);
  });
});
