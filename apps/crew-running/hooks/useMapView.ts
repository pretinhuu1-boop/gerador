import { useCallback, useState } from 'react';
import type { MapView } from '../components/map/mapTypes';
import type { SpZoneId } from '../data/spLiveMap';

// Lightweight zoom-state hook for MapaCidade. Mirrors the L1/L2/L3
// hierarchy from MapStage but stays decoupled from the run controller
// — phase D layers RunController on top when variant=run.
export interface UseMapViewApi {
  view: MapView;
  setZone: (zoneId: SpZoneId) => void;
  setSpot: (spotId: string) => void;
  back: () => void;
  reset: () => void;
}

export const useMapView = (initial?: MapView): UseMapViewApi => {
  const [view, setView] = useState<MapView>(() => initial ?? { zoom: 'city' });

  const setZone = useCallback((zoneId: SpZoneId) => {
    setView({ zoom: 'zone', zoneId });
  }, []);

  const setSpot = useCallback((spotId: string) => {
    setView((prev) => ({ ...prev, zoom: 'spot', spotId }));
  }, []);

  const back = useCallback(() => {
    setView((prev) => {
      if (prev.zoom === 'spot') return { zoom: 'zone', zoneId: prev.zoneId };
      if (prev.zoom === 'zone') return { zoom: 'city' };
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setView({ zoom: 'city' });
  }, []);

  return { view, setZone, setSpot, back, reset };
};
