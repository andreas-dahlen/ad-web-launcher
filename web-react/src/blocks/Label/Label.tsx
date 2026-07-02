import { calcWeight } from '@typing/propUtils.types'
import React from 'react'
import type { Label } from './Label.types'

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