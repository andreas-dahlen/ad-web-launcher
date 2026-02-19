import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useSliderSizing({
  elRef,
  axisRef,
  laneId,
  swipeType = 'slider'
}) {
  const laneSize = ref(0)
  let observer

  function updateMetrics() {
    const el = elRef.value
    if (!el) return
    /* -------------------------
            Main axis
    -------------------------- */
    const horizontal = axisRef.value === 'horizontal'
    const trackSize = horizontal
      ? el.offsetWidth
      : el.offsetHeight

    const thumbEl = el.querySelector('.slider-thumb > *')
    const thumbSize = thumbEl
      ? (horizontal ? thumbEl.offsetWidth : thumbEl.offsetHeight)
      : 0

    const usableSize = Math.max(trackSize - thumbSize, 0)
    laneSize.value = usableSize
    /* -------------------------
            Gated axis
    -------------------------- */
    const thumbGate = thumbEl
      ? (horizontal ? thumbEl.offsetHeight : thumbEl.offsetWidth)
      : 0
    /* -------------------------
            Finalization
    -------------------------- */
    const size = horizontal
      ? { x: usableSize, y: thumbGate }
      : { x: thumbGate, y: usableSize }

    state.setSize(swipeType, laneId.value, size)
  }

  onMounted(() => {
    updateMetrics()

    const el = elRef.value
    if (!el) return

    observer = new ResizeObserver(updateMetrics)
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { laneSize }
}
