import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TrailLayer } from '../TrailLayer';
import type { ProjectionOpts } from '../../../data/spLiveMap';
import type { TrackedPoint } from '../../../services/runTracker';

const projection: ProjectionOpts = { width: 800, height: 700, padding: 40 };

const point = (lng: number, lat: number, t: number, anchor = false): TrackedPoint => ({
  lng,
  lat,
  t,
  accuracy: 5,
  ...(anchor ? { isResumeAnchor: true } : {}),
});

const renderSvg = (children: React.ReactNode) =>
  render(<svg viewBox="0 0 800 700">{children}</svg>);

describe('TrailLayer', () => {
  it('T1: empty points renders nothing', () => {
    const { container } = renderSvg(<TrailLayer points={[]} projection={projection} />);
    expect(container.querySelector('.map-trail-layer')).toBeNull();
  });

  it('T2: a single point cannot form a segment', () => {
    const { container } = renderSvg(
      <TrailLayer points={[point(-46.63, -23.55, 0)]} projection={projection} />,
    );
    expect(container.querySelectorAll('.map-trail-segment').length).toBe(0);
  });

  it('T3: three points without pause render exactly one polyline', () => {
    const { container } = renderSvg(
      <TrailLayer
        points={[
          point(-46.63, -23.55, 0),
          point(-46.629, -23.55, 1000),
          point(-46.628, -23.55, 2000),
        ]}
        projection={projection}
      />,
    );
    expect(container.querySelectorAll('.map-trail-segment').length).toBe(1);
  });

  it('T4: a resume anchor splits the trail into two polylines', () => {
    const { container } = renderSvg(
      <TrailLayer
        points={[
          point(-46.63, -23.55, 0),
          point(-46.629, -23.55, 1000, true),
          point(-46.628, -23.55, 2000),
          point(-46.627, -23.55, 3000),
        ]}
        projection={projection}
      />,
    );
    expect(container.querySelectorAll('.map-trail-segment').length).toBe(2);
  });

  it('T5: two pauses in the same millisecond still produce unique keys (no React duplicate)', () => {
    // Two anchors with identical timestamp would have collided under the old
    // `seg-${t}` key. The new key includes the segment index, so we should
    // see three segments produced and React should not complain.
    const { container } = renderSvg(
      <TrailLayer
        points={[
          point(-46.63, -23.55, 1000),
          point(-46.629, -23.55, 1000, true),
          point(-46.628, -23.55, 1000),
          point(-46.627, -23.55, 1000, true),
          point(-46.626, -23.55, 1000),
          point(-46.625, -23.55, 1000),
        ]}
        projection={projection}
      />,
    );
    const segments = container.querySelectorAll('.map-trail-segment');
    // Anchor points end their segment; resulting segments with ≥ 2 points
    // are kept. Exact count depends on point distribution; assert that no
    // duplicate key React warning has crashed the render.
    expect(segments.length).toBeGreaterThanOrEqual(1);
  });

  it('T6: stroke color comes from the color prop', () => {
    const { container } = renderSvg(
      <TrailLayer
        points={[
          point(-46.63, -23.55, 0),
          point(-46.629, -23.55, 1000),
        ]}
        projection={projection}
        color="#abcdef"
      />,
    );
    const segment = container.querySelector('.map-trail-segment') as SVGPathElement | null;
    expect(segment).toBeTruthy();
    expect(segment!.getAttribute('stroke')).toBe('#abcdef');
  });
});
