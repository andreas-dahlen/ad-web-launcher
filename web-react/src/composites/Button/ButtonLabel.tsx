import clsx from 'clsx'
import css from './Button.module.css'
import type { BoxSide } from '@typing/core.types'

type LabelProps = {
  msg: string
  position?: BoxSide
}

export default function ButtonLabel({ msg, position }: LabelProps) {

  const positioning = position ? position : "bottom"

  return (
    <span className={clsx(css[positioning])}>{msg}</span>
  )
}