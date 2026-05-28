import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapSocialHookButton } from '../MapSocialHookButton';

describe('MapSocialHookButton', () => {
  it('renders the Em Breve copy', () => {
    render(<MapSocialHookButton />);
    expect(screen.getByText(/MAPA SOCIAL · EM BREVE/)).toBeInTheDocument();
  });

  it('is disabled and announces it via aria-disabled', () => {
    render(<MapSocialHookButton />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders enabled label when onClick is provided', () => {
    render(<MapSocialHookButton onClick={() => {}} />);
    expect(screen.getByText(/ABRIR MAPA SOCIAL/)).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('fires onClick when enabled and clicked', () => {
    const spy = vi.fn();
    render(<MapSocialHookButton onClick={spy} />);
    screen.getByRole('button').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
