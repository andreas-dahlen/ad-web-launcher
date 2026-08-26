import clsx from 'clsx';
import { dasx } from '../../shared/sxCompiler/dasx';
import css from './Svg.module.css'
import { svsx } from '../../shared/sxCompiler/svsx';

import { svgPreset, type SvgPreset } from '@generated/presets/svg.preset'
import { cpsx } from '../../shared/sxCompiler/cpsx';
import type { DynamicIconComponent } from '@shared/types/svg'
import type { Icon } from '@phosphor-icons/react';
import type { Mode } from '@composites/types/comp.types';
import { svgStyle, type SvgStyle } from '@generated/tokenModules/svg.token';

export type IconSettings = {
  Svg: Icon | DynamicIconComponent
  mode?: Mode
  variant?: 'bold' | 'thin' | 'light' | 'regular' | 'fill' | 'duotone'
  phosphorSize?: number
  styleVars?: SvgStyle
  presets?: SvgPreset[]
}
export default function Svg({
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
      style={{ ...svsx(styleVars ?? {}, svgStyle) }}
      className={clsx(css.svg, ...cpsx(presets, svgPreset))}
    />
  )
}