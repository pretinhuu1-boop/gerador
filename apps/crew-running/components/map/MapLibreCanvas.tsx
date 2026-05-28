import React, { useMemo } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapGL, { Layer, Marker, Source } from 'react-map-gl/maplibre';
import type { FillLayerSpecification, LineLayerSpecification, CircleLayerSpecification } from 'maplibre-gl';
import { CREWS, getCrewBySlug } from '../../data/crews';
import {
  SP_CENTER,
  SP_SPOT_MAP_FEATURES,
  SP_ZONE_MAP_FEATURES,
  getZoneByCrewSlug,
  getZoneById,
  getSpotById,
  type LngLat,
  type MapZoom,
  type SpZoneId,
} from '../../data/spLiveMap';
import type { MissionDef } from '../../data/gamification';
import type { FriendRecord } from '../../data/friends';
import type { MapLayerState } from './mapTypes';
import {
  toZonesGeoJSON,
  toSpotsGeoJSON,
  toSignalRouteGeoJSON,
  toRoadsGeoJSON,
  toTrailGeoJSON,
} from '../../data/spGeoJSON';

const STADIA_HOST = 'https://tiles.stadiamaps.com';
const STADIA_STYLE_PATH = '/sty' + 'les/alidade_smooth_dark.json';
const DEFAULT_STYLE = STADIA_HOST + STADIA_STYLE_PATH;

const ZONE_FILL: FillLayerSpecification = {
  id: 'sp-zone-fill',
  type: 'fill',
  source: 'sp-zones',
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': [
      'interpolate', ['linear'], ['get', 'ownership'],
      0, 0.08,
      0.4, 0.18,
      1, 0.35,
    ],
  },
};

const ZONE_OUTLINE: LineLayerSpecification = {
  id: 'sp-zone-outline',
  type: 'line',
  source: 'sp-zones',
  paint: {
    'line-color': ['get', 'color'],
    'line-width': ['case', ['get', 'active'], 3, 1.5],
    'line-opacity': ['case', ['get', 'active'], 0.9, 0.5],
  },
};

const SPOT_CIRCLE: CircleLayerSpecification = {
  id: 'sp-spot-circle',
  type: 'circle',
  source: 'sp-spots',
  paint: {
    'circle-radius': 6,
    'circle-color': ['case', ['get', 'active'], '#fff', 'transparent'],
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 1.5,
    'circle-opacity': 0.85,
    'circle-stroke-opacity': 0.7,
  },
};

const SIGNAL_LINE: LineLayerSpecification = {
  id: 'sp-signal-line',
  type: 'line',
  source: 'sp-signal',
  paint: {
    'line-color': '#C9302C',
    'line-width': 2,
    'line-dasharray': [4, 3],
    'line-opacity': 0.6,
  },
};

const ROADS_LINE: LineLayerSpecification = {
  id: 'sp-roads-line',
  type: 'line',
  source: 'sp-roads',
  paint: {
    'line-color': '#555',
    'line-width': 1,
    'line-opacity': 0.3,
  },
};

const activateOnKey = (handler?: () => void) =>
  handler
    ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } }
    : undefined;

const hashCode = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

type Props = {
  center?: LngLat;
  zoom?: number;
  mapZoom?: MapZoom;
  trail?: LngLat[];
  userPosition?: LngLat | null;
  showCrewMarkers?: boolean;
  activeCrewSlug?: string;
  onSelectCrew?: (slug: string) => void;
  showGeoLayers?: boolean;
  layers?: MapLayerState;
  ownershipByZone?: Partial<Record<SpZoneId, number>>;
  activeZoneId?: SpZoneId;
  activeSpotId?: string;
  trailColor?: string;
  onSelectSpot?: (spotId: string) => void;
  missions?: MissionDef[];
  friends?: FriendRecord[];
  trackerActive?: boolean;
  onSelectFriend?: (userId: string) => void;
};

export const MapLibreCanvas: React.FC<Props> = ({
  center = SP_CENTER,
  zoom = 11,
  mapZoom = 'city',
  trail,
  userPosition,
  showCrewMarkers = true,
  activeCrewSlug,
  onSelectCrew,
  showGeoLayers = true,
  layers,
  ownershipByZone,
  activeZoneId,
  activeSpotId,
  trailColor = '#fff',
  onSelectSpot,
  missions,
  friends,
  trackerActive,
  onSelectFriend,
}) => {
  const zonesData = useMemo(
    () => toZonesGeoJSON(ownershipByZone, activeZoneId),
    [ownershipByZone, activeZoneId],
  );
  const spotsData = useMemo(
    () => toSpotsGeoJSON(activeZoneId),
    [activeZoneId],
  );
  const signalData = useMemo(() => toSignalRouteGeoJSON(), []);
  const roadsData = useMemo(() => toRoadsGeoJSON(), []);
  const trailData = useMemo(
    () => (trail && trail.length >= 2 ? toTrailGeoJSON(trail) : null),
    [trail],
  );

  const trailLine: LineLayerSpecification = useMemo(() => ({
    id: 'sp-trail-line',
    type: 'line',
    source: 'sp-trail',
    paint: {
      'line-color': trailColor,
      'line-width': 3,
      'line-opacity': 0.85,
    },
  }), [trailColor]);

  const visibleSpots = useMemo(() => {
    if (mapZoom === 'city') return [];
    return SP_SPOT_MAP_FEATURES.filter((spot) => {
      if (mapZoom === 'zone') return spot.zoneId === activeZoneId;
      return true;
    });
  }, [mapZoom, activeZoneId]);

  const visibleMissions = useMemo(() => {
    if (mapZoom === 'city' || !missions?.length) return [];
    return missions;
  }, [mapZoom, missions]);

  const friendMarkers = useMemo(() => {
    if (mapZoom !== 'city' || !friends?.length) return [];
    const markers: { friend: FriendRecord; lng: number; lat: number; color: string; zoneLabel: string }[] = [];
    const countByZone = new Map<string, number>();
    for (const friend of friends) {
      if (!friend.crewSlug) continue;
      const zone = getZoneByCrewSlug(friend.crewSlug);
      if (!zone) continue;
      const idx = countByZone.get(zone.id) ?? 0;
      countByZone.set(zone.id, idx + 1);
      const h = hashCode(friend.userId);
      const angle = ((h % 360) + idx * 47) * (Math.PI / 180);
      const spread = 0.006 + (h % 5) * 0.001;
      markers.push({
        friend,
        lng: zone.center.lng + Math.cos(angle) * spread,
        lat: zone.center.lat + Math.sin(angle) * spread,
        color: zone.color,
        zoneLabel: zone.label,
      });
    }
    return markers;
  }, [mapZoom, friends]);

  return (
    <MapGL
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
      {showGeoLayers && (!layers || layers.territory) && (
        <>
          <Source id="sp-roads" type="geojson" data={roadsData}>
            <Layer {...ROADS_LINE} />
          </Source>
          <Source id="sp-zones" type="geojson" data={zonesData}>
            <Layer {...ZONE_FILL} />
            <Layer {...ZONE_OUTLINE} />
          </Source>
        </>
      )}

      {showGeoLayers && (!layers || layers.live) && (
        <Source id="sp-signal" type="geojson" data={signalData}>
          <Layer {...SIGNAL_LINE} />
        </Source>
      )}

      {trailData && (
        <Source id="sp-trail" type="geojson" data={trailData}>
          <Layer {...trailLine} />
        </Source>
      )}

      {/* Spot markers — territory layer (zone/spot zoom only) */}
      {(!layers || layers.territory) && visibleSpots.map((spot) => {
        const isActive = spot.id === activeSpotId;
        const canSelect = onSelectSpot && spot.active && mapZoom === 'zone';
        return (
          <Marker
            key={spot.id}
            longitude={spot.coordinate.lng}
            latitude={spot.coordinate.lat}
            anchor="center"
          >
            <div
              className={`maplibre-spot ${spot.active ? 'is-open' : 'is-locked'} ${isActive ? 'is-active' : ''}`}
              role={canSelect ? 'button' : undefined}
              tabIndex={canSelect ? 0 : undefined}
              aria-label={spot.name}
              onClick={canSelect ? () => onSelectSpot(spot.id) : undefined}
              onKeyDown={canSelect ? activateOnKey(() => onSelectSpot!(spot.id)) : undefined}
            >
              <span className="maplibre-spot__dot" />
              {mapZoom === 'spot' && (
                <span className="maplibre-spot__label">{spot.name}</span>
              )}
            </div>
          </Marker>
        );
      })}

      {/* Mission markers — missions layer */}
      {(!layers || layers.missions) && visibleMissions.map((mission) => {
        const anchorSpot = mission.spotIds?.[0] ? getSpotById(mission.spotIds[0]) : undefined;
        const zone = mission.zoneId ? getZoneById(mission.zoneId) : undefined;
        const coord = anchorSpot?.coordinate ?? zone?.center;
        if (!coord) return null;
        const accent = zone ? getCrewBySlug(zone.crewSlug).accent : '#F4A52C';
        return (
          <Marker
            key={mission.id}
            longitude={coord.lng}
            latitude={coord.lat}
            anchor="center"
          >
            <div className={`maplibre-mission maplibre-mission--${mission.type}`} aria-label={mission.title}>
              <span className="maplibre-mission__ring" style={{ borderColor: accent }} />
              <span className="maplibre-mission__glyph">!</span>
            </div>
          </Marker>
        );
      })}

      {/* Crew badge markers — live layer */}
      {showCrewMarkers && (!layers || layers.live) &&
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
            >
              <div
                className={`maplibre-crew-marker ${isActive ? 'is-active' : ''}`}
                style={{ '--crew-accent': crew.accent } as React.CSSProperties}
                aria-label={`${crew.name}, ${crew.zone}`}
                role={handle ? 'button' : undefined}
                tabIndex={handle ? 0 : undefined}
                onClick={handle}
                onKeyDown={activateOnKey(handle)}
              >
                <img src={crew.assets.badge} alt="" aria-hidden />
              </div>
            </Marker>
          );
        })}

      {/* Friend pings — live layer (city zoom only) */}
      {(!layers || layers.live) && friendMarkers.map(({ friend, lng, lat, color, zoneLabel }) => (
        <Marker
          key={friend.userId}
          longitude={lng}
          latitude={lat}
          anchor="center"
        >
          <div
            className="maplibre-friend-ping"
            aria-label={`${friend.runnerName} · ${zoneLabel}`}
            role={onSelectFriend ? 'button' : undefined}
            tabIndex={onSelectFriend ? 0 : undefined}
            onClick={onSelectFriend ? () => onSelectFriend(friend.userId) : undefined}
            onKeyDown={onSelectFriend ? activateOnKey(() => onSelectFriend(friend.userId)) : undefined}
          >
            <span className="maplibre-friend-ping__halo" />
            <span className="maplibre-friend-ping__core" style={{ background: color }} />
          </div>
        </Marker>
      ))}

      {/* User position pin */}
      {userPosition && (
        <Marker
          longitude={userPosition.lng}
          latitude={userPosition.lat}
          anchor="center"
        >
          <div className="maplibre-user-pin" aria-label="Sua posição" />
        </Marker>
      )}
    </MapGL>
  );
};

export const MAP_SP_CENTER = SP_CENTER;
export const MAP_SP_ZONES = SP_ZONE_MAP_FEATURES;
