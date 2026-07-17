import clsx from 'clsx'
import css from './Surface.module.css'
import { svsx } from '../../shared/sxCompiler/svsx'
import { surfacePreset, type SurfacePreset } from '@shared/generated/surface.preset'
import { cpsx } from '../../shared/sxCompiler/cpsx'
import { surfaceStyle, type SurfaceStyle } from '../../styleCompiler/schema/components'
import vars from '@styleCompiler/tokens.module.css'
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
      style={{ position: isInFlow ? "relative" : "absolute", ...svsx(styleVars ?? {}, surfaceStyle) }}
    >
      {children}
    </div>
  )
}