import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartridgeButton } from '../CartridgeButton';

vi.mock('../../services/audio', () => ({
  audio: {
    unlock: vi.fn(),
    playSfx: vi.fn(),
  },
}));

describe('CartridgeButton', () => {
  it('renders solid variant with btn-solid class', () => {
    render(<CartridgeButton variant="solid">GO</CartridgeButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-solid');
  });

  it('renders chalk variant with btn-chalk class', () => {
    render(<CartridgeButton variant="chalk">EDIT</CartridgeButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-chalk');
  });

  it('renders link variant with btn-link class', () => {
    render(<CartridgeButton variant="link">BACK</CartridgeButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-link');
  });

  it('merges custom className with variant class', () => {
    render(
      <CartridgeButton variant="solid" className="game-command">
        START
      </CartridgeButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn-solid');
    expect(btn).toHaveClass('game-command');
  });

  it('disables when disabled prop is true', () => {
    render(
      <CartridgeButton variant="solid" disabled>
        OFF
      </CartridgeButton>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables and emits aria-busy when loading', () => {
    render(
      <CartridgeButton variant="solid" loading>
        WAIT
      </CartridgeButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <CartridgeButton variant="solid" disabled onClick={onClick}>
        OFF
      </CartridgeButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(
      <CartridgeButton variant="solid" onClick={onClick}>
        GO
      </CartridgeButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults type to button so it does not submit forms', () => {
    render(<CartridgeButton variant="solid">SAFE</CartridgeButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
