import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HudOverlay } from '../HudOverlay';
import { CREWS } from '../../../data/crews';
import { xpToLevel, type RunnerProgress } from '../../../data/gamification';

const baseProgress: RunnerProgress = {
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
};

describe('HudOverlay', () => {
  it('H1: xp=0 shows level 1 and 0% bar fill', () => {
    const { container } = render(<HudOverlay progress={baseProgress} />);
    expect(screen.getByText('1')).toBeTruthy();
    const fill = container.querySelector('.map-hud-xp-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('H2: xp=500 shows correct level via xpToLevel', () => {
    render(<HudOverlay progress={{ ...baseProgress, xp: 500 }} />);
    const expected = String(xpToLevel(500));
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('H3: streakWeeks=7 renders 7 in the streak badge', () => {
    render(<HudOverlay progress={{ ...baseProgress, streakWeeks: 7 }} />);
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByLabelText(/Streak 7 semanas/i)).toBeTruthy();
  });

  it('H4: crew accent color is applied inline to the level number', () => {
    const crew = CREWS.find((c) => c.slug === 'east-burners')!;
    const { container } = render(
      <HudOverlay progress={baseProgress} crewSlug="east-burners" />,
    );
    const levelValue = container.querySelector('.map-hud-level-value') as HTMLElement;
    expect(levelValue.style.color).toBeTruthy();
    const style = (levelValue.getAttribute('style') ?? '').toLowerCase();
    expect(style).toContain(crew.accent.toLowerCase());
  });

  it('H5: missing crewSlug falls back to CREWS[0] without crashing', () => {
    const { container } = render(<HudOverlay progress={baseProgress} />);
    const img = container.querySelector('.map-hud-profile img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe(CREWS[0].name);
  });
});
