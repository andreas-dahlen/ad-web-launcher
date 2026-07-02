import clsx from 'clsx'
import css from './Label.module.css'
import type { LabelProps } from './Label.types'
export default function CompLabel({ msg, position, mode }: LabelProps) {
  //use mode to drive colors?
  const positioning = position ? position : "bottom"

  return (
    <span className={clsx(
      positioning === "bottom" && css.bottom,
      positioning === "top" && css.top,
      positioning === "left" && css.left,
      positioning === "right" && css.right,

    )}>
      {msg}
    </span>
  )
}