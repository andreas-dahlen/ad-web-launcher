import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../interaction/state/stateManager'

export function useLaneSizing({ elRef, axisRef, type, id }) {
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

    state.setSize(type, id.value, trackSize)
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

export function useSliderSizing({
  elRef,
  thumbRef,
  id,
  type = 'slider'
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

    state.setSize(type, id.value, trackSize)
    state.setThumbSize(type, id.value, thumbSize)
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

export function useDragSizing({ containerRef, itemRef, id }) {
  const laneSize = ref({ width: 0, height: 0 })
  const constraints = ref({ minX: 0, maxX: 0, minY: 0, maxY: 0 })
  let observer

  function updateMetrics() {
    if (!containerRef.value || !itemRef.value) return

    const containerWidth = containerRef.value.offsetWidth
    const containerHeight = containerRef.value.offsetHeight
    const itemWidth = itemRef.value.offsetWidth
    const itemHeight = itemRef.value.offsetHeight

    const size = {
      width: containerWidth - itemWidth,
      height: containerHeight - itemHeight
    }

    const constraint = {
      minX: 0,
      minY: 0,
      maxX: size.width,
      maxY: size.height
    }

    laneSize.value = size
    constraints.value = constraint

    // forward to stateManager
    state.setSize('drag', id.value, size)
    state.setConstraints('drag', id.value, constraint)
  }

  onMounted(() => {
    updateMetrics() // initial measurement

    if (!containerRef.value || !itemRef.value) return
    observer = new ResizeObserver(updateMetrics)
    observer.observe(containerRef.value)
    observer.observe(itemRef.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { laneSize, constraints }
}
