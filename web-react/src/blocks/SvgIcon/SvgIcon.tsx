import clsx from 'clsx';
import { dasx } from '@utils/dasx';
import css from './SvgIcon.module.css'
import { svsx } from '@utils/svsx';
import { svgIconPreset } from './SvgIcon.vars';
import type { SvgIconPreset } from './SvgIcon.vars';
import { cpsx } from '@utils/cpsx';
import type { DynamicIconComponent } from '@typing/svg';
import type { Icon } from '@phosphor-icons/react';
import type { Mode } from '@composites/types/comp.types';
import { svgIconStyle, type SvgIconStyle } from '@schema/components';
import vars from '@styleSystem/tokens.module.css'

export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?: SvgIconStyle
  presets?: SvgIconPreset[]
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

  const computedColor = ({
    disabled: svgDisabledCol,
    on: svgOnCol,
    off: svgOffCol,
    default: svgDefaultCol
  })[mode ?? "default"]


  const isPhosphorIcon = Svg.displayName !== undefined;

  return (
    <Svg
      size={phosphorSize ?? 40}
      color={computedColor || "currentColor"}
      weight={variant}
      mirrored={isPhosphorIcon && svgFlipX ? true : undefined}
      {...dasx({ mode: mode })}
      style={{ ...svsx(styleVars ?? {}, svgIconStyle) }}
      className={clsx(vars.svgIconCompiler, css.svg, ...cpsx(presets, svgIconPreset))}
    />
  )
}