import { svsx } from '../../shared/sxCompiler/svsx'
import clsx from 'clsx'
import css from './Label.module.css'
import type { Mode } from '@composites/types/comp.types'
import type { BoxSide } from '../../shared/types/core.types'
import { cpsx } from '../../shared/sxCompiler/cpsx'
import { labelPreset, type LabelPreset } from '@generated/presets/label.preset'
import { labelStyle, type LabelStyle } from '@shared/generated/tokenModules/label.token'
import type { ElementType } from 'react'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: ElementType
  position?: BoxSide | "center"
  styleVars?: LabelStyle
  presets?: LabelPreset[]
}
export default function Label({
  msg,
  el = "span",
  position = "bottom",
  styleVars,
  presets
}: LabelSettings) {

  const positionMap: Record<BoxSide | "center", string> = {
    left: css.left,
    right: css.right,
    top: css.top,
    center: css.center,
    bottom: css.bottom
  }
  const positionClass = positionMap[position ?? "bottom"]

  const Element = el
  return (
    <div className={clsx(css.label,
      positionClass,
      ...cpsx(presets, labelPreset))}
      style={svsx(styleVars ?? {}, labelStyle)}>

      <Element>{msg}</Element>
    </div>
  )
}