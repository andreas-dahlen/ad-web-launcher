import { useRef, useEffect, useMemo } from "react"
import { usePointerBridge } from '../../hooks/pointerBridge.ts'
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import { useCarouselStore } from './hooks/useCarouselStore.ts'
import { carouselStore } from '../../../stores/carouselStore.ts'
import type { SceneRole } from '@typeScript/primitiveType.ts'
import type { CarouselProps } from '@typeScript/propsType.ts'

interface Slot {
  sceneIdx: number
  role: SceneRole
}

export default function Carousel({
  id,
  axis,
  scenes,
  sceneCount,
  lockPrevAt,
  lockNextAt,
  onSwipeCommit,
  interactive = true
}: CarouselProps) {

  // ── Fully subscribe to the carousel store ─────────────────────────────
  const { settling, index, offset, count, dragging, size } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ─────────────────────────────

  useEffect(() => {
    if (!interactive && scenes?.length)
      carouselStore.getState().setCount(id, scenes.length ?? sceneCount)
  }, [id, scenes?.length, interactive, sceneCount])

  // ── DOM reference & lane size ─────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: carouselRef, axis, id })

  const axisSize = axis === "horizontal" ? size.x : size.y

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: carouselRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail?.event === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ─────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes ?? [], interactive, count)
  const total = augmentedScenes.length

  const slots: Slot[] = useMemo(() => {
    if (total === 0) return []
    const prevIdx = (index - 1 + total) % total
    const nextIdx = (index + 1) % total
    return [
      { sceneIdx: prevIdx, role: "prev" as const },
      { sceneIdx: index, role: "current" as const },
      { sceneIdx: nextIdx, role: "next" as const },
    ]
  }, [index, total])

  // Sort by sceneIdx so React keys stay in stable DOM order.
  // Prevents DOM reordering which resets CSS animations on moved nodes.
  const renderSlots = useMemo(
    () => [...slots].sort((a, b) => a.sceneIdx - b.sceneIdx),
    [slots]
  )

  // ── Carousel motion / styling ─────────────────────────────
  const {
    styleForRole } = useCarouselMotion({
      store: { offset, dragging, settling },
      horizontal: axis === "horizontal",
      axisSize
    })

  const setColor = (index: number) => {
    const sceneCount = 3
    const colorIndex = (index % sceneCount) + 1
    if (axis === 'horizontal') return `scene-col-${colorIndex}`
    return `wall-col-${colorIndex}`
  }

  return (
    <div
      data-type="carousel"
      ref={carouselRef}
      className={`carousel`}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      data-id={id}
      data-axis={axis}
      data-lock-prev-at={lockPrevAt ?? ''}
      data-lock-next-at={lockNextAt ?? ''}
    >
      {renderSlots.map((slot) => {
        const Scene = augmentedScenes[slot.sceneIdx]

        return (
          <div
            className={`scene ${interactive ? setColor(slot.sceneIdx) : ''}`}
            key={slot.sceneIdx}
            style={styleForRole(slot.role)}
            data-role={slot.role}
          >
            <Scene />
          </div>
        )
      })}
    </div>
  )
}