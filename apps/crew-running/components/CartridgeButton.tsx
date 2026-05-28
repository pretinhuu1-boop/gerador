import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { audio, type SfxId } from '../services/audio';

type Variant = 'solid' | 'chalk' | 'link';

type Props = HTMLMotionProps<'button'> & {
  variant: Variant;
  loading?: boolean;
  sfx?: SfxId | 'none';
};

const variantClass: Record<Variant, string> = {
  solid: 'btn-solid',
  chalk: 'btn-chalk',
  link: 'btn-link',
};

const defaultSfx: Record<Variant, SfxId> = {
  solid: 'tap',
  chalk: 'tap',
  link: 'skip-cut',
};

export const CartridgeButton: React.FC<Props> = ({
  variant,
  loading = false,
  disabled,
  className,
  type = 'button',
  children,
  onClick,
  sfx,
  ...rest
}) => {
  const classes = [variantClass[variant], className].filter(Boolean).join(' ');
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    audio.unlock();
    const chosen = sfx ?? defaultSfx[variant];
    if (chosen !== 'none') audio.playSfx(chosen);
    onClick?.(event);
  };
  return (
    <motion.button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
};
