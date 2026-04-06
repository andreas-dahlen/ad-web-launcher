import { sizeStore, useSize } from '@interaction/stores/sizeState'
import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

export default function DebugWrapper({ children }: PropsWithChildren) {

  const { device, scale } = useSize()

  useEffect(() => {
    const handleResize = () => sizeStore.getState().update()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    </div >
  )
}