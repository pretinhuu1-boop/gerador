export const CREW_RADIO_TTL_MS = 24 * 60 * 60 * 1000;
export const CREW_RADIO_MAX_LENGTH = 140;
export const CREW_RADIO_MAX_PER_CREW = 200;

export type CrewRadioMessage = {
  id: string;
  authorUserId: string;
  authorName: string;
  crewSlug: string;
  text: string;
  postedAt: number;
  expiresAt: number;
};

export const buildCrewRadioId = (authorUserId: string, postedAt: number): string =>
  `radio_${authorUserId}_${postedAt}`;

export const isCrewRadioMessage = (value: unknown): value is CrewRadioMessage => {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.authorUserId === 'string' &&
    typeof m.authorName === 'string' &&
    typeof m.crewSlug === 'string' &&
    typeof m.text === 'string' &&
    typeof m.postedAt === 'number' &&
    typeof m.expiresAt === 'number'
  );
};

export const isExpired = (msg: CrewRadioMessage, now: number = Date.now()): boolean =>
  msg.expiresAt <= now;

export const sanitizeRadioText = (raw: string): string =>
  raw.trim().slice(0, CREW_RADIO_MAX_LENGTH);
