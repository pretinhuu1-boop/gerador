import { motion } from 'framer-motion';
import { Clock, Hash, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import type { ContentDraft } from '../../../types/database';

const STATUS_VARIANT: Record<
  ContentDraft['status'],
  'default' | 'brand' | 'accent' | 'warn' | 'info' | 'success'
> = {
  draft: 'default',
  approved: 'brand',
  rendering: 'info',
  rendered: 'accent',
  published: 'success',
  archived: 'default',
};

const STATUS_LABEL: Record<ContentDraft['status'], string> = {
  draft: 'rascunho',
  approved: 'aprovado',
  rendering: 'renderizando',
  rendered: 'renderizado',
  published: 'publicado',
  archived: 'arquivado',
};

export const DraftCard = ({
  draft,
  active,
  onClick,
}: {
  draft: ContentDraft;
  active?: boolean;
  onClick?: () => void;
}) => (
  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
    <Card
      interactive
      onClick={onClick}
      className={
        active
          ? 'border-brand/40 bg-brand/5 shadow-glow-brand'
          : 'hover:border-brand/40 hover:shadow-glow-brand'
      }
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm truncate leading-tight">
              {draft.title}
            </h3>
            <Badge variant={STATUS_VARIANT[draft.status]} size="sm">
              {STATUS_LABEL[draft.status]}
            </Badge>
          </div>
          {draft.hook && (
            <p className="mt-1.5 text-xs text-fg-secondary line-clamp-2 leading-relaxed">
              {draft.hook}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-mono text-fg-muted">
            <Badge variant="default" size="sm" className="capitalize">
              {draft.format}
            </Badge>
            {draft.duration_seconds && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {draft.duration_seconds}s
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" /> {draft.beats.length} beat
              {draft.beats.length === 1 ? '' : 's'}
            </span>
            <span className="ml-auto">
              {formatDistanceToNow(new Date(draft.updated_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);
