import clsx from 'clsx'
import css from './PanelBase.module.css'
type PanelBaseProps = {
  children: React.ReactNode
  className?: string
}

export function PanelBase({ children, className }: PanelBaseProps) {
  return (
    <div className={clsx(css.panel, className)}>
      {children}
    </div>
  )
}