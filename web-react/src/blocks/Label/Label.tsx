import React from 'react'
import type { LabelSettings } from './Label.types'
import { stsx } from '@utils/slsx'
import { labelVars } from './Label.vars'
import clsx from 'clsx'
import css from './Label.module.css'

export default function Label({
  msg,
  el = "span",
  position = "bottom",
  styleVars,
  classPreset
}: LabelSettings) {

  return (
    <div className={clsx(css.labelwrapper,
      position === "left" ? css.left
        : position === "right" ? css.right
          : position === "top" ? css.top
            : position === "center" ? css.center
              : css.bottom,
      classPreset)}
      style={stsx(styleVars ?? {}, labelVars)}>

      {React.createElement(
        el,
        { className: css.label },
        msg
      )}
    </div>
  )
}