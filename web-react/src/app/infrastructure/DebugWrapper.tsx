import { sizeStore } from '../../shared/state/stores/size.store'
import type { PropsWithChildren } from 'react'
import css from './System.module.css'

export default function DebugWrapper({ children }: PropsWithChildren) {

  const device = sizeStore(s => s.device)
  const scale = sizeStore(s => s.scale)

  const frameStyle = {
    width: `${device.width}px`,
    height: `${device.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }

  return (
    <div className={css.shell}>
      <div className={css.frame} style={frameStyle}>
        {children}
      </div>
    </div >
  )
}