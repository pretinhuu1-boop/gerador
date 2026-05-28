import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeUnlockToast } from '../BadgeUnlockToast';

describe('BadgeUnlockToast', () => {
  it('renders nothing when no unlocks', () => {
    const { container } = render(
      <BadgeUnlockToast unlocked={[]} onDismiss={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one card per unlocked badge with name and hint', () => {
    render(
      <BadgeUnlockToast
        unlocked={['first-blood', 'cartographer']}
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByText(/primeira sangue/i)).toBeInTheDocument();
    expect(screen.getByText(/sua primeira corrida/i)).toBeInTheDocument();
    expect(screen.getByText(/cartógrafo/i)).toBeInTheDocument();
    expect(screen.getByText(/toque todos os 11 spots/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    render(
      <BadgeUnlockToast unlocked={['first-blood']} onDismiss={onDismiss} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
