import { describe, expect, it, vi } from 'vitest';
import { isCameraAvailable, startQrScan } from './qrScan';

describe('startQrScan', () => {
  it('calls onError when canvas 2d context unavailable', async () => {
    const fakeCanvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
      tag === 'canvas' ? fakeCanvas : origCreate(tag),
    );

    const onResult = vi.fn();
    const onError = vi.fn();
    const fakeVideo = document.createElement('video');

    startQrScan(fakeVideo, onResult, onError);

    await new Promise<void>((r) => queueMicrotask(() => r()));
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].message).toBe('Canvas 2D context unavailable.');
    expect(onResult).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});

describe('isCameraAvailable', () => {
  it('returns false when mediaDevices is undefined', () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });
    expect(isCameraAvailable()).toBe(false);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: original,
    });
  });

  it('returns true when getUserMedia is a function', () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn() },
    });
    expect(isCameraAvailable()).toBe(true);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: original,
    });
  });
});
