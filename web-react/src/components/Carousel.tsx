import { useRef, useEffect } from "react"
import { state } from "@interaction/state/stateManager"
import { usePointerForwarding } from "@interaction/bridge/bridge.ts"
import { useCarouselState } from "@interaction/state/carouselState.ts"
import { useCarouselMotion } from "@hooks/carousel/useCarouselMotion.ts"
import { useCarouselSizing } from "@hooks/carousel/useCarouselSizing.ts"
import { useCarouselScenes } from "@hooks/carousel/useCarouselScenes.ts"

interface CarouselProps {
  id: string
  axis: 'horizontal' | 'vertical'
  scenes: React.ComponentType[]
  className?: string // for any additional classes
  lockPrevAt?: number
  lockNextAt?: number
  reactSwipeCommit?: boolean
  onSwipeCommit?: (detail: unknown) => void
}

export default function Carousel({
  id,
  axis,
  scenes,
  className,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
}: CarouselProps) {

  useEffect(() => {
    state.ensure('carousel', id)
  }, [id])

  useEffect(() => {
    state.setCount('carousel', id, scenes.length)
  }, [id, scenes.length])

  const carouselRef = useRef<HTMLDivElement>(null)

  const lane = useCarouselState.useStore(s => s.lanes[id])

  const laneSize = useCarouselSizing({
    elRef: carouselRef,
    axis,
    id
  })

  usePointerForwarding({
    elRef: carouselRef,
    onReaction: (reaction) => {
      if (reaction.type === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  const { visibleScenes } = useCarouselScenes({
    scenes,
    laneState: lane ?? { index: 0 },
  })

  const {
    carouselStyle,
    styleForRole,
    onTransitionEnd
  } = useCarouselMotion({
    laneState: lane ?? { offset: 0, dragging: false, settling: false },
    laneSize,
    horizontal: axis === "horizontal",
    id
  })

  return (
    <div
      data-type="carousel"
      ref={carouselRef}
      style={carouselStyle}
      data-id={id}
      data-axis={axis}
      data-lock-prev-at={lockPrevAt ?? ''}
      data-lock-next-at={lockNextAt ?? ''}
      className={className}
      onTransitionEnd={onTransitionEnd}
    >
      {visibleScenes.map(({ sceneIndex, component: SceneComponent, role }) => (
        <div
          key={sceneIndex}
          className="scene-default"
          style={styleForRole(role)}
          data-role={role}
        >
          <SceneComponent />
        </div>
      ))}
    </div>
  )
}