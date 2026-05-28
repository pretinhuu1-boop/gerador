import { Users, Eye, Film, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { ScoreRing } from './ScoreRing';
import type { Channel } from '../../../types/database';

const compact = (n: number | null | undefined): string => {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
};

export const ChannelCard = ({
  channel,
  onClick,
}: {
  channel: Channel;
  onClick?: () => void;
}) => {
  const yt = channel.platform === 'youtube';
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <Card interactive onClick={onClick} className="group hover:border-brand/40 hover:shadow-glow-brand p-4">
        <div className="flex items-start gap-3">
          <Avatar size="lg" src={channel.thumbnail_url} alt={channel.title} fallback={channel.title} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm truncate leading-tight">
                  {channel.title}
                </h3>
                {channel.handle && (
                  <div className="text-xs text-fg-muted truncate font-mono">{channel.handle}</div>
                )}
              </div>
              <ScoreRing score={Number(channel.score ?? 0)} size={48} thickness={4} />
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs">
              <Stat icon={Users} label="subs" value={compact(channel.subscriber_count)} />
              <Stat icon={Eye} label="views" value={compact(channel.view_count)} />
              <Stat icon={Film} label="vids" value={compact(channel.video_count)} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                <Badge variant="default" size="sm" className="capitalize">
                  {channel.platform}
                </Badge>
                {channel.country && (
                  <Badge variant="default" size="sm" className="uppercase font-mono">
                    {channel.country}
                  </Badge>
                )}
                {channel.tags?.slice(0, 2).map((t) => (
                  <Badge key={t} variant="brand" size="sm">
                    {t}
                  </Badge>
                ))}
              </div>
              {yt && (
                <a
                  href={`https://youtube.com/channel/${channel.platform_id}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-fg-muted hover:text-brand transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Abrir no YouTube"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 text-fg-muted">
      <Icon className="h-3 w-3" />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-mono font-semibold text-fg-primary mt-0.5">{value}</div>
  </div>
);
