import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

export const LoadingGrid = ({ count = 3, className }: { count?: number; className?: string }) => (
  <div className={className ?? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-36 rounded-2xl" />
    ))}
  </div>
);

export const ErrorState = ({
  title = 'Não consegui carregar agora',
  detail,
  onRetry,
  hint,
}: {
  title?: string;
  detail?: string | null;
  onRetry?: () => void;
  hint?: React.ReactNode;
}) => (
  <div className="max-w-md mx-auto text-center py-16">
    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warn/15 border border-warn/30 mb-4">
      <AlertTriangle className="h-6 w-6 text-warn" />
    </div>
    <h3 className="font-display font-semibold text-lg">{title}</h3>
    {detail && <p className="text-xs font-mono text-fg-muted mt-2 break-words">{detail}</p>}
    {hint && <p className="text-sm text-fg-secondary mt-3">{hint}</p>}
    {onRetry && (
      <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" /> Tentar de novo
      </Button>
    )}
  </div>
);

export const SupabaseOfflineHint = () => (
  <>
    Parece que o Supabase local não tá rodando. Abra um terminal e rode{' '}
    <code className="font-mono text-fg-primary bg-bg-elevated px-1.5 py-0.5 rounded">
      supabase start
    </code>{' '}
    — depois copie a anon key pro <code className="font-mono">.env.local</code>.
  </>
);
