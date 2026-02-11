<template>
  <div
    ref="dragEl"
    class="drag-surface"
  >
    <div
      ref="dragItem"
      class="drag-item"
      :style="itemStyle"
      :data-lane="lane"
      data-axis="both"
      data-swipe-type="drag"
      :data-react-swipe-commit="reactSwipeCommit ? true : null"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { intentDeriver } from '../interaction/input/intentDeriver'

const emit = defineEmits(['swipeCommit'])

const props = defineProps({
  lane: { type: String, required: true },
  reactSwipeCommit: { type: Boolean, default: false }
})
/* -------------------------
   Refs / basics
-------------------------- */
const dragEl = ref(null)
const dragItem = ref(null)

/* -------------------------
Drag state refs
-------------------------- */
const laneState = computed(() => state.get('drag', props.lane))
const lanePosition = computed(() => laneState.value?.position ?? { x: 0, y: 0 })
const offset = computed(() => laneState.value?.offset ?? { x: 0, y: 0 })
const dragging = computed(() => laneState.value?.dragging ?? false)
/* -------------------------
   Watch / ensure drag exists
   -------------------------- */

   watchEffect(() => state.ensure('drag', props.lane))
/* -------------------------
   Resize / lane metrics
-------------------------- */
function updateLaneMetrics() {
  if (!dragEl.value || !dragItem.value) return

  // pixel dimensions
  const containerWidth = dragEl.value.offsetWidth
  const containerHeight = dragEl.value.offsetHeight
  const itemWidth = dragItem.value.offsetWidth
  const itemHeight = dragItem.value.offsetHeight

  // set constraints (logical min/max)
  state.setConstraints('drag', props.lane, {
    minX: 0,
    minY: 0,
    maxX: containerWidth - itemWidth,
    maxY: containerHeight - itemHeight
  })

  // set size (usable pixel space)
  state.setSize('drag', props.lane, {
    width: containerWidth - itemWidth,
    height: containerHeight - itemHeight
  })
}


// Build a context snapshot for drag gestures.
function buildContext(targetEl) {
  if (!targetEl) return null
  const ctx = {
    element: targetEl,
    laneId: props.lane,
    axis: 'both',
    swipeType: 'drag',
    reactions: {
      press: false,
      pressRelease: false,
      pressCancel: true,
      swipeStart: true,
      swipe: true,
      swipeCommit: true,
      swipeRevert: false,
      select: false,
      deselect: false
    }
  }

  const size = state.getSize('drag', props.lane)
  const position = state.getPosition('drag', props.lane)
  const constraints = state.getConstraints('drag', props.lane)

  if (size !== undefined && size !== null) ctx.laneSize = size
  if (position !== undefined && position !== null) ctx.position = position
  if (constraints !== undefined && constraints !== null) ctx.constraints = constraints

  // Add fallback element resolution here if alternate drag targets are needed.
  return ctx
}

// Pointer event forwarding — Vue owns DOM listeners, engine receives (x, y) only.
function handlePointerDown(e) {
  e.stopPropagation()
  e.currentTarget.setPointerCapture(e.pointerId)
  intentDeriver.onDown(e.clientX, e.clientY, buildContext(e.currentTarget))
}
function handlePointerMove(e) {
  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
  intentDeriver.onMove(e.clientX, e.clientY)
}
function handlePointerUp(e) {
  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
  intentDeriver.onUp(e.clientX, e.clientY)
}

let observer
onMounted(() => {
  updateLaneMetrics()
  observer = new ResizeObserver(updateLaneMetrics)
  observer.observe(dragEl.value)
  observer.observe(dragItem.value)

  const el = dragItem.value
  if (el) {
    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('reaction', onReaction)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  const el = dragItem.value
  if (el) {
    el.removeEventListener('pointerdown', handlePointerDown)
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerup', handlePointerUp)
    el.removeEventListener('pointercancel', handlePointerUp)
    el.removeEventListener('reaction', onReaction)
  }
})

/* -------------------------
Reaction handling
-------------------------- */
function onReaction(e) {
  if (!props.reactSwipeCommit) return
  if (e.detail?.type !== 'swipeCommit') return
  emit('swipeCommit', e.detail)
}

/* -------------------------
   Computed item style
-------------------------- */
const itemStyle = computed(() => {
  const x = (lanePosition.value?.x ?? 0) + (offset.value?.x ?? 0)
  const y = (lanePosition.value?.y ?? 0) + (offset.value?.y ?? 0)

  return {
    transform: `translate3d(${x}px, ${y}px, 0)`,
    transition: dragging.value ? 'none' : 'transform 180ms ease-out',
    willChange: 'transform'
  }
})
</script>

<style scoped>

.drag-surface {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 👈 CRITICAL */
  background-color: rgba(73, 153, 46, 0.75);
}

.drag-item {
  position: absolute;
  user-select: none;
  pointer-events: auto; /* 👈 only this receives input */
  contain: layout style paint;
}

</style>