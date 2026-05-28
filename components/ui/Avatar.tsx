import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
};

export const Avatar = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) => {
  const initial =
    fallback?.[0]?.toUpperCase() ??
    alt?.[0]?.toUpperCase() ??
    '?';
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-bg-elevated border border-border-subtle overflow-hidden font-semibold text-fg-secondary',
        sizes[size],
        className,
      )}
      {...props}
    >
      {src ? <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" /> : initial}
    </div>
  );
};
