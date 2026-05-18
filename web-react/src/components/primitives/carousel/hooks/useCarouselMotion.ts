import { useMemo, useCallback } from "react"
import { APP_CONFIG } from '@config/appConfig'

type Role = "prev" | "current" | "next"

interface UseCarouselMotionProps {
  store: {
    offset: number
    dragging: boolean
    settling: boolean
  }
  axisSize: number
  horizontal: boolean
  // onSettled?: () => void
}

const ROLE_OFFSETS = { prev: -1, current: 0, next: 1 } as const

export function useCarouselMotion({
  store,
  axisSize,
  horizontal,
  // onSettled
}: UseCarouselMotionProps) {

  const delta = store.offset ?? 0
  const isDragging = store.dragging ?? false
  const isSettling = store.settling ?? false

  const transition = useMemo(() => {
    if (isDragging || isSettling) return "none"
    return `transform ${APP_CONFIG.swipeAnimationMs}ms cubic-bezier(0.25,0.46,0.45,0.94)`
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
        transform: translate(multiplier * axisSize + delta),
        transition
      }
    },
    [translate, axisSize, delta, transition]
  )

  // const lastFiredRef = useRef(0)
  // const onTransitionEnd = useCallback((e: React.TransitionEvent) => {
  //   if (e.propertyName !== 'transform') return
  //   const now = Date.now()
  //   if (now - lastFiredRef.current < 100) return
  //   lastFiredRef.current = now
  //   onSettled?.()
  // }, [onSettled])

  // return { styleForRole, onTransitionEnd }
  return { styleForRole }
}