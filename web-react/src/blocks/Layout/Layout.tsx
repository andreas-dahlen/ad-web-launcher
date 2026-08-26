import clsx from 'clsx'
import css from './Layout.module.css'
import { svsx } from '../../shared/sxCompiler/svsx'

import { cpsx } from '../../shared/sxCompiler/cpsx'
import { layoutStyle, type LayoutStyle } from '@generated/tokenModules/layout.token'
import { layoutPreset, type LayoutPreset } from '@generated/presets/layout.preset'

export type LayoutSettings = {
  styleVars?: LayoutStyle
  presets?: LayoutPreset[]
}

type LayoutProps = LayoutSettings & {
  children: React.ReactNode
}

export function Layout({ children, styleVars, presets }: LayoutProps) {
  return (
    <div
      className={clsx(css.layout,
        ...cpsx(presets, layoutPreset))}
      style={{ ...svsx(styleVars ?? {}, layoutStyle) }}
    >
      {children}
    </div>
  )
}