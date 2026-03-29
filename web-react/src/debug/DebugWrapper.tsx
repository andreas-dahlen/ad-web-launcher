import { useSize } from '@interaction/zunstand/sizeState'
import type { PropsWithChildren } from 'react'

export default function DebugWrapper({ children }: PropsWithChildren) {

  const { device, scale } = useSize()

  const frameStyle = {
    width: `${device.width}px`,
    height: `${device.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }

  return (
    <div className="debug-shell">
      <div className="device-frame" style={frameStyle}>
        {children}
      </div>
    </div>
  )
}