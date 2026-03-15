import { useSizeState } from "../../interaction/state/sizeState"
import type { ChildrenProps } from "../../types/reactTS"

export default function DebugWrapper({ children }: ChildrenProps) {

  const { device, scale } = useSizeState.useStore((s) => ({
    device: s.device,
    scale: s.scale
  }))

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