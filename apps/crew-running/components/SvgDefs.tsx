import React from 'react';

/**
 * Renderiza filtros SVG globais usados em CSS via `filter: url(#id)`.
 * Mantém TUDO inline no document pra funcionar tanto em dev quanto em build.
 */
export const SvgDefs: React.FC = () => (
  <svg
    width="0"
    height="0"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    aria-hidden
  >
    <defs>
      {/* Tremor leve — bordas de tiles, inputs */}
      <filter id="rough-soft" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="4" />
      </filter>

      {/* Tremor médio — botões, selected state */}
      <filter id="rough-mid" x="-12%" y="-12%" width="124%" height="124%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" />
        <feDisplacementMap in="SourceGraphic" scale="6" />
      </filter>

      {/* Tremor forte — underlines wobbly */}
      <filter id="rough-strong" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="8" />
      </filter>
    </defs>
  </svg>
);

/**
 * Underline desenhado à mão (SVG path com filtro de tremor).
 * Usar abaixo de section labels e títulos.
 */
export const HandUnderline: React.FC<{
  width?: number;
  className?: string;
  color?: string;
  thickness?: number;
}> = ({ width = 120, color = '#fff', thickness = 4, className = '' }) => (
  <svg
    viewBox={`0 0 ${width} 18`}
    width={width}
    height={18}
    className={`block ${className}`}
    style={{ filter: 'url(#rough-strong)' }}
    aria-hidden
  >
    <path
      d={`M3 9 C ${width * 0.2} 3, ${width * 0.45} 14, ${width * 0.65} 7 S ${width - 3} 11, ${width - 3} 9`}
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
      fill="none"
    />
    <path
      d={`M${width * 0.1} 13 C ${width * 0.3} 11, ${width * 0.5} 15, ${width * 0.8} 12`}
      stroke={color}
      strokeWidth={thickness * 0.5}
      strokeLinecap="round"
      strokeOpacity="0.6"
      fill="none"
    />
  </svg>
);

/**
 * Scribbles decorativos nos cantos (★, x, setas) — espalha pelo layout.
 */
export const ScribbleScatter: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><g fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' opacity='0.18'><path d='M40 80 q15 -12 30 0 t30 0'/><text x='90' y='40' font-family='cursive' font-size='28' fill='%23ffffff'>★</text><path d='M520 110 l14 14 m0 -14 l-14 14'/><path d='M60 480 q14 -10 28 2 t28 -2'/><text x='540' y='480' font-family='cursive' font-size='22' fill='%23ffffff'>★</text><path d='M450 540 l12 12 m0 -12 l-12 12'/><path d='M300 30 l10 10 m0 -10 l-10 10'/><path d='M480 320 q14 -12 28 0'/></g></svg>\")",
      backgroundRepeat: 'repeat',
      backgroundSize: '600px 600px',
      mixBlendMode: 'screen',
    }}
  />
);
