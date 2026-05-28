import { useEffect, useState } from 'react';
import { SP_CENTER, type LngLat } from '../data/spLiveMap';
import { detectPosition, type GeoSource } from '../services/geoDetect';

export interface InitialPosition {
  center: LngLat;
  source: GeoSource;
  ready: boolean;
}

export const useInitialPosition = (): InitialPosition => {
  const [state, setState] = useState<InitialPosition>({
    center: SP_CENTER,
    source: 'fallback',
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    detectPosition()
      .then((result) => {
        if (!cancelled) {
          setState({ center: result.position, source: result.source, ready: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, ready: true }));
        }
      });
    return () => { cancelled = true; };
  }, []);

  return state;
};
