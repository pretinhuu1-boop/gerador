import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultiplierChip } from '../MultiplierChip';

describe('MultiplierChip', () => {
  it('renders loop chip with multiplier and explanation', () => {
    render(<MultiplierChip kind="loop" multiplier={1.5} />);
    expect(screen.getByText(/loop ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/fechou volta/i)).toBeInTheDocument();
  });

  it('renders invasion chip with multiplier and explanation', () => {
    render(<MultiplierChip kind="invasion" multiplier={1.5} />);
    expect(screen.getByText(/invasão ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/correu em zona inimiga/i)).toBeInTheDocument();
  });

  it('renders null when multiplier is exactly 1', () => {
    const { container } = render(<MultiplierChip kind="loop" multiplier={1} />);
    expect(container.firstChild).toBeNull();
  });
});
