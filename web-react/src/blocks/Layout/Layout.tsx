import clsx from 'clsx'
import css from './Layout.module.css'
import { cpsx, svsx } from 'cascade'
import { layoutStyle, type LayoutPresets, type LayoutStyle } from 'cascade/generated'


export type LayoutSettings = {
  styleVars?: LayoutStyle
  presets?: LayoutPresets
}

type LayoutProps = LayoutSettings & {
  children: React.ReactNode
}

export function Layout({ children, styleVars, presets }: LayoutProps) {
  return (
    <div
      className={clsx(css.layout,
        cpsx(presets, css))}
      style={{ ...svsx(styleVars, layoutStyle) }}
    >
      {children}
    </div>
  )
}