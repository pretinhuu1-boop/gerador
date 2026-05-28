export type IdentityEventKind =
  | 'CREW_JOINED'
  | 'GUIDE_COMPLETED'
  | 'LOOK_SAVED'
  | 'RUNNER_TYPE_CHANGED'
  | 'BADGE_EARNED'
  | 'STICKER_DROPPED'
  | 'VISUAL_CREATED';

export type IdentityEventPayload = {
  crewSlug?: string;
  runnerTypeId?: string;
  runnerName?: string;
  slots?: {
    top: string;
    bottom: string;
    shoes: string;
    accessory: string;
  };
  savedAt?: number;
  lookIndex?: number;
  badgeId?: string;
  stickerId?: string;
};

export type IdentityEvent = {
  id: string;
  kind: IdentityEventKind;
  payload: IdentityEventPayload;
  timestamp: number;
};

export type IdentityEventVariantSpec = {
  railToken: string;
  swatchToken: string;
  headline: string;
  bodyTemplate: (payload: IdentityEventPayload) => string;
  showLookCard: boolean;
};

const formatSlots = (payload: IdentityEventPayload) => {
  if (!payload.slots) return '';
  const parts = [payload.slots.top, payload.slots.bottom, payload.slots.shoes, payload.slots.accessory]
    .filter(Boolean)
    .map((s) => s.replace(/_/g, ' ').toUpperCase());
  return parts.join(' · ');
};

export const IDENTITY_EVENT_VARIANTS: Record<IdentityEventKind, IdentityEventVariantSpec> = {
  CREW_JOINED: {
    railToken: 'var(--spray-cyan)',
    swatchToken: 'var(--crew-accent)',
    headline: 'ENTROU NA CREW',
    bodyTemplate: () => 'Sinal aceito. Bem-vindo à zona.',
    showLookCard: false,
  },
  GUIDE_COMPLETED: {
    railToken: 'var(--bone)',
    swatchToken: 'var(--spray-cyan)',
    headline: 'GUIA CONCLUÍDO',
    bodyTemplate: () => 'A crew abriu a tua entrada.',
    showLookCard: false,
  },
  LOOK_SAVED: {
    railToken: 'var(--crew-accent)',
    swatchToken: 'var(--spray-orange)',
    headline: 'LOOK SALVO',
    bodyTemplate: (p) => formatSlots(p) || 'Identidade equipada.',
    showLookCard: true,
  },
  RUNNER_TYPE_CHANGED: {
    railToken: 'var(--spray-orange)',
    swatchToken: 'var(--crew-accent)',
    headline: 'TIPO DE RUNNER ATUALIZADO',
    bodyTemplate: (p) => p.runnerTypeId ? p.runnerTypeId.toUpperCase().replace(/-/g, ' ') : 'Tipo atualizado.',
    showLookCard: false,
  },
  BADGE_EARNED: {
    railToken: 'var(--spray-yellow, #f0c33c)',
    swatchToken: 'var(--bone)',
    headline: 'BADGE DESBLOQUEADO',
    bodyTemplate: (p) => p.badgeId ? p.badgeId.toUpperCase() : 'Conquista registrada.',
    showLookCard: false,
  },
  STICKER_DROPPED: {
    railToken: 'var(--spray-green, #79c267)',
    swatchToken: 'var(--crew-secondary)',
    headline: 'STICKER COLETADO',
    bodyTemplate: (p) => p.stickerId ? p.stickerId.toUpperCase() : 'Sticker no dossier.',
    showLookCard: false,
  },
  VISUAL_CREATED: {
    railToken: 'var(--bone-soft)',
    swatchToken: 'var(--spray-cyan)',
    headline: 'IDENTIDADE VISUAL CRIADA',
    bodyTemplate: () => 'Novo visual no passaporte.',
    showLookCard: true,
  },
};

export const isIdentityEventKind = (value: unknown): value is IdentityEventKind =>
  typeof value === 'string' && value in IDENTITY_EVENT_VARIANTS;

export const buildIdentityEventId = (kind: IdentityEventKind, timestamp: number): string =>
  `${kind.toLowerCase()}_${timestamp}`;
