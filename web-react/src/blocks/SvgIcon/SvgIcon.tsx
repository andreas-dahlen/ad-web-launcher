import clsx from 'clsx';
import { dasx } from '../../shared/sxCompiler/dasx';
import css from './SvgIcon.module.css'
import { svsx } from '../../shared/sxCompiler/svsx';

import { svgIconPreset, type SvgIconPreset } from '@generated/presets/svgIcon.preset'
import { cpsx } from '../../shared/sxCompiler/cpsx';
import type { DynamicIconComponent } from '@shared/types/svg'
import type { Icon } from '@phosphor-icons/react';
import type { Mode } from '@composites/types/comp.types';
import { svgIconStyle, type SvgIconStyle } from '@shared/generated/tokenModules/svgIcon.token'

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
    flipX,
    modeDefaultCol,
    modeOnCol,
    modeOffCol,
    modeDisabledCol
  } = styleVars?.svg ?? {}

  const computedColor = ({
    disabled: modeDisabledCol,
    on: modeOnCol,
    off: modeOffCol,
    default: modeDefaultCol
  })[mode ?? "default"]


  const isPhosphorIcon = Svg.displayName !== undefined;

  return (
    <Svg
      size={phosphorSize ?? 40}
      color={computedColor || "currentColor"}
      weight={variant}
      mirrored={isPhosphorIcon && flipX ? true : undefined}
      {...dasx({ mode: mode })}
      style={{ ...svsx(styleVars ?? {}, svgIconStyle) }}
      className={clsx(css.svg, ...cpsx(presets, svgIconPreset))}
    />
  )
}