import React, { useMemo } from 'react';
import {
  polylineToPath,
  type ProjectionOpts,
} from '../../data/spLiveMap';
import type { TrackedPoint } from '../../services/runTracker';

interface Props {
  points: TrackedPoint[];
  projection: ProjectionOpts;
  color?: string;
}

interface Segment {
  key: string;
  points: TrackedPoint[];
}

// Splits the point stream into contiguous segments. Pause-resume marks an
// anchor on the previous segment's last point; the new segment starts fresh
// (no line is drawn across the pause gap). Each segment keys off its first
// point's timestamp so React reconciliation is stable even when prior
// segments grow.
const splitSegments = (points: TrackedPoint[]): Segment[] => {
  if (points.length === 0) return [];
  const segments: Segment[] = [{ key: `seg-${points[0].t}`, points: [] }];
  for (const point of points) {
    const current = segments[segments.length - 1];
    current.points.push(point);
    if (point.isResumeAnchor) {
      segments.push({ key: `seg-${point.t}-resume`, points: [] });
    }
  }
  return segments.filter((segment) => segment.points.length > 1);
};

export const TrailLayer: React.FC<Props> = ({ points, projection, color = '#f4a52c' }) => {
  const segments = useMemo(() => splitSegments(points), [points]);
  if (segments.length === 0) return null;
  return (
    <g className="map-trail-layer" aria-hidden>
      {segments.map((segment) => (
        <path
          key={segment.key}
          className="map-trail-segment"
          d={polylineToPath(segment.points, projection)}
          stroke={color}
          fill="none"
        />
      ))}
    </g>
  );
};
