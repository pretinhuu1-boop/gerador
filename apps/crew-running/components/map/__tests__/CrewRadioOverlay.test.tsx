import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CrewRadioOverlay } from '../CrewRadioOverlay';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => { this.map.set(k, v); };
  removeItem = (k: string) => { this.map.delete(k); };
  clear = () => { this.map.clear(); };
}

let mem: MemoryStorage;

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('localStorage', mem);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CrewRadioOverlay', () => {
  it('renders null when no crewSlug provided', () => {
    const { container } = render(
      <CrewRadioOverlay crewSlug={undefined} selfUserId="me" selfRunnerName="Me" />,
    );
    expect(container.querySelector('.crew-radio-overlay')).toBeNull();
  });

  it('shows title + closed body by default', () => {
    render(<CrewRadioOverlay crewSlug="east-burners" selfUserId="me" selfRunnerName="Me" />);
    expect(screen.getByText('RÁDIO DA CREW')).toBeDefined();
    const overlay = document.querySelector('.crew-radio-overlay');
    expect(overlay?.classList.contains('is-closed')).toBe(true);
  });

  it('toggle expands body + shows empty state', () => {
    render(<CrewRadioOverlay crewSlug="east-burners" selfUserId="me" selfRunnerName="Me" />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(document.querySelector('.crew-radio-overlay.is-open')).toBeDefined();
    expect(screen.getByText(/Nenhum sinal/)).toBeDefined();
  });

  it('posts a sanitized message and clears input', () => {
    render(<CrewRadioOverlay crewSlug="east-burners" selfUserId="me" selfRunnerName="Me" />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const input = screen.getByLabelText(/MANDA UM SINAL/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   hey crew   ' } });
    fireEvent.click(screen.getByRole('button', { name: /ENVIAR/ }));
    expect(screen.getByText('hey crew')).toBeDefined();
    expect(input.value).toBe('');
  });

  it('does not post on whitespace-only input', () => {
    render(<CrewRadioOverlay crewSlug="east-burners" selfUserId="me" selfRunnerName="Me" />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const input = screen.getByLabelText(/MANDA UM SINAL/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });
    const send = screen.getByRole('button', { name: /ENVIAR/ }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
  });
});
