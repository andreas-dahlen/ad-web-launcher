import clsx from 'clsx'
import css from './ButtonLabel.module.css'

type LabelProps = {
  msg: string
  position: "left" | "right"
}

export default function ButtonLabel({ msg, position }: LabelProps) {
  return (
    <span className={clsx(css.base, css[position])}>{msg}</span>
  )
}