import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SedeHeader } from '../SedeHeader';
import { getCrewBySlug } from '../../../data/crews';

describe('SedeHeader', () => {
  it('renders the active crew name and zone', () => {
    const crew = getCrewBySlug('east-burners');
    render(<SedeHeader crew={crew} viewer="member" />);
    expect(screen.getByText(crew.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(crew.zone, 'i'))).toBeInTheDocument();
  });

  it('renders the visitor badge when viewer is visitor', () => {
    const crew = getCrewBySlug('downtown-rush');
    render(<SedeHeader crew={crew} viewer="visitor" />);
    expect(screen.getByText(/VISITANTE/i)).toBeInTheDocument();
  });

  it('does not render the visitor badge when viewer is member', () => {
    const crew = getCrewBySlug('downtown-rush');
    render(<SedeHeader crew={crew} viewer="member" />);
    expect(screen.queryByText(/VISITANTE/i)).not.toBeInTheDocument();
  });
});
