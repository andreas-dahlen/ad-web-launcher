import clsx from 'clsx'
import css from './Surface.module.css'
import { svsx } from '@utils/svsx'
import { surfaceVars, surfacePresetMap, surfaceAlwaysAllowed } from './Surface.vars'
import type { SurfacePreset, SurfaceStyleOverrides } from './Surface.vars'
// import type { Mode } from '@composites/comp.types'
import { cpsx } from '@utils/cpsx'
type PanelBaseProps = {
  children: React.ReactNode
  styleVars?: SurfaceStyleOverrides
  // mode?: Mode
  presets?: SurfacePreset[]
  isInFlow?: boolean
}

export function Surface({ children, styleVars, presets, isInFlow = true }: PanelBaseProps) {
  return (
    <div
      className={clsx(css.surface, ...cpsx(presets, surfacePresetMap))}
      style={{ position: isInFlow ? "relative" : "absolute", ...svsx(styleVars ?? {}, surfaceVars, surfaceAlwaysAllowed) }}
    >
      {children}
    </div>
  )
}