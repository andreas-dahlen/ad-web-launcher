import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useSliderSizing({
  elRef,
  thumbRef,
  laneId,
  swipeType = 'slider'
}) {
  let observer

  function updateMetrics() {
    const el = elRef.value
    const thumbEl = thumbRef.value
    if (!el) return
    /* -------------------------
            Main axis
    -------------------------- */
    
    const trackSize = { 
      x: el.offsetWidth, 
      y: el.offsetHeight
    }
    const thumbContent = thumbEl?.firstElementChild

    const thumbSize = { 
      x: thumbEl ? thumbContent.offsetWidth : 0, 
      y: thumbEl ? thumbContent.offsetHeight : 0}

    state.setSize(swipeType, laneId.value, trackSize)
    state.setThumbSize(swipeType, laneId.value, thumbSize)

    // const trackSize = horizontal
    //   ? el.offsetWidth
    //   : el.offsetHeight

    // const thumbEl = el.querySelector('.slider-thumb > *')
    // const thumbSize = thumbEl
    //   ? (horizontal ? thumbEl.offsetWidth : thumbEl.offsetHeight)
    //   : 0

    // const usableSize = Math.max(trackSize - thumbSize, 0)
    // laneSize.value = usableSize
    // /* -------------------------
    //         Gated axis
    // -------------------------- */
    // const thumbGate = thumbEl
    //   ? (horizontal ? thumbEl.offsetHeight : thumbEl.offsetWidth)
    //   : 0
    // /* -------------------------
    //         Finalization
    // -------------------------- */
    // const size = horizontal
    //   ? { x: usableSize, y: thumbGate }
    //   : { x: thumbGate, y: usableSize }

    // state.setSize(swipeType, laneId.value, size)
  }

  onMounted(() => {
    updateMetrics()
    observer = new ResizeObserver(updateMetrics)

    if (elRef.value) observer.observe(elRef.value)
    if (thumbRef.value) observer.observe(thumbRef.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })
}
