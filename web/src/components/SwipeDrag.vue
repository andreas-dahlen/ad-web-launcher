<template>
  <div ref="dragEl" class="drag-surface">
    <div ref="dragItem" 
      class="drag-item" 
      :style="itemStyle" 
      :data-lane="lane"
      data-axis="both" 
      data-swipe-type="drag"
      :data-react-swipe-commit="reactSwipeCommit ? true : null">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { useDragSizing } from '../interaction/sizing/useDragSizing'
import { usePointerForwarding } from '../interaction/input/usePointerForwarding'

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
Lane / drag state
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
   Lane sizing
-------------------------- */
useDragSizing({
  containerRef: dragEl,
  itemRef: dragItem,
  laneId: computed(() => props.lane)
})
/* -------------------------
   Gesture forwarding (EXTRACTED)
-------------------------- */
usePointerForwarding({
  elRef: dragItem,
  onReaction: handleReaction
})
/* -------------------------
Reaction handling
-------------------------- */
function handleReaction(e) {
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
  pointer-events: none;
  /* 👈 CRITICAL */
  background-color: rgba(73, 153, 46, 0.75);
}

.drag-item {
  position: absolute;
  user-select: none;
  pointer-events: auto;
  /* 👈 only this receives input */
  contain: layout style paint;
}
</style>