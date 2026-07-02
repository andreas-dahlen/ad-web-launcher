import type { BoxSide } from '@typing/core.types'
import type { LabelWeight, Mode } from '@typing/propUtils.types'
import type { JSX } from 'react/jsx-runtime'

export type LabelProps = LabelSettings & {
  msg: string
  mode: Mode
}

export type LabelSettings = {
  position?: BoxSide
}

export type Label = {
  msg: string
  MsgElement?: keyof JSX.IntrinsicElements
  position?: BoxSide
  weight?: LabelWeight
  spacing?: number
  children?: React.ReactNode
}