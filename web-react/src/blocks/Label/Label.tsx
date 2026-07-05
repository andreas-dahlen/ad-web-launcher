import React from 'react'
import { svsx } from '@utils/svsx'
import { labelAlwaysAllowed, labelPresetMap, labelVars, type LabelPreset, type LabelStyleOverrides } from './Label.vars'
import clsx from 'clsx'
import css from './Label.module.css'
import type { Mode } from '@composites/comp.types'
import type { BoxSide } from '@typing/core.types'
import { cpsx } from '@utils/cpsx'

export type LabelSettings = {
  msg: string
  mode?: Mode
  el?: string
  position?: BoxSide | "center"
  styleVars?: LabelStyleOverrides
  presets?: LabelPreset[]
}
export default function Label({
  msg,
  el = "span",
  position = "bottom",
  styleVars,
  presets
}: LabelSettings) {

  return (
    <div className={clsx(css.labelwrapper,
      position === "left" ? css.left
        : position === "right" ? css.right
          : position === "top" ? css.top
            : position === "center" ? css.center
              : css.bottom,
      ...cpsx(presets, labelPresetMap))}
      style={svsx(styleVars ?? {}, labelVars, labelAlwaysAllowed)}>

      {React.createElement(
        el,
        { className: css.label },
        msg
      )}
    </div>
  )
}