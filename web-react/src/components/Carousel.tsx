import { useRef, useMemo, type Component, type ComponentType } from "react"
import { useCarouselState } from "@interaction/state/carouselState.ts"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"

interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: ComponentType[]
  reactSwipeCommit?: boolean
  lockPrevAt?: number
  lockNextAt?: number
  className?: string // for any additional classes
  onSwipeCommit?: (detail: unknown) => void
}



export default function Carousel(props: CarouselProps) {

  const { id, axis, scenes } = props

  const carouselRef = useRef(null)

  const lane = useCarouselState.useStore(
    s => s.lanes[id]
  )

  const laneSize = useLaneSizing({
    elRef: carouselRef,
    axis,
    type: "carousel",
    id
  })

  usePointerForwarding({
    elRef: carouselRef,
    reactSwipeCommit: props.reactSwipeCommit,
    onSwipeCommit: props.onSwipeCommit
  })

  const { visibleScenes } = useCarouselScenes({
    scenes,
    lane
  })

  const {
    carouselStyle,
    styleForRole,
    onTransitionEnd
  } = useCarouselMotion({
    lane,
    laneSize,
    axis
  })

  return (
    <div ref={carouselRef} style={carouselStyle}>
      {visibleScenes.map(scene => (
        <Scene ... />
      ))}
    </div>
  )
}