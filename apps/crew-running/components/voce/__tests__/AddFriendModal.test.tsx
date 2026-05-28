import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddFriendModal } from '../AddFriendModal';
import { encodeFriendPayload, FRIEND_EXCHANGE_VERSION } from '../../../data/friends';

vi.mock('../../../services/qrcode', () => ({
  encodeQrDataUrl: vi.fn(async () => 'data:image/png;base64,fake'),
}));

vi.mock('../../../services/nfc', () => ({
  isNfcSupported: () => false,
  readNfcTag: vi.fn(),
  writeNfcTag: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

const renderModal = (overrides: Partial<React.ComponentProps<typeof AddFriendModal>> = {}) => {
  const onAddFriend = vi.fn();
  const onClose = vi.fn();
  const props: React.ComponentProps<typeof AddFriendModal> = {
    open: true,
    selfUserId: 'self-uuid',
    selfRunnerName: 'Me',
    selfCrewSlug: 'east-burners',
    selfRunnerTypeId: 'sprint',
    onClose,
    onAddFriend,
    ...overrides,
  };
  const utils = render(<AddFriendModal {...props} />);
  return { ...utils, onAddFriend, onClose };
};

describe('AddFriendModal a11y', () => {
  it('does not render when open=false', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog with proper aria attrs', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Adicionar amigo');
  });

  it('ESC key closes modal', () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('backdrop click closes modal', () => {
    const { onClose } = renderModal();
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('dialog click does NOT close modal', () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('NFC disabled when unsupported', () => {
    renderModal();
    const nfcBtn = screen.getByRole('button', { name: /NFC NÃO SUPORTADO/ });
    expect((nfcBtn as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('AddFriendModal handle paste', () => {
  it('accepts a valid v1 payload', async () => {
    const { onAddFriend, onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /COLAR CONVITE/ }));
    const ta = screen.getByLabelText(/CONVITE DO AMIGO/) as HTMLTextAreaElement;
    const payload = encodeFriendPayload({
      v: FRIEND_EXCHANGE_VERSION,
      userId: 'friend-1',
      runnerName: 'Bia',
      crewSlug: 'east-burners',
    });
    fireEvent.change(ta, { target: { value: payload } });
    fireEvent.click(screen.getByRole('button', { name: /^ADICIONAR AMIGO$/ }));
    await waitFor(() => {
      expect(onAddFriend).toHaveBeenCalledTimes(1);
    });
    expect(onAddFriend.mock.calls[0][0].userId).toBe('friend-1');
    expect(onAddFriend.mock.calls[0][0].addMethod).toBe('handle');
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects self-userId with error message', async () => {
    const { onAddFriend, onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /COLAR CONVITE/ }));
    const ta = screen.getByLabelText(/CONVITE DO AMIGO/) as HTMLTextAreaElement;
    const payload = encodeFriendPayload({
      v: FRIEND_EXCHANGE_VERSION,
      userId: 'self-uuid',
      runnerName: 'Me Again',
    });
    fireEvent.change(ta, { target: { value: payload } });
    fireEvent.click(screen.getByRole('button', { name: /^ADICIONAR AMIGO$/ }));
    expect(onAddFriend).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/Esse convite é teu/)).toBeDefined();
  });

  it('rejects malformed payload', () => {
    const { onAddFriend } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /COLAR CONVITE/ }));
    const ta = screen.getByLabelText(/CONVITE DO AMIGO/) as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'not json' } });
    fireEvent.click(screen.getByRole('button', { name: /^ADICIONAR AMIGO$/ }));
    expect(onAddFriend).not.toHaveBeenCalled();
    expect(screen.getByText(/Convite inválido/)).toBeDefined();
  });
});
