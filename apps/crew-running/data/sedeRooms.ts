export type SedeRoomId =
  | 'wall-of-sponsors'
  | 'sala-medalhas'
  | 'hall-patentes'
  | 'ranking-lendario'
  | 'trofeu-room'
  | 'mural-feed'
  | 'member-roster';

export type SedeRoomSurface = 'screen' | 'sheet';

export interface SedeRoomConfig {
  id: SedeRoomId;
  label: string;
  shortLabel: string;
  iconKey: string;
  surfaceType: SedeRoomSurface;
  visitorVisible: boolean;
  memberOnly: boolean;
}

export const SEDE_ROOMS: readonly SedeRoomConfig[] = [
  {
    id: 'wall-of-sponsors',
    label: 'Wall of Sponsors',
    shortLabel: 'SPONSORS',
    iconKey: 'wall',
    surfaceType: 'sheet',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'sala-medalhas',
    label: 'Sala de Medalhas',
    shortLabel: 'MEDALHAS',
    iconKey: 'medal',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'hall-patentes',
    label: 'Hall de Patentes',
    shortLabel: 'PATENTES',
    iconKey: 'patent',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'ranking-lendario',
    label: 'Ranking Lendário',
    shortLabel: 'RANKING',
    iconKey: 'rank',
    surfaceType: 'sheet',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'trofeu-room',
    label: 'Trofeu Room',
    shortLabel: 'TROFÉUS',
    iconKey: 'trophy',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'mural-feed',
    label: 'Mural Feed',
    shortLabel: 'MURAL',
    iconKey: 'mural',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
  {
    id: 'member-roster',
    label: 'Member Roster',
    shortLabel: 'ROSTER',
    iconKey: 'roster',
    surfaceType: 'screen',
    visitorVisible: true,
    memberOnly: false,
  },
] as const;

export const SEDE_ROOMS_BY_ID: Readonly<Record<SedeRoomId, SedeRoomConfig>> =
  SEDE_ROOMS.reduce(
    (acc, room) => {
      acc[room.id] = room;
      return acc;
    },
    {} as Record<SedeRoomId, SedeRoomConfig>,
  );
