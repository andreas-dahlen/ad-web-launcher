import clsx from 'clsx'
import css from './Visual.module.css'
import { cpsx, svsx, visualStyle, type VisualPresets, type VisualStyle } from 'cascade'

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