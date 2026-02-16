// useDragSizing.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '../state/stateManager'

export function useDragSizing({ containerRef, itemRef, laneId }) {
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
    state.setSize('drag', laneId, size)
    state.setConstraints('drag', laneId, constraint)
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