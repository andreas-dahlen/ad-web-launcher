import { useMemo, useCallback } from "react"
import { APP_SETTINGS } from "@config/appSettings.ts"
import { state } from "@interaction/state/stateManager.ts"

type Role = "prev" | "current" | "next"

interface UseCarouselMotionProps {
  laneState: {
    offset: number
    dragging: boolean
    settling: boolean
  }
  laneSize: number
  horizontal: boolean
  id: string
}
const BASE_STYLE = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  willChange: 'transform'
} as const

const ROLE_OFFSETS = { prev: -1, current: 0, next: 1 } as const

export function useCarouselMotion({
  laneState,
  laneSize,
  horizontal,
  id
}: UseCarouselMotionProps) {

  const delta = laneState.offset ?? 0
  const isDragging = laneState.dragging
  const isSettling = laneState.settling

  const transition = useMemo(() => {
    if (isDragging || isSettling) return "none"
    return `transform ${APP_SETTINGS.swipeAnimationMs}ms cubic-bezier(0.25,0.46,0.45,0.94)`
  }, [isDragging, isSettling])

  const translate = useCallback(
    (v: number) =>
      horizontal
        ? `translate3d(${v}px,0,0)`
        : `translate3d(0,${v}px,0)`,
    [horizontal]
  )

  const styleForRole = useCallback(
    (role: Role) => {
      const multiplier = ROLE_OFFSETS[role] ?? 0

      return {
        ...BASE_STYLE,
        transform: translate(multiplier * laneSize + delta),
        transition
      }
    },
    [translate, laneSize, delta, transition]
  )

  const carouselStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      position: "relative" as const,
      overflow: "hidden",
      touchAction: "none" as const,
      transform: "translateZ(0)"
    }),
    []
  )

  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName !== "transform") return
      if (isSettling) return
      state.setPosition("carousel", id)
    },
    [id, isSettling]
  )

  return { styleForRole, carouselStyle, onTransitionEnd }
}