import clsx from 'clsx'
import css from './Visual.module.css'
import { svsx } from '../../shared/sxCompiler/svsx'

import { cpsx } from '../../shared/sxCompiler/cpsx'
import { visualStyle, type VisualStyle } from '@generated/tokenModules/visual.token'
import { visualPreset, type VisualPreset } from '@generated/presets/visual.preset'

export type VisualSettings = {
  styleVars?: VisualStyle
  presets?: VisualPreset[]
}

export function Visual({ styleVars, presets }: VisualSettings) {
  return (
    <div
      className={clsx(css.visual,
        ...cpsx(presets, visualPreset))}
      style={{ ...svsx(styleVars ?? {}, visualStyle) }}
    >
    </div>
  )
}