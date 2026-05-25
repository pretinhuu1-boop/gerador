import { cn } from '../../lib/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number | string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
  size?: 'sm' | 'md';
  className?: string;
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = 'sm',
  className,
  fullWidth,
}: SegmentedControlProps<T>) {
  const heightCls = size === 'sm' ? 'h-7' : 'h-9';
  const padCls = size === 'sm' ? 'px-2.5 text-[11px]' : 'px-3 text-xs';
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex p-0.5 rounded-md bg-bg-elevated border border-border-subtle',
        fullWidth && 'w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[5px] font-medium transition-colors tabular-nums',
              heightCls,
              padCls,
              fullWidth && 'flex-1 justify-center',
              active
                ? 'bg-bg-base text-fg-primary shadow-card'
                : 'text-fg-muted hover:text-fg-primary',
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'font-mono text-[10px]',
                  active ? 'text-fg-secondary' : 'text-fg-muted',
                )}
              >
                ({opt.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
