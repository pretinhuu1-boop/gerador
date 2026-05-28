import React from 'react';
import type { ProjectionOpts, SpZoneId } from '../../data/spLiveMap';
import { AsphaltLayer } from './layers/AsphaltLayer';
import { RoadsLayer } from './layers/RoadsLayer';
import { ZonesLayer } from './layers/ZonesLayer';
import { SpotsLayer } from './layers/SpotsLayer';
import type { MapaCidadeVariant } from './mapTypes';

// Phase A shell. The unified map component the vault blueprint
// (2026-05-28-mapa-cidade-gamificado-blueprint.md) collapses
// Sp3DMapBackground + LaunchCityMap + MapStage + StreetBackdrop into.
// This shell intentionally renders placeholders — phases B–E layer in
// asphalt/roads/zones/spots/pings/HUD/friends/parallax progressively.
//
// Variant axes:
//   menu    — home panel surface, light gamification
//   run     — fullscreen run controller
//   signal  — crew picker entry
//   ambient — decorative background, aria-hidden

type Props = {
  variant: MapaCidadeVariant;
  activeCrewSlug?: string;
  ownershipByZone?: Partial<Record<SpZoneId, number>>;
  onSelectCrew?: (slug: string) => void;
  onOpenRun?: () => void;
};

const VIEWBOX_W = 800;
const VIEWBOX_H = 700;
const PADDING = 40;

const PROJECTION: ProjectionOpts = {
  width: VIEWBOX_W,
  height: VIEWBOX_H,
  padding: PADDING,
};

export const MapaCidade: React.FC<Props> = ({
  variant,
  activeCrewSlug,
  ownershipByZone,
  // Destructured to lock the prop API now — phases C and D wire the
  // PingsLayer and the run-control entry points to these callbacks.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectCrew,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenRun,
}) => {
  const decorative = variant === 'ambient';
  const slug = activeCrewSlug ?? 'unset';

  return (
    <div
      className={`mapa-cidade mapa-cidade--${variant}`}
      role={decorative ? undefined : 'group'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'Mapa vivo da cidade'}
      data-variant={variant}
      data-active-crew={slug}
    >
      <div className="mapa-cidade__layers" role="presentation">
        <AsphaltLayer />
        <svg
          className="mapa-cidade__svg"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={decorative ? '' : 'Mapa de Sao Paulo'}
          aria-hidden={decorative ? true : undefined}
        >
          <RoadsLayer projection={PROJECTION} />
          <ZonesLayer projection={PROJECTION} ownershipByZone={ownershipByZone} />
          <SpotsLayer projection={PROJECTION} zoom="city" />
        </svg>
      </div>
      {/* Phase C will mount PingsLayer (interactive in menu/run/signal). */}
      {!decorative && <div className="mapa-cidade__pings" />}
      {/* Phase D will mount HudLayer + FriendsLayer + MissionsLayer for variant=run. */}
      {variant === 'run' && <div className="mapa-cidade__overlays" />}
    </div>
  );
};
