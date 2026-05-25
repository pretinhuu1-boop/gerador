import { Download, ExternalLink, Film } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ContentRender } from '../../../types/database';
import { PublishYouTubeButton } from './PublishYouTubeButton';

export const RenderedVideo = ({ render }: { render: ContentRender }) => {
  if (!render.mp4_url) return null;
  const sizeMb = render.size_bytes ? (render.size_bytes / 1024 / 1024).toFixed(1) : '?';
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
        <Film className="h-3 w-3" />
        MP4 renderizado · {render.template_id ?? 'StoriesVertical'} · {render.duration_s ?? '?'}s ·{' '}
        {sizeMb} MB
      </div>
      <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-overlay aspect-[9/16] max-h-[60vh] mx-auto">
        <video
          src={render.mp4_url}
          controls
          loop
          playsInline
          className="w-full h-full object-contain bg-black"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => render.mp4_url && window.open(render.mp4_url, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Abrir
        </Button>
        <a
          href={render.mp4_url}
          download
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-brand text-brand-contrast text-sm font-medium hover:bg-brand-muted shadow-glow-brand"
        >
          <Download className="h-3.5 w-3.5" /> Baixar MP4
        </a>
        <PublishYouTubeButton renderId={render.id} defaultTitle="Untitled render" />
      </div>
    </div>
  );
};
