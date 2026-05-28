import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoneSheet } from '../ZoneSheet';
import { SpotSheet } from '../SpotSheet';
import { CrewSheet } from '../CrewSheet';
import { RunnerCard } from '../RunnerCard';
import type { RunnerProgress } from '../../../data/gamification';
import type { FriendRecord } from '../../../data/friends';
import type { SpZoneId } from '../../../data/spLiveMap';

const baseProgress: RunnerProgress = {
  xp: 500,
  level: 3,
  streakWeeks: 2,
  lastRunAt: Date.now(),
  freezesAvailable: 1,
  inkPerZone: { centro: 400, norte: 100 },
  inkUpdatedAt: Date.now(),
  badgeUnlocks: ['first-blood'],
  patchesOwned: [],
  weekKey: '2026-W22',
  runsThisWeek: 2,
};

const fakeFriend: FriendRecord = {
  userId: 'friend-1',
  runnerName: 'Mano SP',
  crewSlug: 'downtown-rush',
  runnerTypeId: 'sprint',
  addedAt: Date.now() - 86400_000,
  addMethod: 'nfc',
};

describe('ZoneSheet', () => {
  it('renders zone stats when open', () => {
    render(
      <ZoneSheet
        zoneId="centro"
        progress={baseProgress}
        friends={[fakeFriend]}
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Centro' })).toBeTruthy();
    expect(screen.getByText('40%')).toBeTruthy();
    expect(screen.getByText('DISPUTADA')).toBeTruthy();
    expect(screen.getByText('Downtown Rush')).toBeTruthy();
    expect(screen.getByText('Mano SP')).toBeTruthy();
  });

  it('shows spots list with locked state', () => {
    render(
      <ZoneSheet
        zoneId="centro"
        progress={baseProgress}
        friends={[]}
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Vale do Anhangabau')).toBeTruthy();
    expect(screen.getByText('Republica')).toBeTruthy();
    expect(screen.getByText('Parque da Luz')).toBeTruthy();
    expect(screen.getByText('2/3 abertos')).toBeTruthy();
  });

  it('filters friends by zone crew — other crews excluded', () => {
    const otherCrewFriend: FriendRecord = {
      userId: 'friend-east',
      runnerName: 'Rival Runner',
      crewSlug: 'east-burners',
      addedAt: Date.now(),
      addMethod: 'qr',
    };
    render(
      <ZoneSheet
        zoneId="centro"
        progress={baseProgress}
        friends={[fakeFriend, otherCrewFriend]}
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Mano SP')).toBeTruthy();
    expect(screen.queryByText('Rival Runner')).toBeNull();
  });

  it('shows missions when available', () => {
    render(
      <ZoneSheet
        zoneId="centro"
        progress={baseProgress}
        friends={[]}
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Spot Hunt Centro')).toBeTruthy();
    expect(screen.getByText('+200 XP')).toBeTruthy();
  });
});

describe('SpotSheet', () => {
  it('renders open spot info', () => {
    render(<SpotSheet spotId="spot-vale" open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Vale do Anhangabau' })).toBeTruthy();
    expect(screen.getByText('ABERTO')).toBeTruthy();
    expect(screen.getByText('Centro')).toBeTruthy();
  });

  it('renders locked spot with hint and locked class', () => {
    const { container } = render(<SpotSheet spotId="spot-luz" open onClose={() => {}} />);
    expect(screen.getByText('BLOQUEADO')).toBeTruthy();
    expect(screen.getByText(/Corra na zona Centro/)).toBeTruthy();
    expect(container.querySelector('.spot-sheet__status.is-locked')).toBeTruthy();
  });

  it('renders open spot with open class', () => {
    const { container } = render(<SpotSheet spotId="spot-vale" open onClose={() => {}} />);
    expect(container.querySelector('.spot-sheet__status.is-open')).toBeTruthy();
  });

  it('shows linked missions for active spot', () => {
    render(<SpotSheet spotId="spot-vale" open onClose={() => {}} />);
    expect(screen.getByText('Spot Hunt Centro')).toBeTruthy();
  });
});

describe('CrewSheet', () => {
  it('renders crew stats for user crew', () => {
    render(
      <CrewSheet
        crewSlug="downtown-rush"
        progress={baseProgress}
        friends={[fakeFriend]}
        isUserCrew
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Downtown Rush' })).toBeTruthy();
    expect(screen.getByText('SUA CREW')).toBeTruthy();
    expect(screen.getByText('40%')).toBeTruthy();
    expect(screen.getByText('Mano SP')).toBeTruthy();
    expect(screen.getByText('NFC')).toBeTruthy();
  });

  it('renders rival crew without user-specific stats', () => {
    render(
      <CrewSheet
        crewSlug="east-burners"
        progress={baseProgress}
        friends={[]}
        isUserCrew={false}
        open
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'East Burners' })).toBeTruthy();
    expect(screen.queryByText('SUA CREW')).toBeNull();
    expect(screen.getByText(/Nenhum amigo nesta crew/)).toBeTruthy();
  });
});

describe('RunnerCard', () => {
  it('renders friend info', () => {
    render(<RunnerCard friend={fakeFriend} open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Mano SP' })).toBeTruthy();
    expect(screen.getByText(/Downtown Rush/)).toBeTruthy();
    expect(screen.getByText('NFC')).toBeTruthy();
  });

  it('shows avatar placeholder when no avatarDataUrl', () => {
    const { container } = render(<RunnerCard friend={fakeFriend} open onClose={() => {}} />);
    expect(container.querySelector('.runner-card__avatar-placeholder')).toBeTruthy();
    expect(container.querySelector('.runner-card__avatar-placeholder')?.textContent).toBe('M');
  });

  it('renders avatar image when avatarDataUrl provided', () => {
    const withAvatar: FriendRecord = { ...fakeFriend, avatarDataUrl: 'data:image/png;base64,abc' };
    const { container } = render(<RunnerCard friend={withAvatar} open onClose={() => {}} />);
    const img = container.querySelector('.runner-card__avatar') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toBe('data:image/png;base64,abc');
  });

  it('renders friend without crewSlug', () => {
    const noCrew: FriendRecord = {
      userId: 'solo-1',
      runnerName: 'Solo Runner',
      addedAt: Date.now(),
      addMethod: 'qr',
    };
    render(<RunnerCard friend={noCrew} open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Solo Runner' })).toBeTruthy();
    expect(screen.queryByText(/Downtown Rush/)).toBeNull();
    expect(screen.getByText('QR')).toBeTruthy();
  });
});

describe('Edge cases — invalid IDs', () => {
  it('ZoneSheet renders nothing for invalid zoneId', () => {
    const { container } = render(
      <ZoneSheet
        zoneId={'nonexistent' as SpZoneId}
        progress={baseProgress}
        friends={[]}
        open
        onClose={() => {}}
      />,
    );
    expect(container.querySelector('.map-bottom-sheet')).toBeNull();
  });

  it('SpotSheet renders nothing for invalid spotId', () => {
    const { container } = render(
      <SpotSheet spotId="nonexistent" open onClose={() => {}} />,
    );
    expect(container.querySelector('.map-bottom-sheet')).toBeNull();
  });

  it('CrewSheet falls back to first crew for invalid slug', () => {
    render(
      <CrewSheet
        crewSlug="nonexistent"
        progress={baseProgress}
        friends={[]}
        isUserCrew={false}
        open
        onClose={() => {}}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBeTruthy();
  });
});
