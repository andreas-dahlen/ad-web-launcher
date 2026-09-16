import clsx from 'clsx'
import css from './Visual.module.css'
import { cpsx, svsx } from 'cascade'
import { visualStyle, type VisualPresets, type VisualStyle } from 'cascade/generated'

export type VisualSettings = {
  styleVars?: VisualStyle
  presets?: VisualPresets
}

export function Visual({ styleVars, presets }: VisualSettings) {
  return (
    <div
      className={clsx(css.visual,
        cpsx(presets, css))}
      style={{ ...svsx(styleVars, visualStyle) }}
    >
    </div>
  )
}