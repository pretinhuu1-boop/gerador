import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const Tooltip = ({
  content,
  children,
  side = 'top',
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const positions: Record<typeof side, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium bg-bg-overlay border border-border-subtle text-fg-primary shadow-elevated pointer-events-none animate-fade-in',
            positions[side],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};
