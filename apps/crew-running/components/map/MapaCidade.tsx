import React from 'react';
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
  onSelectCrew?: (slug: string) => void;
  onOpenRun?: () => void;
};

export const MapaCidade: React.FC<Props> = ({ variant, activeCrewSlug }) => {
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
      {/* Phase B will mount AsphaltLayer + RoadsLayer + ZonesLayer + SpotsLayer. */}
      <div className="mapa-cidade__layers" aria-hidden />
      {/* Phase C will mount PingsLayer (interactive in menu/run/signal). */}
      {!decorative && <div className="mapa-cidade__pings" />}
      {/* Phase D will mount HudLayer + FriendsLayer + MissionsLayer for variant=run. */}
      {variant === 'run' && <div className="mapa-cidade__overlays" />}
    </div>
  );
};
