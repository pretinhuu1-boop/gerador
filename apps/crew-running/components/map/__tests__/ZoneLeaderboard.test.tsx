import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoneLeaderboard } from '../ZoneLeaderboard';

vi.mock('../../../hooks/useLeaderboard', () => ({
  useZoneLeaderboard: () => ({
    entries: [
      { userId: 'u1', runnerName: 'Ana', crewSlug: 'east-burners', totalKm: 12.4, totalInk: 340, runsCount: 5, rank: 1 },
      { userId: 'u2', runnerName: 'Beto', crewSlug: 'downtown-rush', totalKm: 8.7, totalInk: 210, runsCount: 3, rank: 2 },
    ],
    loading: false,
  }),
}));

describe('ZoneLeaderboard', () => {
  it('renders ranked runners', () => {
    render(<ZoneLeaderboard zoneId="centro" weekKey="2026-W22" currentUserId="u3" />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Beto')).toBeTruthy();
    expect(screen.getByText('12.4 km')).toBeTruthy();
  });

  it('highlights current user row', () => {
    render(<ZoneLeaderboard zoneId="centro" weekKey="2026-W22" currentUserId="u1" />);
    const row = screen.getByText('Ana').closest('[data-is-self]');
    expect(row?.getAttribute('data-is-self')).toBe('true');
  });
});
