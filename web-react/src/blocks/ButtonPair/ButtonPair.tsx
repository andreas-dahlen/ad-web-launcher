import type { Axis1D } from '@typing/core.types'
import type React from 'react'
import css from './ButtonPair.module.css'

type ButtonPairProps = {
  children: React.ReactNode
  axis: Axis1D
  spacing?: number
  label?: string
}

export default function ButtonPair({
  children,
  axis,
  spacing = 24,
  label
}: ButtonPairProps) {

  const direction =
    axis === "horizontal" ? "row" :
      axis === "vertical" ? "column" :
        "row"

  return (
    <>
      {label && <h2>{label}</h2>}
      <div
        className={css.pairPanel}
        style={{ gap: spacing, flexDirection: direction }}
      >
        {children}
      </div>
    </>
  )
}