import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { FriendPings } from '../FriendPings';
import type { FriendRecord } from '../../../data/friends';

const PROJECTION = { width: 100, height: 100, padding: 8 };

const friend = (userId: string, crewSlug: string | undefined): FriendRecord => ({
  userId,
  runnerName: `Friend-${userId}`,
  crewSlug,
  addedAt: 1_000,
  addMethod: 'qr',
});

describe('FriendPings', () => {
  it('renders nothing when there are no friends', () => {
    const { container } = render(
      <svg>
        <FriendPings friends={[]} projection={PROJECTION} />
      </svg>,
    );
    expect(container.querySelectorAll('.friend-ping').length).toBe(0);
  });

  it('renders one ping per friend with a known crew zone', () => {
    const friends = [
      friend('a', 'east-burners'),
      friend('b', 'west-flow'),
      friend('c', 'north-breakers'),
    ];
    const { container } = render(
      <svg>
        <FriendPings friends={friends} projection={PROJECTION} />
      </svg>,
    );
    expect(container.querySelectorAll('.friend-ping').length).toBe(3);
  });

  it('skips friends without a crewSlug', () => {
    const friends = [friend('a', 'east-burners'), friend('no-zone', undefined)];
    const { container } = render(
      <svg>
        <FriendPings friends={friends} projection={PROJECTION} />
      </svg>,
    );
    expect(container.querySelectorAll('.friend-ping').length).toBe(1);
  });

  it('skips friends whose crewSlug is not a known zone', () => {
    const friends = [friend('a', 'unknown-crew')];
    const { container } = render(
      <svg>
        <FriendPings friends={friends} projection={PROJECTION} />
      </svg>,
    );
    expect(container.querySelectorAll('.friend-ping').length).toBe(0);
  });

  it('places title with runner name + zone label', () => {
    const friends = [friend('a', 'east-burners')];
    const { container } = render(
      <svg>
        <FriendPings friends={friends} projection={PROJECTION} />
      </svg>,
    );
    const title = container.querySelector('.friend-ping title');
    expect(title?.textContent).toContain('Friend-a');
    expect(title?.textContent).toContain('Leste');
  });
});
