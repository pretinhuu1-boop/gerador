import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeRoomCard } from '../SedeRoomCard';
import { SEDE_ROOMS_BY_ID } from '../../../data/sedeRooms';

describe('SedeRoomCard', () => {
  it('renders the room short label', () => {
    render(
      <SedeRoomCard
        room={SEDE_ROOMS_BY_ID['sala-medalhas']}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /MEDALHAS/ })).toBeInTheDocument();
  });

  it('invokes onOpen with room id when clicked', () => {
    const onOpen = vi.fn();
    render(
      <SedeRoomCard
        room={SEDE_ROOMS_BY_ID['trofeu-room']}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /TROFÉUS/ }));
    expect(onOpen).toHaveBeenCalledWith('trofeu-room');
  });

  it('disables the button when visitor and room is memberOnly', () => {
    const memberOnlyRoom = {
      ...SEDE_ROOMS_BY_ID['mural-feed'],
      memberOnly: true,
    };
    const onOpen = vi.fn();
    render(<SedeRoomCard room={memberOnlyRoom} onOpen={onOpen} viewer="visitor" />);
    const btn = screen.getByRole('button', { name: /MURAL/ });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
