import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useLaneSizing({ elRef, axisRef, swipeType, laneId }) {
  const laneSize = ref(0)
  let observer

  function updateLaneSize() {
    const el = elRef.value
    if (!el) return

    const horizontal = axisRef.value === 'horizontal'
    const trackSize = horizontal
      ? el.offsetWidth
      : el.offsetHeight

    laneSize.value = trackSize

    const gatedSize = horizontal
    ? el.offsetHeight
    : el.offsetWidth

    const finalSize = horizontal
      ? { x: trackSize, y: gatedSize }
      : { x: gatedSize, y: trackSize }

    state.setSize(swipeType, laneId.value, finalSize)
  }

  onMounted(() => {
    updateLaneSize() // initial measurement

    const el = elRef.value
    if (!el) return

    observer = new ResizeObserver(updateLaneSize)
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { laneSize }
}
