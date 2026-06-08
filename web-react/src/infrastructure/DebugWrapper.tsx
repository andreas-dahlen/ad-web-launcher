import { useSize } from '../shared/stores/size.store'
import type { PropsWithChildren } from 'react'
import systemCss from './System.module.css'

export default function DebugWrapper({ children }: PropsWithChildren) {

  const { device, scale } = useSize()

  const frameStyle = {
    width: `${device.width}px`,
    height: `${device.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }

  return (
    <div className={systemCss.shell}>
      <div className={systemCss.frame} style={frameStyle}>
        {children}
      </div>
    </div >
  )
}