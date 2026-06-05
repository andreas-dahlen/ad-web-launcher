import { useRef, useEffect, useMemo } from "react"
import { usePointerBridge } from '@hooks/usePointerBridge.ts'
import { useCarouselMotion } from "./hooks/useCarouselMotion.ts"
import { useCarouselSizing } from "./hooks/useCarouselSizing.ts"
import { useAugmentedScenes } from "./hooks/useAugmentedScenes.ts"
import { useCarouselStore } from './store/useCarouselStore.ts'
import { carouselStore } from './store/carouselStore.ts'
import { SceneContext } from './hooks/useSceneContext.ts'
import type { SceneRole } from '../../shared/typing/core.types.ts'
import carouselCss from './Carousel.module.css'
import clsx from 'clsx'
import { dasx } from '../../shared/utils/dataAttrs.ts'
import type { CarouselProps } from '@primitives/prim.types.ts'

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
  carouselDataAttrs,
  interactive = true
}: CarouselProps) {

  // ── Fully subscribe to the carousel store ─────────────────────────────
  const { settling, index, liveOffset, count, dragging, layout } = useCarouselStore(id)

  // ── Initialize count for mirror scenes ─────────────────────────────

  useEffect(() => {
    if (!interactive && scenes?.length)
      carouselStore.getState().setCount(id, scenes.length ?? sceneCount)
  }, [id, scenes?.length, interactive, sceneCount])

  // ── DOM reference & lane size ─────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  useCarouselSizing({ elRef: containerRef, sceneRef: itemRef, id })

  const axisSize = axis === "horizontal" ? layout.containerSize.width : layout.containerSize.height

  // ── Pointer forwarding for gestures ─────────────────────────────
  usePointerBridge({
    elRef: containerRef,
    disabled: !interactive,
    onReaction: (reaction) => {
      if (reaction.detail === 'swipeCommit' && onSwipeCommit) {
        onSwipeCommit(reaction.detail)
      }
    }
  })

  // ── Augmented scenes & stable slot management ─────────────────────────────
  const augmentedScenes = useAugmentedScenes(scenes ?? [], count)
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
    onTransitionEnd,
    styleForRole
  } = useCarouselMotion({
    store: { liveOffset, dragging, settling },
    horizontal: axis === "horizontal",
    axisSize,
    id
  })

  const setColor = (index: number) => {
    const sceneCount = 3
    const colorIndex = (index % sceneCount) + 1
    if (axis === 'horizontal') return `scene-col-${colorIndex}`
    return `wall-col-${colorIndex}`
  }

  return (
    <div
      className={carouselCss.carousel}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      ref={containerRef}
      {...dasx({
        id,
        type: "carousel",
        axis,
        frame: "carousel",
        lockNextAt,
        lockPrevAt,
        ...carouselDataAttrs
      })}
    >
      {renderSlots.map((slot) => {
        const Scene = augmentedScenes[slot.sceneIdx]

        return (
          <div
            key={slot.sceneIdx}
            ref={itemRef}
            className={clsx(carouselCss.scene, interactive && setColor(slot.sceneIdx))}
            style={styleForRole(slot.role)}
            data-role={slot.role}
            onTransitionEnd={onTransitionEnd}
          >
            <SceneContext.Provider value={{ sceneIndex: slot.sceneIdx, carouselId: id }}>
              <Scene />
            </SceneContext.Provider>
          </div>
        )
      })}
    </div>
  )
}