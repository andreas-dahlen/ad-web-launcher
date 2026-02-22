import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useLaneSizing({ elRef, axisRef, swipeType, laneId }) {
  const laneSize = ref(0)
  let observer

  function updateLaneSize() {
    const el = elRef.value
    if (!el) return

    const trackSize = {
      x: el.offsetWidth,
      y: el.offsetHeight
    }

    const sizeValue = axisRef.value === 'horizontal' ?
    el.offsetWidth
    : el.offsetHeight

    laneSize.value = sizeValue

    state.setSize(swipeType, laneId.value, trackSize)
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
