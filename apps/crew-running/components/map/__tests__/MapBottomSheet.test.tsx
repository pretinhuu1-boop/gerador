import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MapBottomSheet } from '../MapBottomSheet';

describe('MapBottomSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <MapBottomSheet open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </MapBottomSheet>,
    );
    expect(container.querySelector('.map-bottom-sheet')).toBeNull();
  });

  it('renders dialog when open', () => {
    render(
      <MapBottomSheet open onClose={() => {}} title="Zona Centro">
        <p>content here</p>
      </MapBottomSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Zona Centro' })).toBeTruthy();
    expect(screen.getByText('Zona Centro')).toBeTruthy();
    expect(screen.getByText('content here')).toBeTruthy();
  });

  it('fires onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <MapBottomSheet open onClose={onClose} title="Test">
        <p>x</p>
      </MapBottomSheet>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <MapBottomSheet open onClose={onClose} title="Test">
        <p>x</p>
      </MapBottomSheet>,
    );
    const backdrop = container.querySelector('.map-bottom-sheet-backdrop');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onClose when sheet body clicked', () => {
    const onClose = vi.fn();
    render(
      <MapBottomSheet open onClose={onClose} title="Test">
        <p>click me</p>
      </MapBottomSheet>,
    );
    fireEvent.click(screen.getByText('click me'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('fires onClose on Escape key (document-level listener)', () => {
    const onClose = vi.fn();
    render(
      <MapBottomSheet open onClose={onClose} title="Test">
        <p>x</p>
      </MapBottomSheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses close button on open', () => {
    render(
      <MapBottomSheet open onClose={() => {}} title="Test">
        <p>x</p>
      </MapBottomSheet>,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar' }));
  });
});
