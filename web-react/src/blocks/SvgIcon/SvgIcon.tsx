import clsx from 'clsx';
import { dasx } from '@utils/dasx';
import type { IconSettings } from '../blocks.types';
import css from './SvgIcon.module.css'
import { stsx } from '@utils/slsx';
import { svgIconVars } from './SvgIcon.vars';

export default function SvgIcon({
  Svg,
  mode,
  variant = "fill",
  phosphorSize,
  styleVars
}: IconSettings) {

  const {
    svgFlipX,
    svgDefaultCol,
    svgOnCol,
    svgOffCol,
    svgDisabledCol
  } = styleVars ?? {}

  const computedColor =
    mode === "disabled" ? svgDisabledCol :
      mode === "on" ? svgOnCol :
        mode === "off" ? svgOffCol :
          svgDefaultCol


  const isPhosphorIcon = Svg.displayName !== undefined;

  return (
    <Svg
      size={phosphorSize ?? 40}
      color={computedColor || "currentColor"}
      weight={variant}
      mirrored={isPhosphorIcon && svgFlipX ? true : undefined}
      {...dasx({ mode: mode })}
      style={{ ...stsx(styleVars ?? {}, svgIconVars) }}
      className={clsx(css.svg)}
    />
  )
}