import { computed } from 'vue'
import { APP_SETTINGS } from '../config/appSettings'
import { state } from '../interaction/state/stateManager'

/* -------------------------
   Carousel motion
   - prev/current/next scene styles
   - transition toggle (none during drag, eased otherwise)
   - onTransitionEnd commits index
-------------------------- */
export function useCarouselMotion({ laneState, laneSize, horizontal, id }) {
  const delta = computed(() => laneState.offset || 0)
  const isDragging = computed(() => laneState.dragging)

  // CSS transition: none during drag, eased during animation
  const transition = computed(() => {
    if (isDragging.value) return 'none'
    return `transform ${APP_SETTINGS.swipeAnimationMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  })

  // Use translate3d for GPU acceleration
  const translate = (v) => horizontal.value
    ? `translate3d(${v}px, 0, 0)`
    : `translate3d(0, ${v}px, 0)`

  const baseStyle = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    willChange: 'transform'
  }

  const currentStyle = computed(() => ({
    ...baseStyle,
    transform: translate(delta.value),
    transition: transition.value
  }))

  const prevStyle = computed(() => ({
    ...baseStyle,
    transform: translate(-laneSize.value + delta.value),
    transition: transition.value
  }))

  const nextStyle = computed(() => ({
    ...baseStyle,
    transform: translate(laneSize.value + delta.value),
    transition: transition.value
  }))

  const carouselStyle = computed(() => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'none',
    transform: 'translateZ(0)'
  }))

  function onTransitionEnd(e) {
    if (e.propertyName !== 'transform') return
    state.setPosition('carousel', id)
  }

  return { currentStyle, prevStyle, nextStyle, carouselStyle, onTransitionEnd }
}

/* -------------------------
   Slider motion
   - maps logical value → thumb pixel position
   - transition toggle
-------------------------- */
export function useSliderMotion({ lanePosition, laneConstraints, laneSize, laneThumbSize, dragging, horizontal }) {
  const thumbStyle = computed(() => {
    // Map value to position
    const { min, max } = laneConstraints.value
    const value = lanePosition.value

    const range = max - min || 1

    const ratio = (value - min) / range
    // Use usable space (track - thumb), same coordinate space as solver
    const usable = Math.max(laneSize.value - laneThumbSize.value, 0)
    const pos = ratio * usable

    return {
      transform: horizontal.value
        ? `translate3d(${pos}px,0,0)`
        : `translate3d(0,${pos}px,0)`,
      transition: dragging.value ? 'none' : 'transform 150ms ease-out',
      willChange: 'transform'
    }
  })

  return { thumbStyle }
}

/* -------------------------
   Drag motion
   - position + live offset → translate3d
   - transition toggle
-------------------------- */
export function useDragMotion({ lanePosition, offset, dragging }) {
  const itemStyle = computed(() => {
    const x = (lanePosition.value?.x ?? 0) + (offset.value?.x ?? 0)
    const y = (lanePosition.value?.y ?? 0) + (offset.value?.y ?? 0)

    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: dragging.value ? 'none' : 'transform 180ms ease-out',
      willChange: 'transform'
    }
  })

  return { itemStyle }
}
