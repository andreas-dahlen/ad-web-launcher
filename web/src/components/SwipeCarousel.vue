<template>
  <div
    ref="carouselEl"
    class="carousel"
    :style="carouselStyle"
    :data-lane="lane"
    :data-axis="axis"
    :data-swipe-type="'carousel'"
    :data-react-swipe-commit="reactSwipeCommit ? true : null"
  >
    <component
      v-if="totalScenes > 0"
      :is="prevScene"
      class="scene"
      :style="prevStyle"
    />
    <component
      v-if="totalScenes > 0"
      :is="currentScene"
      class="scene"
      :style="currentStyle"
      @transitionend="onTransitionEnd"
    />
    <component
      v-if="totalScenes > 0"
      :is="nextScene"
      class="scene"
      :style="nextStyle"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watchEffect, markRaw } from 'vue'
import { state } from '../interaction/state/stateManager'
import { APP_SETTINGS } from '../config/appSettings'
import { intentDeriver } from '../interaction/input/intentDeriver'

const emit = defineEmits(['swipeCommit'])

const carouselEl = ref(null)
const laneSize = ref(0)

function updateLaneSize() {
  if (!carouselEl.value) return
  const size = horizontal.value ? carouselEl.value.offsetWidth : carouselEl.value.offsetHeight
  laneSize.value = size
  state.setSize('carousel', props.lane, laneSize.value)
}

// Build a context snapshot for carousel gestures.
function buildContext(targetEl) {
  if (!targetEl) return null
  const ctx = {
    element: targetEl,
    laneId: props.lane,
    axis: props.axis,
    swipeType: 'carousel',
    reactions: {
      press: false,
      pressRelease: false,
      pressCancel: true,
      swipeStart: true,
      swipe: true,
      swipeCommit: true,
      swipeRevert: true,
      select: false,
      deselect: false
    }
  }

  const size = state.getSize('carousel', props.lane)
  const position = state.getPosition('carousel', props.lane)
  const constraints = state.getConstraints('carousel', props.lane)

  if (size !== undefined && size !== null) ctx.laneSize = size
  if (position !== undefined && position !== null) ctx.position = position
  if (constraints !== undefined && constraints !== null) ctx.constraints = constraints

  // If alternative scene targeting is needed, insert fallback resolution here.
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

function handleReaction(e) {
  if (!props.reactSwipeCommit) return
  if (e.detail?.type !== 'swipeCommit') return
  emit('swipeCommit', e.detail)
}

let observer
onMounted(() => {
  observer = new ResizeObserver(updateLaneSize)
  observer.observe(carouselEl.value)
  const el = carouselEl.value
  if (el) {
    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('reaction', handleReaction)
  }
})

onBeforeUnmount(() => {
  observer.disconnect()
  const el = carouselEl.value
  if (el) {
    el.removeEventListener('pointerdown', handlePointerDown)
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerup', handlePointerUp)
    el.removeEventListener('pointercancel', handlePointerUp)
    el.removeEventListener('reaction', handleReaction)
  }
})

const props = defineProps({
  lane: { type: String, required: true },
  scenes: { type: Array, required: true },
  axis: { type: String, default: 'horizontal' },
  reactSwipeCommit: { type: Boolean, default: false }
})

const horizontal = computed(() => props.axis === 'horizontal')
const laneState = computed(() => state.get('carousel', props.lane))

watchEffect(() => {
  state.setCount('carousel', props.lane, props.scenes.length)
})

/* -------------------------
   Scene indexes
-------------------------- */
const totalScenes = computed(() => props.scenes.length)
const index = computed(() => laneState.value.index)

const safeScenes = computed(() => props.scenes.map(s => markRaw(s)))
const currentScene = computed(() => safeScenes.value[index.value] || null)

const prevScene = computed(() => {
  if (!totalScenes.value) return null
  const prevIdx = (index.value - 1 + totalScenes.value) % totalScenes.value
  return safeScenes.value[prevIdx] || null
})

const nextScene = computed(() => {
  if (!totalScenes.value) return null
  const nextIdx = (index.value + 1) % totalScenes.value
  return safeScenes.value[nextIdx] || null
})

/* -------------------------
   Movement math - OPTIMIZED
   
   Performance notes:
   - Use translate3d() to force GPU compositing layer
   - Disable transition during drag (dragging=true) for instant response
   - Only apply transition when animating to final position
-------------------------- */
const delta = computed(() => laneState.value.offset || 0)
const isDragging = computed(() => laneState.value.dragging)

// CSS transition: none during drag, eased during animation
const transition = computed(() => {
  if (isDragging.value) return 'none'
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

const currentStyle = computed(() => ({ 
  ...baseStyle, 
  transform: translate(delta.value), 
  transition: transition.value 
}))

const prevStyle = computed(() => ({ 
  ...baseStyle, 
  transform: translate(-laneSize.value + delta.value),
  transition: transition.value 
}))

const nextStyle = computed(() => ({ 
  ...baseStyle, 
  transform: translate(laneSize.value + delta.value),
  transition: transition.value 
}))

const carouselStyle = computed(() => ({ 
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  touchAction: 'none',
  transform: 'translateZ(0)'
}))

/* -------------------------
   Commit after transition
-------------------------- */
function onTransitionEnd(e) {
  if (e.propertyName !== 'transform') return
  state.setPosition('carousel', props.lane)
}
</script>

<style scoped>
.carousel { 
  touch-action: none;
  /* GPU compositing hints */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.scene { 
  user-select: none;
  /* Prevent layout thrashing */
  contain: layout style paint;
}
</style>
