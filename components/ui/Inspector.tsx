import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Permanent right rail (320px on >=xl viewports). On smaller screens callers
 * should hide it and provide a drawer fallback if needed.
 */
export const Inspector = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) => (
  <aside
    className={cn(
      'hidden xl:flex shrink-0 w-[320px] h-full flex-col bg-bg-subtle/80 backdrop-blur border-l border-border-subtle overflow-hidden',
      className,
    )}
    {...props}
  >
    {children}
  </aside>
);

export const InspectorSection = ({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('border-b border-border-subtle/60 px-4 py-3', className)}>
    <header className="flex items-center justify-between mb-2.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
        {title}
      </h3>
      {action}
    </header>
    {children}
  </section>
);
