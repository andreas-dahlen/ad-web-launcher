import type { Teleporter } from '@typeScript/propsType'
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