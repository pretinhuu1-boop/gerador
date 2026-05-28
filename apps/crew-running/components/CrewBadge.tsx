import React from 'react';
import { getCrewBySlug, type CrewZone } from '../data/crews';

type Size = 'sm' | 'md' | 'lg';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  crew: CrewZone | string | undefined;
  size?: Size;
  pulse?: boolean;
  alt?: string;
};

const sizePx: Record<Size, number> = { sm: 32, md: 48, lg: 96 };

export const CrewBadge: React.FC<Props> = ({
  crew,
  size = 'md',
  pulse = false,
  className,
  style,
  alt,
  ...rest
}) => {
  const resolved = typeof crew === 'string' || crew == null ? getCrewBySlug(crew) : crew;
  const px = sizePx[size];
  // Treat the image as decorative whenever no meaningful alt text was supplied.
  // `alt === undefined`, `alt === ''`, and whitespace-only strings all map to
  // "not screen-reader-content" — trim so " " alone doesn't toggle it on.
  const isDecorative = !alt?.trim();
  return (
    <img
      src={resolved.assets.badge}
      alt={alt ?? ''}
      aria-hidden={isDecorative ? true : undefined}
      width={px}
      height={px}
      className={[pulse ? 'is-pulsing-crew' : '', className].filter(Boolean).join(' ')}
      style={{ ['--crew-accent' as string]: resolved.accent, ...style } as React.CSSProperties}
      {...rest}
    />
  );
};
