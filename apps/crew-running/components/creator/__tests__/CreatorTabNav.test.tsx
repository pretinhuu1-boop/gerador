import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatorTabNav } from '../CreatorTabNav';

const TABS = [
  { id: 'foto', label: 'FOTO' },
  { id: 'perfil', label: 'PERFIL' },
  { id: 'look', label: 'LOOK' },
  { id: 'ficha', label: 'FICHA' },
] as const;

describe('CreatorTabNav', () => {
  it('renders 4 tabs with active state', () => {
    render(<CreatorTabNav tabs={TABS} active="perfil" onSelect={() => {}} />);
    expect(screen.getByRole('tab', { name: 'PERFIL' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'FOTO' })).toHaveAttribute('aria-selected', 'false');
  });

  it('fires onSelect on click', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="foto" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('tab', { name: 'LOOK' }));
    expect(onSelect).toHaveBeenCalledWith('look');
  });

  it('arrow-right moves selection right, wraps at end', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="ficha" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'FICHA' }), { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenCalledWith('foto');
  });

  it('arrow-left moves selection left, wraps at start', () => {
    const onSelect = vi.fn();
    render(<CreatorTabNav tabs={TABS} active="foto" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'FOTO' }), { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenCalledWith('ficha');
  });
});
