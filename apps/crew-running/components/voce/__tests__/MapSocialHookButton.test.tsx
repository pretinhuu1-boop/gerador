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

  it('does not fire any click handler when clicked', () => {
    const clickSpy = vi.fn();
    render(<MapSocialHookButton />);
    const btn = screen.getByRole('button');
    btn.addEventListener('click', clickSpy);
    btn.click();
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
