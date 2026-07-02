import type { BoxSide } from '@typing/core.types'
import { calcWeight, type LabelWeight } from '@typing/propUtils.types'
import React from 'react'
import type { JSX } from 'react/jsx-runtime'

type Label = {
  msg: string
  MsgElement?: keyof JSX.IntrinsicElements
  position?: BoxSide
  weight?: LabelWeight
  spacing?: number
  children?: React.ReactNode
}

export default function Label({
  msg,
  MsgElement = "p",
  position = "top",
  weight = "regular",
  spacing = 0,
  children
}: Label) {

  const solvedWeight = calcWeight(weight)

  const direction =
    position === "left" ? "row" :
      position === "right" ? "row-reverse" :
        position === "bottom" ? "column-reverse" :
          "column"

  return (
    <div style={{ display: "flex", flexDirection: direction, gap: spacing }}>
      {React.createElement(
        MsgElement,
        { style: { fontWeight: solvedWeight } },
        msg
      )}
      {children}
    </div>
  )
}