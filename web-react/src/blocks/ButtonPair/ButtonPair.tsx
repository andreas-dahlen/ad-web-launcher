import type { Axis1D } from '@typing/core.types'
import React from 'react'
import css from './ButtonPair.module.css'

type ButtonPairProps = {
  children: React.ReactNode
  axis: Axis1D
  spacing?: number
  middle?: React.ReactNode
}

export default function ButtonPair({
  children,
  axis,
  spacing = 24,
  middle
}: ButtonPairProps) {

  const direction =
    axis === "horizontal" ? "row" :
      axis === "vertical" ? "column" :
        "row"

  const childArray = React.Children.toArray(children)
  const isPrimitive = typeof middle === "string" || typeof middle === "number"

  return (
    <>
      <div
        className={css.pairPanel}
        style={{ gap: spacing, flexDirection: direction }}
      >
        {childArray[0]}
        {middle && (
          isPrimitive
            ? <span>{middle}</span>
            : middle
        )}
        {childArray[1]}
      </div>
    </>
  )
}