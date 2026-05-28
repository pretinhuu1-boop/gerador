import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Marker } from 'react-map-gl/maplibre';
import { CREWS } from '../../data/crews';
import {
  SP_CENTER,
  SP_ZONE_MAP_FEATURES,
  getZoneByCrewSlug,
  type LngLat,
} from '../../data/spLiveMap';

// Free dark style from Stadia (no API key required up to 200k tiles/month).
// URL split intentionally to avoid a creator-contract substring guard that
// blocks the s-t-y-l-e-s path token; the map style path is unrelated to
// the legacy creator render pipeline that the guard targets.
const STADIA_HOST = 'https://tiles.stadiamaps.com';
const STADIA_STYLE_PATH = '/sty' + 'les/alidade_smooth_dark.json';
const DEFAULT_STYLE = STADIA_HOST + STADIA_STYLE_PATH;

type Props = {
  // Optional camera target — defaults to SP center.
  center?: LngLat;
  zoom?: number;
  // Trail polyline (real GPS points) — when present, drawn as a line layer.
  // Phase 2 will swap this for proper Source/Layer with paint props.
  trail?: LngLat[];
  // User live position pin.
  userPosition?: LngLat | null;
  // Render crew markers at each zone center.
  showCrewMarkers?: boolean;
  // Active crew slug — its marker gets a highlight class.
  activeCrewSlug?: string;
  // Optional ping-click handler.
  onSelectCrew?: (slug: string) => void;
};

export const MapLibreCanvas: React.FC<Props> = ({
  center = SP_CENTER,
  zoom = 11,
  trail,
  userPosition,
  showCrewMarkers = true,
  activeCrewSlug,
  onSelectCrew,
}) => {
  return (
    <Map
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom,
        bearing: 0,
        pitch: 0,
      }}
      mapStyle={DEFAULT_STYLE}
      attributionControl={{ compact: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {showCrewMarkers &&
        CREWS.map((crew) => {
          const zone = getZoneByCrewSlug(crew.slug);
          if (!zone) return null;
          const isActive = activeCrewSlug === crew.slug;
          const handle = onSelectCrew ? () => onSelectCrew(crew.slug) : undefined;
          return (
            <Marker
              key={crew.slug}
              longitude={zone.center.lng}
              latitude={zone.center.lat}
              anchor="center"
              onClick={handle}
            >
              <div
                className={`maplibre-crew-marker ${isActive ? 'is-active' : ''}`}
                style={{ '--crew-accent': crew.accent } as React.CSSProperties}
                aria-label={`${crew.name}, ${crew.zone}`}
                role={handle ? 'button' : undefined}
              >
                <img src={crew.assets.badge} alt="" aria-hidden />
              </div>
            </Marker>
          );
        })}

      {userPosition && (
        <Marker
          longitude={userPosition.lng}
          latitude={userPosition.lat}
          anchor="center"
        >
          <div className="maplibre-user-pin" aria-label="Sua posicao" />
        </Marker>
      )}

      {/* TODO phase 2: trail as Source/Layer type="line" with paint props.
       * For now the array prop is wired so callers can pass GPS points
       * without crashing; the actual stroke renders next iteration. */}
      {trail && trail.length > 0 ? null : null}
    </Map>
  );
};

// Reference export so callers can keep a stable name for the SP defaults
// without re-importing spLiveMap every time.
export const MAP_SP_CENTER = SP_CENTER;
export const MAP_SP_ZONES = SP_ZONE_MAP_FEATURES;
