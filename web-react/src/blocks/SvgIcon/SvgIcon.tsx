import clsx from 'clsx';
import { dasx } from '@utils/dasx';
import type { IconProps } from './SvgIcon.types';
import type { CSSProperties } from 'react';
import css from './SvgIcon.module.css'

export default function SvgIcon({
  Svg,
  mode,
  variant = "fill",
  color,
  size = 40,
  adjust = {}
}: IconProps) {
  const { flipX, flipY, rotate } = adjust

  const isPhosphorIcon = Svg.displayName !== undefined;

  const computedColor = color && mode in color
    ? color[mode as keyof typeof color]
    : (color?.default || undefined);

  const customStyles: CSSProperties = {
    '--svg-width': `${size}px`,
    '--svg-height': `${size}px`,
    '--svg-current-color': computedColor,
  } as CSSProperties;
  return (
    <Svg
      size={size}
      color={computedColor || "currentColor"}
      weight={variant}
      mirrored={isPhosphorIcon ? flipX : undefined}
      {...dasx({ mode: mode })}
      style={customStyles}
      className={clsx(
        css.svg,
        flipY && css.flipY,
        flipX && !isPhosphorIcon && css.flipX,
        rotate === 90 && css.rotate90,
        rotate === 180 && css.rotate180,
        rotate === 270 && css.rotate270
      )}
    />
  )
}