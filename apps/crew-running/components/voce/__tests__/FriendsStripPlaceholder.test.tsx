import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FriendsStripPlaceholder } from '../FriendsStripPlaceholder';
import { CREWS } from '../../../data/crews';

const crew = CREWS[0];

describe('FriendsStripPlaceholder', () => {
  it('is hidden from the a11y tree', () => {
    const { container } = render(<FriendsStripPlaceholder crew={crew} />);
    const strip = container.querySelector('.voce-panel__friends-strip');
    expect(strip).not.toBeNull();
    expect(strip).toHaveAttribute('aria-hidden', 'true');
  });

  it('labels itself as a Fase 2 placeholder', () => {
    render(<FriendsStripPlaceholder crew={crew} />);
    expect(screen.getByText(/AMIGOS · ABRE NA FASE 2/)).toBeInTheDocument();
  });

  it('renders exactly 5 placeholder tiles', () => {
    const { container } = render(<FriendsStripPlaceholder crew={crew} />);
    const tiles = container.querySelectorAll('.voce-panel__friend-tile');
    expect(tiles).toHaveLength(5);
  });

  it('does not expose any clickable element', () => {
    const { container } = render(<FriendsStripPlaceholder crew={crew} />);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });
});
