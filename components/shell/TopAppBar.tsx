import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../stores/appStore';
import { StatusChip } from '../ui/StatusChip';
import { cn } from '../../lib/cn';

const SURFACE_LABEL: Record<string, string> = {
  'channel-os': 'Channel OS',
  'image-studio': 'Image Studio',
  'video-studio': 'Video Studio',
  'tools-studio': 'Tools',
};

const WORKSPACE_LABEL: Record<string, string> = {
  home: 'Hermes Chat',
  scout: 'Scout',
  content: 'Conteúdo',
  channels: 'Canais',
  memory: 'Memória',
  agents: 'Agentes',
};

interface Props {
  /** Optional center area (segmented control, view switcher, etc). */
  center?: React.ReactNode;
  /** Optional right area (actions specific to the workspace). */
  right?: React.ReactNode;
  /** Optional extra crumb for nested context (e.g. session title in chat). */
  extraCrumb?: string;
}

export const TopAppBar = ({ center, right, extraCrumb }: Props) => {
  const surface = useAppStore((s) => s.surface);
  const workspace = useAppStore((s) => s.activeWorkspace);
  const { user } = useAuth();

  const isChannelOS = surface === 'channel-os';
  const surfaceLabel = SURFACE_LABEL[surface] ?? 'Channel OS';
  const workspaceLabel = isChannelOS ? WORKSPACE_LABEL[workspace] ?? workspace : null;

  const greetingName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0];

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 pl-14 pr-4 md:pl-4 border-b border-border-subtle bg-bg-panel/80 backdrop-blur">
      <nav
        className="flex items-center gap-1.5 text-xs text-fg-muted min-w-0"
        aria-label="breadcrumbs"
      >
        <span className="text-fg-secondary font-medium hidden sm:inline">{surfaceLabel}</span>
        {workspaceLabel && (
          <>
            <ChevronRight className="h-3 w-3 hidden sm:inline" aria-hidden />
            <span className="text-fg-primary font-medium truncate">{workspaceLabel}</span>
          </>
        )}
        {extraCrumb && (
          <>
            <ChevronRight className="h-3 w-3 hidden md:inline" aria-hidden />
            <span className="text-fg-primary font-medium truncate hidden md:inline">
              {extraCrumb}
            </span>
          </>
        )}
        {greetingName && (
          <StatusChip tone="brand" className="ml-2 hidden lg:inline-flex">
            {greetingName}
          </StatusChip>
        )}
      </nav>

      {center && (
        <div className={cn('flex-1 flex items-center justify-center min-w-0')}>{center}</div>
      )}

      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </header>
  );
};
