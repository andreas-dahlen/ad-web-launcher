import type { Axis1D } from '../../shared/types/core.types'
import React from 'react'

type ButtonPairProps = {
  children: React.ReactNode
  axis: Axis1D
  spacing?: number
  middle?: React.ReactNode
}

export default function ButtonPair({
  children,
  axis,
  spacing = 0,
  middle
}: ButtonPairProps) {

  const directionMap: Record<Axis1D, "row" | "column"> = ({
    horizontal: "row",
    vertical: "column"
  })
  const direction = directionMap[axis ?? "horizontal"]

  const childArray = React.Children.toArray(children)
  const isPrimitive = typeof middle === "string" || typeof middle === "number"

  return (
    <>
      <div
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