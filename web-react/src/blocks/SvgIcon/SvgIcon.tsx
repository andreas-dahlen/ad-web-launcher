import clsx from 'clsx';
import { dasx } from '@utils/dasx';
import css from './SvgIcon.module.css'
import { svsx } from '@utils/svsx';
import { svgIconAlwaysAllowed, svgIconPresetMap, svgIconVars, type svgIconPreset, type SvgIconStyleOverrides } from './SvgIcon.vars';
import { cpsx } from '@utils/cpsx';
import type { DynamicIconComponent } from '@typing/svg';
import type { Icon } from '@phosphor-icons/react';
import type { Mode } from '@composites/comp.types';

export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?: SvgIconStyleOverrides
  presets?: svgIconPreset[]
}
export default function SvgIcon({
  Svg,
  mode,
  variant = "fill",
  phosphorSize,
  styleVars,
  presets
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
      style={{ ...svsx(styleVars ?? {}, svgIconVars, svgIconAlwaysAllowed) }}
      className={clsx(css.svg, ...cpsx(presets, svgIconPresetMap))}
    />
  )
}