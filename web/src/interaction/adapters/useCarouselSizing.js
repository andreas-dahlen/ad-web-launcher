import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useLaneSizing({ elRef, axisRef, swipeType, laneId }) {
  const laneSize = ref(0)
  let observer

  function updateLaneSize() {
    const el = elRef.value
    if (!el) return

    const size = axisRef.value === 'horizontal'
      ? el.offsetWidth
      : el.offsetHeight

    laneSize.value = size
    state.setSize(swipeType, laneId.value, size)
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
