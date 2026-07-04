import clsx from 'clsx'
import css from './Surface.module.css'
import { stsx } from '@utils/slsx'
import { surfaceVars, type PresetMap, type SurfaceStyleOverrides } from './Surface.vars'
import type { Mode } from '@composites/comp.types'
type PanelBaseProps = {
  children: React.ReactNode
  styleVars?: SurfaceStyleOverrides
  mode?: Mode
  presets?: PresetMap[]
  className?: string
}

export function Surface({ children, styleVars, presets, className, mode }: PanelBaseProps) {
  return (
    <div
      className={clsx(className, css.surface, presets?.map(preset => css[preset]))}
      style={{ ...stsx(styleVars ?? {}, surfaceVars) }}
    >
      {children}
    </div>
  )
}