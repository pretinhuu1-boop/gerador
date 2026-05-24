import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-md bg-bg-elevated/60 animate-pulse',
      'bg-[length:200%_100%] bg-gradient-to-r from-bg-elevated/40 via-bg-elevated to-bg-elevated/40 animate-shimmer',
      className,
    )}
    {...props}
  />
);
