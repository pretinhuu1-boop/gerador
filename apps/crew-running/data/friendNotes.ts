export const FRIEND_NOTE_MAX_LENGTH = 140;

export type FriendTag = 'parceiro' | 'rival' | 'mentor' | 'novato';

export const FRIEND_TAGS: readonly FriendTag[] = ['parceiro', 'rival', 'mentor', 'novato'] as const;

export const TAG_LABELS: Record<FriendTag, string> = {
  parceiro: 'Parceiro',
  rival: 'Rival',
  mentor: 'Mentor',
  novato: 'Novato',
};

export const TAG_EMOJI: Record<FriendTag, string> = {
  parceiro: '🤝',
  rival: '⚔️',
  mentor: '🧭',
  novato: '🌱',
};

export interface FriendNote {
  friendUserId: string;
  text: string;
  tag?: FriendTag;
  updatedAt: number;
}

export const isFriendTag = (v: unknown): v is FriendTag =>
  typeof v === 'string' && FRIEND_TAGS.includes(v as FriendTag);

export const sanitizeFriendNote = (text: string): string =>
  text.trim().slice(0, FRIEND_NOTE_MAX_LENGTH);

export const isFriendNote = (v: unknown): v is FriendNote => {
  if (!v || typeof v !== 'object') return false;
  const n = v as Record<string, unknown>;
  return (
    typeof n.friendUserId === 'string' &&
    typeof n.text === 'string' &&
    typeof n.updatedAt === 'number' &&
    (n.tag === undefined || isFriendTag(n.tag))
  );
};

export const buildFriendNote = (friendUserId: string, text: string, tag?: FriendTag): FriendNote => ({
  friendUserId,
  text: sanitizeFriendNote(text),
  tag,
  updatedAt: Date.now(),
});
