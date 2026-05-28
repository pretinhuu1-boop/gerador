import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MissionLayer } from '../MissionLayer';
import { SAMPLE_MISSIONS, type MissionDef } from '../../../data/gamification';
import type { ProjectionOpts } from '../../../data/spLiveMap';

const projection: ProjectionOpts = { width: 800, height: 700, padding: 40 };

const renderSvg = (children: React.ReactNode) =>
  render(<svg viewBox="0 0 800 700">{children}</svg>);

describe('MissionLayer', () => {
  it('M1: zoom=city renders nothing', () => {
    const { container } = renderSvg(
      <MissionLayer projection={projection} zoom="city" missions={SAMPLE_MISSIONS} />,
    );
    expect(container.querySelector('.map-mission-layer')).toBeNull();
  });

  it('M3: renders one sticker per mission that has an anchor coord', () => {
    const withAnchor = SAMPLE_MISSIONS.filter((m) => Boolean(m.zoneId) || (m.spotIds?.length ?? 0) > 0);
    const { container } = renderSvg(
      <MissionLayer projection={projection} zoom="zone" missions={withAnchor} />,
    );
    const stickers = container.querySelectorAll('.map-mission');
    expect(stickers.length).toBe(withAnchor.length);
    expect(stickers.length).toBeGreaterThan(0);
  });

  describe('M2: missing anchor coord (dev warning)', () => {
    const originalEnv = import.meta.env.DEV;
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
      (import.meta.env as { DEV: boolean }).DEV = originalEnv;
    });

    it('warns and skips a mission with no anchor zone or spot', () => {
      const orphan: MissionDef = {
        id: 'm-orphan',
        type: 'spot-hunt',
        title: 'Orphan',
        description: 'no anchor',
        rewardXp: 100,
        windowHours: 24,
      };
      const { container } = renderSvg(
        <MissionLayer projection={projection} zoom="zone" missions={[orphan]} />,
      );
      const stickers = container.querySelectorAll('.map-mission');
      expect(stickers.length).toBe(0);
      if (import.meta.env.DEV) {
        expect(warnSpy).toHaveBeenCalled();
      }
    });
  });
});
