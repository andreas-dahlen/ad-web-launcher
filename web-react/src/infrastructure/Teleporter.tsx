import type { Teleporter } from '@composites/comp.types'
import { createPortal } from 'react-dom'
export default function Teleporter(
  { children,
    targetEl,
    toPortal = false

  }: Teleporter) {

  return (
    toPortal
      ? { children }
      : createPortal(
        children
        , targetEl)
  )
}