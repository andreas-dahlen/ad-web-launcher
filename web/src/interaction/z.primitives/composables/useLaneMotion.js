import { computed } from 'vue'
import { APP_SETTINGS } from '../../../app/config/appSettings'
import { state } from '../../state/stateManager'

/* -------------------------
   Carousel motion
   - styleForRole() maps each scene role to a positioned style
   - transition suppressed during drag AND settling
   - settling: brief flag set by carouselState.setPosition() that
     prevents CSS transitions while index/offset snap to new
     resting positions, avoiding a visible wrap-around flash
   - onTransitionEnd commits index via state.setPosition
-------------------------- */
export function useCarouselMotion({ laneState, laneSize, horizontal, id }) {
  const delta = computed(() => laneState.offset || 0)
  const isDragging = computed(() => laneState.dragging)
  const isSettling = computed(() => laneState.settling)

  // CSS transition: none during drag or settling, eased during animation
  const transition = computed(() => {
    if (isDragging.value || isSettling.value) return 'none'
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

  const roleOffsets = { prev: -1, current: 0, next: 1 }

  function styleForRole(role) {
    const multiplier = roleOffsets[role] ?? 0
    return computed(() => ({
      ...baseStyle,
      transform: translate(multiplier * laneSize.value + delta.value),
      transition: transition.value
    }))
  }

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
    // settling guard: if setPosition already fired (multiple transitionend
    // events from prev/current/next), skip duplicate commits
    if (isSettling.value) return
    state.setPosition('carousel', id)
  }

  return { styleForRole, carouselStyle, onTransitionEnd }
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
