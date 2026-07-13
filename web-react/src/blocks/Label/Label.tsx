import React from 'react'
import { svsx } from '@utils/svsx'
import vars from '@styleSystem/tokens.module.css'
import clsx from 'clsx'
import css from './Label.module.css'
import type { Mode } from '@composites/types/comp.types'
import type { BoxSide } from '@typing/core.types'
import { cpsx } from '@utils/cpsx'
import { labelPreset, type LabelPreset } from '@blocks/Label/Label.vars'
import { labelStyle, type LabelStyle } from '@schema/components'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: string
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

  return (
    <div className={clsx(vars.labelCompiler, css.labelwrapper,
      positionClass,
      ...cpsx(presets, labelPreset))}
      style={svsx(styleVars ?? {}, labelStyle)}>

      {React.createElement(
        el,
        { className: css.label },
        msg
      )}
    </div>
  )
}