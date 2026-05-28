import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Loader2, Sparkles } from 'lucide-react';
import { fetchTemplates, type VideoTemplate } from '../../../services/channelOS/templatesService';
import { Badge } from '../../ui/Badge';

interface Props {
  /** Currently selected template id. */
  value: string | null;
  /** Called when the user picks a template. */
  onChange: (template: VideoTemplate) => void;
  /** Optional brief used to highlight best matches. */
  brief?: string;
  /** Compact mode = horizontal scroll instead of grid. */
  compact?: boolean;
}

const STOPWORDS = new Set([
  'de', 'da', 'do', 'para', 'pra', 'com', 'sem', 'que', 'um', 'uma',
  'o', 'a', 'os', 'as', 'no', 'na', 'em', 'e', 'ou', 'por', 'como',
  'the', 'of', 'for', 'with', 'to', 'is', 'video', 'short', 'shorts',
]);

function tokens(text: string): Set<string> {
  return new Set(
    (text.match(/[a-z0-9áéíóúâêôãõç]+/gi) ?? [])
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t)),
  );
}

function scoreMatch(template: VideoTemplate, briefTokens: Set<string>): number {
  if (briefTokens.size === 0) return 0;
  const haystack = [
    ...template.recommended_for,
    template.description,
    ...template.example_briefs,
    template.label,
  ].join(' ');
  const hTokens = tokens(haystack);
  let hits = 0;
  for (const t of briefTokens) if (hTokens.has(t)) hits += 1;
  return hits / briefTokens.size;
}

export const TemplatePicker = ({ value, onChange, brief, compact = false }: Props) => {
  const [templates, setTemplates] = useState<VideoTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTemplates()
      .then((r) => {
        if (!cancelled) setTemplates(r.templates);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Falha ao carregar templates');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ranked = useMemo(() => {
    if (!templates) return null;
    const briefTokens = brief ? tokens(brief) : new Set<string>();
    return templates
      .map((t) => ({ template: t, score: scoreMatch(t, briefTokens) }))
      .sort((a, b) => b.score - a.score);
  }, [templates, brief]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!ranked) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando templates…
      </div>
    );
  }

  const hasMatchHints = brief && ranked.some((r) => r.score >= 0.2);

  return (
    <div className={compact ? 'flex gap-3 overflow-x-auto pb-2' : 'grid gap-3 sm:grid-cols-2'}>
      {ranked.map(({ template, score }) => {
        const active = value === template.id;
        const isTopMatch = hasMatchHints && score >= 0.2 && score === ranked[0].score;
        return (
          <motion.button
            key={template.id}
            type="button"
            whileHover={{ y: -2 }}
            onClick={() => onChange(template)}
            className={[
              'relative flex',
              compact ? 'min-w-[260px]' : '',
              'flex-col gap-2 rounded-2xl border bg-[#0f0f14] px-4 py-3 text-left transition',
              active
                ? 'border-violet-500 ring-2 ring-violet-500/40'
                : 'border-white/10 hover:border-white/25 hover:bg-[#13131a]',
            ].join(' ')}
          >
            {isTopMatch && (
              <div className="absolute -right-1 -top-1 flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                <Sparkles className="h-3 w-3" /> match
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${template.badge_color}22`, border: `1px solid ${template.badge_color}55` }}
              >
                <Film className="h-4 w-4" style={{ color: template.badge_color }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{template.label}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/40">
                  {template.aspect_ratio} · {template.default_duration_seconds}s · {template.fps}fps
                </div>
              </div>
            </div>
            <p className="line-clamp-2 text-xs text-white/60">{template.description}</p>
            <div className="flex flex-wrap gap-1">
              {template.recommended_for.slice(0, 3).map((tag) => (
                <Badge key={tag} size="sm">
                  {tag}
                </Badge>
              ))}
              {template.recommended_for.length > 3 && (
                <span className="text-[10px] text-white/40">
                  +{template.recommended_for.length - 3}
                </span>
              )}
            </div>
            {brief && score > 0 && (
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(score * 100))}%`,
                      background: template.badge_color,
                    }}
                  />
                </div>
                <span>{Math.round(score * 100)}%</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
