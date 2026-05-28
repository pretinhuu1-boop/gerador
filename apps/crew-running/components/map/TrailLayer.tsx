import React, { useMemo } from 'react';
import {
  polylineToPath,
  type LngLat,
  type ProjectionOpts,
} from '../../data/spLiveMap';
import type { TrackedPoint } from '../../services/runTracker';

interface Props {
  points: TrackedPoint[];
  projection: ProjectionOpts;
  color?: string;
}

// Splits the point stream into contiguous segments. Pause-resume marks an
// anchor on the previous segment's last point; the new segment starts fresh
// (no line is drawn across the pause gap).
const splitSegments = (points: TrackedPoint[]): LngLat[][] => {
  if (points.length === 0) return [];
  const segments: LngLat[][] = [[]];
  for (const point of points) {
    const current = segments[segments.length - 1];
    current.push({ lng: point.lng, lat: point.lat });
    if (point.isResumeAnchor && current.length > 0) {
      segments.push([]);
    }
  }
  return segments.filter((segment) => segment.length > 1);
};

export const TrailLayer: React.FC<Props> = ({ points, projection, color = '#f4a52c' }) => {
  const segments = useMemo(() => splitSegments(points), [points]);
  if (segments.length === 0) return null;
  return (
    <g className="map-trail-layer" aria-hidden>
      {segments.map((segment, index) => (
        <path
          key={index}
          className="map-trail-segment"
          d={polylineToPath(segment, projection)}
          stroke={color}
          fill="none"
        />
      ))}
    </g>
  );
};
