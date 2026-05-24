import {
  MessageSquare,
  Telescope,
  Tv,
  Brain,
  Image as ImageIcon,
  Video,
  Wrench,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../stores/appStore';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../lib/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active: boolean;
  group: 'primary' | 'legacy';
  badge?: string;
}

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const { surface, setSurface, activeWorkspace, setActiveWorkspace, sidebarCollapsed, toggleSidebar } =
    useAppStore();

  const isChannelOS = surface === 'channel-os';

  const items: NavItem[] = [
    {
      id: 'home',
      label: 'Hermes Chat',
      icon: MessageSquare,
      group: 'primary',
      onClick: () => {
        setSurface('channel-os');
        setActiveWorkspace('home');
      },
      active: isChannelOS && activeWorkspace === 'home',
    },
    {
      id: 'scout',
      label: 'Scout',
      icon: Telescope,
      group: 'primary',
      onClick: () => {
        setSurface('channel-os');
        setActiveWorkspace('scout');
      },
      active: isChannelOS && activeWorkspace === 'scout',
    },
    {
      id: 'channels',
      label: 'Canais',
      icon: Tv,
      group: 'primary',
      onClick: () => {
        setSurface('channel-os');
        setActiveWorkspace('channels');
      },
      active: isChannelOS && activeWorkspace === 'channels',
      badge: '0',
    },
    {
      id: 'memory',
      label: 'Memória',
      icon: Brain,
      group: 'primary',
      onClick: () => {
        setSurface('channel-os');
        setActiveWorkspace('memory');
      },
      active: isChannelOS && activeWorkspace === 'memory',
    },
    {
      id: 'image',
      label: 'Image Studio',
      icon: ImageIcon,
      group: 'legacy',
      onClick: () => setSurface('image-studio'),
      active: surface === 'image-studio',
    },
    {
      id: 'video',
      label: 'Video Studio',
      icon: Video,
      group: 'legacy',
      onClick: () => setSurface('video-studio'),
      active: surface === 'video-studio',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      group: 'legacy',
      onClick: () => setSurface('tools-studio'),
      active: surface === 'tools-studio',
    },
  ];

  const renderItem = (item: NavItem) => {
    const button = (
      <button
        onClick={item.onClick}
        className={cn(
          'group w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all',
          item.active
            ? 'bg-brand/15 text-fg-primary border border-brand/30 shadow-glow-brand'
            : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-elevated border border-transparent',
        )}
      >
        <item.icon className={cn('h-4 w-4 shrink-0', item.active && 'text-brand')} />
        {!sidebarCollapsed && (
          <>
            <span className="font-medium truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-bg-elevated text-fg-muted">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
    return sidebarCollapsed ? (
      <Tooltip key={item.id} content={item.label} side="right">
        {button}
      </Tooltip>
    ) : (
      <div key={item.id}>{button}</div>
    );
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="shrink-0 h-full bg-bg-subtle/80 backdrop-blur border-r border-border-subtle flex flex-col"
    >
      <div className="h-14 flex items-center justify-between px-3 border-b border-border-subtle">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-md bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
              <span className="text-brand font-bold text-sm">⌘</span>
            </div>
            <div className="overflow-hidden">
              <div className="font-display text-sm font-bold leading-none truncate">
                <span className="text-gradient-brand">Channel OS</span>
              </div>
              <div className="text-[10px] text-fg-muted leading-none mt-0.5 truncate">v0.1 · scout</div>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 scrollbar-none">
        {!sidebarCollapsed && (
          <div className="px-2.5 mt-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Channel OS
          </div>
        )}
        <div className="space-y-1">{items.filter((i) => i.group === 'primary').map(renderItem)}</div>

        {!sidebarCollapsed && (
          <div className="px-2.5 mt-5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Studios legados
          </div>
        )}
        <div className="space-y-1 mt-1">{items.filter((i) => i.group === 'legacy').map(renderItem)}</div>
      </nav>

      <div className="border-t border-border-subtle p-2">
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-bg-elevated transition-colors group">
          <Avatar
            size="sm"
            src={null}
            fallback={user?.displayName ?? user?.email ?? '?'}
            alt={user?.email}
          />
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-medium truncate">
                  {user?.displayName ?? user?.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-fg-muted truncate">{user?.email}</div>
              </div>
              <Tooltip content="Sair" side="top">
                <button
                  onClick={() => signOut()}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-danger hover:bg-bg-elevated opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
        {!sidebarCollapsed && (
          <button className="mt-1 w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-fg-muted hover:text-fg-primary hover:bg-bg-elevated transition-colors">
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações</span>
          </button>
        )}
      </div>
    </motion.aside>
  );
};
