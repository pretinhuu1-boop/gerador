import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SedeShell } from '../SedeShell';
import { getCrewBySlug } from '../../../data/crews';

describe('SedeShell', () => {
  it('renders header + grid + footer at the home view', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    expect(screen.getByText(crew.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VOLTAR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TROCAR CREW' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MEDALHAS/ })).toBeInTheDocument();
  });

  it('opens a room when its card is clicked and shows the placeholder', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    expect(screen.getByTestId('sede-room-sala-medalhas')).toBeInTheDocument();
  });

  it('exposes a back-to-grid action inside a room and returns to grid', () => {
    const crew = getCrewBySlug('east-burners');
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /MEDALHAS/ }));
    fireEvent.click(screen.getByRole('button', { name: 'FECHAR SALA' }));
    expect(screen.getByRole('button', { name: /PATENTES/ })).toBeInTheDocument();
    expect(screen.queryByTestId('sede-room-sala-medalhas')).not.toBeInTheDocument();
  });

  it('calls onBack when shell footer VOLTAR is clicked at grid view', () => {
    const crew = getCrewBySlug('east-burners');
    const onBack = vi.fn();
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={onBack}
        onSwitchCrew={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'VOLTAR' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onSwitchCrew when TROCAR CREW is clicked', () => {
    const crew = getCrewBySlug('east-burners');
    const onSwitchCrew = vi.fn();
    render(
      <SedeShell
        crew={crew}
        viewer="member"
        onBack={() => {}}
        onSwitchCrew={onSwitchCrew}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'TROCAR CREW' }));
    expect(onSwitchCrew).toHaveBeenCalled();
  });
});
