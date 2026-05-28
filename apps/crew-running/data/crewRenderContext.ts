import { CREWS, getCrewBySlug } from './crews';

export type CrewRenderAsset = {
  label: string;
  path: string;
};

export type CrewRenderContext = {
  slug: string;
  name: string;
  zone: string;
  mission: string;
  accent: string;
  secondary: string;
  basePath: string;
  assets: {
    badge: CrewRenderAsset;
    banner: CrewRenderAsset;
    leader: CrewRenderAsset;
    missionCard: CrewRenderAsset;
    pattern: CrewRenderAsset;
    stickers: CrewRenderAsset[];
  };
  referenceAssets: CrewRenderAsset[];
};

const DEFAULT_CREW_SLUG = CREWS[0]?.slug ?? 'downtown-rush';

const normalizeCrewSlug = (slug?: string): string =>
  getCrewBySlug(slug || DEFAULT_CREW_SLUG).slug;

const asset = (slug: string, label: string, relativePath: string): CrewRenderAsset => ({
  label,
  path: `/crews/${slug}/${relativePath}`,
});

export const buildCrewRenderContext = (selectedCrewSlug?: string): CrewRenderContext => {
  const slug = normalizeCrewSlug(selectedCrewSlug);
  const crew = getCrewBySlug(slug);
  const basePath = `/crews/${slug}`;
  const assets = {
    badge: asset(slug, 'badge', 'badge_128.png'),
    banner: asset(slug, 'banner', 'banner.png'),
    leader: asset(slug, 'leader', 'leader.png'),
    missionCard: asset(slug, 'mission_card', 'mission_card.png'),
    pattern: asset(slug, 'territory_pattern', 'territory_pattern.png'),
    stickers: [
      asset(slug, 'sticker_1', 'stickers/sticker_1.png'),
      asset(slug, 'sticker_2', 'stickers/sticker_2.png'),
      asset(slug, 'sticker_3', 'stickers/sticker_3.png'),
    ],
  };
  const referenceAssets = [
    assets.badge,
    assets.banner,
    assets.leader,
    assets.missionCard,
    assets.pattern,
    ...assets.stickers,
  ];

  return {
    slug,
    name: crew.name,
    zone: crew.zone,
    mission: crew.mission,
    accent: crew.accent,
    secondary: crew.secondary,
    basePath,
    assets,
    referenceAssets,
  };
};

export const assertCrewRenderAssetPath = (
  context: CrewRenderContext,
  path: string,
): void => {
  if (!path.startsWith(`${context.basePath}/`)) {
    throw new Error('Asset fora da crew selecionada bloqueado pelo render context.');
  }
};
