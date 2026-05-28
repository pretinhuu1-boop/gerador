import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-brand-contrast hover:bg-brand-muted shadow-glow-brand',
        secondary:
          'bg-bg-elevated text-fg-primary hover:bg-bg-elevated/80 border border-border-subtle',
        ghost: 'bg-transparent text-fg-secondary hover:bg-bg-elevated hover:text-fg-primary',
        outline:
          'bg-transparent text-fg-primary border border-border hover:bg-bg-elevated',
        accent:
          'bg-accent text-fg-inverted hover:brightness-110 shadow-glow-accent font-semibold',
        danger:
          'bg-danger text-fg-inverted hover:brightness-110',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        xl: 'h-14 px-6 text-base',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
