import { createPortal } from 'react-dom'

export type Teleporter = {
  children: React.ReactNode
  targetEl: HTMLElement
  toPortal: boolean
}
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