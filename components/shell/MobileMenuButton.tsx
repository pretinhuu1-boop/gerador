import { Menu } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const MobileMenuButton = () => {
  const open = useAppStore((s) => s.openMobileSidebar);
  return (
    <button
      onClick={open}
      data-testid="mobile-menu-trigger"
      aria-label="Abrir menu"
      className="md:hidden fixed top-3 left-3 z-30 h-9 w-9 inline-flex items-center justify-center rounded-lg bg-bg-panel/90 border border-border-subtle backdrop-blur shadow-card text-fg-primary hover:bg-bg-elevated transition-colors"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
};
