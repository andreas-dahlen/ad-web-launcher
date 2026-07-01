import clsx from 'clsx'
import css from './Button.module.css'
import type { LabelProps } from '@composites/Button/Button.types'
export default function ButtonLabel({ label, position, mode }: LabelProps) {


  //use mode to drive colors?
  const positioning = position ? position : "bottom"

  return (
    <span className={clsx(
      positioning === "bottom" && css.bottom,
      positioning === "top" && css.top,
      positioning === "left" && css.left,
      positioning === "right" && css.right,

    )}>
      {label}
    </span>
  )
}
