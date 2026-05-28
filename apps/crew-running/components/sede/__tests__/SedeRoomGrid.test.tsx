import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeRoomGrid } from '../SedeRoomGrid';
import { SEDE_ROOMS } from '../../../data/sedeRooms';

describe('SedeRoomGrid', () => {
  it('renders one card per room', () => {
    render(<SedeRoomGrid onOpenRoom={() => {}} />);
    for (const room of SEDE_ROOMS) {
      expect(screen.getByRole('button', { name: new RegExp(room.shortLabel) })).toBeInTheDocument();
    }
  });

  it('forwards onOpenRoom with id when a card is clicked', () => {
    const onOpenRoom = vi.fn();
    render(<SedeRoomGrid onOpenRoom={onOpenRoom} />);
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    expect(onOpenRoom).toHaveBeenCalledWith('sala-medalhas');
  });

  it('passes viewer through to the cards', () => {
    render(<SedeRoomGrid onOpenRoom={() => {}} viewer="visitor" />);
    expect(screen.getAllByRole('button').every((btn) => !btn.hasAttribute('disabled'))).toBe(true);
  });
});
