import clsx from 'clsx';
import css from './Button.module.css';
import { dasx } from '@utils/dataAttrs';
import type { IconProps } from '@composites/Button/Button.types';
import type { CSSProperties } from 'react';

export default function ButtonIcon({
  Icon,
  mode,
  variant = "bold",
  color,
  size = 40,
  adjust = {}
}: IconProps) {
  const { flipX, flipY, rotate } = adjust

  const isPhosphorIcon = Icon.displayName !== undefined;

  const computedColor = color && mode in color
    ? color[mode as keyof typeof color]
    : (color?.default || undefined);

  const customStyles: CSSProperties = {
    '--svg-width': `${size}px`,
    '--svg-height': `${size}px`,
    '--svg-current-color': computedColor,
  } as CSSProperties;

  return (
    <Icon
      size={size}
      color={computedColor || "currentColor"}
      weight={variant}
      mirrored={isPhosphorIcon ? flipX : undefined}
      {...dasx({ mode: mode })}
      style={customStyles}
      className={clsx(
        css.svg,
        !isPhosphorIcon && variant === 'fill' && css.isFilledVariant,
        flipY && css.flipY,
        flipX && !isPhosphorIcon && css.flipX,
        rotate === 90 && css.rotate90,
        rotate === 180 && css.rotate180,
        rotate === 270 && css.rotate270
      )}
    />
  )
}