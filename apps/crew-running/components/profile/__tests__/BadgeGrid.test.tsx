import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeGrid } from '../BadgeGrid';
import { BADGE_DEFS } from '../../../data/gamification';

describe('BadgeGrid', () => {
  it('renders all BADGE_DEFS with locked/unlocked state', () => {
    render(<BadgeGrid unlocked={['first-blood']} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(BADGE_DEFS.length);
    expect(screen.getByLabelText(/Primeira Sangue.*desbloqueado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cartógrafo.*bloqueado/i)).toBeInTheDocument();
  });

  it('shows hint for locked badges as the unlock condition', () => {
    render(<BadgeGrid unlocked={[]} />);
    expect(screen.getByText(/sua primeira corrida/i)).toBeInTheDocument();
  });
});
