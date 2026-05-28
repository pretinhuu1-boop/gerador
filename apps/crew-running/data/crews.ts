export type CrewZone = {
  slug: string;
  name: string;
  zone: string;
  mission: string;
  accent: string;
  secondary: string;
  introLine: string;
  map: {
    x: number;
    y: number;
  };
  assets: {
    badge: string;
    banner: string;
    leader: string;
    marker: string;
    missionCard: string;
    members: string[];
    ping: string;
    pattern: string;
    shareCard: string;
  };
};

const crewBase = (slug: string) => `/crews/${slug}`;

export const CREWS: CrewZone[] = [
  {
    slug: 'downtown-rush',
    name: 'Downtown Rush',
    zone: 'Centro',
    mission: 'Rush Hour Run',
    accent: '#C9302C',
    secondary: '#F4A52C',
    introLine: 'avenida-pulso acesa no centro',
    map: { x: 50, y: 49 },
    assets: {
      badge: `${crewBase('downtown-rush')}/badge_128.png`,
      banner: `${crewBase('downtown-rush')}/banner.png`,
      leader: `${crewBase('downtown-rush')}/leader.png`,
      marker: `${crewBase('downtown-rush')}/marker.png`,
      missionCard: `${crewBase('downtown-rush')}/mission_card.png`,
      members: [
        `${crewBase('downtown-rush')}/members/member_1.png`,
        `${crewBase('downtown-rush')}/members/member_2.png`,
        `${crewBase('downtown-rush')}/members/member_3.png`,
      ],
      ping: '/intro/crew-pings/downtown-rush.png',
      pattern: `${crewBase('downtown-rush')}/territory_pattern.png`,
      shareCard: `${crewBase('downtown-rush')}/share_card.png`,
    },
  },
  {
    slug: 'north-breakers',
    name: 'North Breakers',
    zone: 'Norte',
    mission: 'Break the Climb',
    accent: '#2EC4B6',
    secondary: '#7BE82C',
    introLine: 'subida quebrando a rotina',
    map: { x: 48, y: 23 },
    assets: {
      badge: `${crewBase('north-breakers')}/badge_128.png`,
      banner: `${crewBase('north-breakers')}/banner.png`,
      leader: `${crewBase('north-breakers')}/leader.png`,
      marker: `${crewBase('north-breakers')}/marker.png`,
      missionCard: `${crewBase('north-breakers')}/mission_card.png`,
      members: [
        `${crewBase('north-breakers')}/members/member_1.png`,
        `${crewBase('north-breakers')}/members/member_2.png`,
        `${crewBase('north-breakers')}/members/member_3.png`,
      ],
      ping: '/intro/crew-pings/north-breakers.png',
      pattern: `${crewBase('north-breakers')}/territory_pattern.png`,
      shareCard: `${crewBase('north-breakers')}/share_card.png`,
    },
  },
  {
    slug: 'south-striders',
    name: 'South Striders',
    zone: 'Sul',
    mission: 'South Long Run',
    accent: '#4DA3B5',
    secondary: '#7BE82C',
    introLine: 'curva longa, ritmo constante',
    map: { x: 56, y: 76 },
    assets: {
      badge: `${crewBase('south-striders')}/badge_128.png`,
      banner: `${crewBase('south-striders')}/banner.png`,
      leader: `${crewBase('south-striders')}/leader.png`,
      marker: `${crewBase('south-striders')}/marker.png`,
      missionCard: `${crewBase('south-striders')}/mission_card.png`,
      members: [
        `${crewBase('south-striders')}/members/member_1.png`,
        `${crewBase('south-striders')}/members/member_2.png`,
        `${crewBase('south-striders')}/members/member_3.png`,
      ],
      ping: '/intro/crew-pings/south-striders.png',
      pattern: `${crewBase('south-striders')}/territory_pattern.png`,
      shareCard: `${crewBase('south-striders')}/share_card.png`,
    },
  },
  {
    slug: 'east-burners',
    name: 'East Burners',
    zone: 'Leste',
    mission: 'Heat the Block',
    accent: '#E85D2C',
    secondary: '#F4A52C',
    introLine: 'heat-route abrindo o bairro',
    map: { x: 76, y: 52 },
    assets: {
      badge: `${crewBase('east-burners')}/badge_128.png`,
      banner: `${crewBase('east-burners')}/banner.png`,
      leader: `${crewBase('east-burners')}/leader.png`,
      marker: `${crewBase('east-burners')}/marker.png`,
      missionCard: `${crewBase('east-burners')}/mission_card.png`,
      members: [
        `${crewBase('east-burners')}/members/member_1.png`,
        `${crewBase('east-burners')}/members/member_2.png`,
        `${crewBase('east-burners')}/members/member_3.png`,
      ],
      ping: '/intro/crew-pings/east-burners.png',
      pattern: `${crewBase('east-burners')}/territory_pattern.png`,
      shareCard: `${crewBase('east-burners')}/share_card.png`,
    },
  },
  {
    slug: 'west-flow',
    name: 'West Flow',
    zone: 'Oeste',
    mission: 'Open the Flow',
    accent: '#2EC4B6',
    secondary: '#F4A52C',
    introLine: 'linha fluida atravessando o mapa',
    map: { x: 25, y: 50 },
    assets: {
      badge: `${crewBase('west-flow')}/badge_128.png`,
      banner: `${crewBase('west-flow')}/banner.png`,
      leader: `${crewBase('west-flow')}/leader.png`,
      marker: `${crewBase('west-flow')}/marker.png`,
      missionCard: `${crewBase('west-flow')}/mission_card.png`,
      members: [
        `${crewBase('west-flow')}/members/member_1.png`,
        `${crewBase('west-flow')}/members/member_2.png`,
        `${crewBase('west-flow')}/members/member_3.png`,
      ],
      ping: '/intro/crew-pings/west-flow.png',
      pattern: `${crewBase('west-flow')}/territory_pattern.png`,
      shareCard: `${crewBase('west-flow')}/share_card.png`,
    },
  },
];

export const getCrewBySlug = (slug?: string): CrewZone =>
  CREWS.find((crew) => crew.slug === slug) ?? CREWS[0];
