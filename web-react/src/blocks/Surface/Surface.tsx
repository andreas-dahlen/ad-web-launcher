import clsx from 'clsx'
import css from './Surface.module.css'
import { svsx } from '@utils/svsx'
import { surfacePreset, type SurfacePreset, type SurfaceStyle } from './Surface.vars'
import { cpsx } from '@utils/cpsx'
import { surface } from '../../styleSystem/schema/components'
import vars from '../../styleSystem/tokens.module.css'
type PanelBaseProps = {
  children: React.ReactNode
  styleVars?: SurfaceStyle
  // mode?: Mode
  presets?: SurfacePreset[]
  isInFlow?: boolean
}

export function Surface({ children, styleVars, presets, isInFlow = true }: PanelBaseProps) {
  return (
    <div
      className={clsx(vars.surfaceCompiler, css.surface,
        ...cpsx(presets, surfacePreset))}
      style={{ position: isInFlow ? "relative" : "absolute", ...svsx(styleVars ?? {}, surface) }}
    >
      {children}
    </div>
  )
}