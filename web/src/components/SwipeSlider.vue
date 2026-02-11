<template>
  <div
    ref="sliderEl"
    v-bind="$attrs"
    class="slider-container"
    :data-lane="lane"
    :data-axis="axis"
    data-swipe-type="slider"
    :data-react-swipe-commit="reactSwipeCommit ? true : null"
  >
    <div class="slider-track"></div>
    <div class="slider-thumb" :style="thumbStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { intentDeriver } from '../interaction/input/intentDeriver'

const emit = defineEmits(['swipeCommit'])

defineOptions({ name: 'SwipeSlider' })

const props = defineProps({
  lane: { type: String, required: true },
  axis: { type: String, default: 'horizontal' },
  reactSwipeCommit: { type: Boolean, default: false },
})

/* -------------------------
   Refs / basics
-------------------------- */
const sliderEl = ref(null)
const horizontal = computed(() => props.axis === 'horizontal')

/* -------------------------
   Slider state refs
-------------------------- */
const laneState = computed(() => state.get('slider', props.lane))
const laneOffset = computed(() => laneState.value?.offset ?? 0)
const dragging = computed(() => laneState.value?.dragging ?? false)
const lanePosition = computed(() => state.getPosition('slider', props.lane) ?? 0)
const laneConstraints = computed(() => state.getConstraints('slider', props.lane) ?? {min:0, max:100})
const laneSize = computed(() => state.getSize('slider', props.lane) ?? 0)

/* -------------------------
   Watch / ensure slider exists
-------------------------- */
watchEffect(() => state.ensure('slider', props.lane))

/* -------------------------
   Resize / lane size
-------------------------- */
function updateLaneSize() {
  if (!sliderEl.value) return
  const size = horizontal.value ? sliderEl.value.offsetWidth : sliderEl.value.offsetHeight
  const thumbEl = sliderEl.value.querySelector('.slider-thumb > *')
  const thumbSize = thumbEl ? (horizontal.value ? thumbEl.offsetWidth : thumbEl.offsetHeight) : 0
  state.setSize('slider', props.lane, size - thumbSize)
}

// Build a context snapshot for the gesture engine.
function buildContext(targetEl) {
  if (!targetEl) return null
  const ctx = {
    element: targetEl,
    laneId: props.lane,
    axis: props.axis,
    swipeType: 'slider',
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

  const size = state.getSize('slider', props.lane)
  const position = state.getPosition('slider', props.lane)
  const constraints = state.getConstraints('slider', props.lane)

  if (size !== undefined && size !== null) ctx.laneSize = size
  if (position !== undefined && position !== null) ctx.position = position
  if (constraints !== undefined && constraints !== null) ctx.constraints = constraints

  // If fallback selection is needed (e.g., alternative lane picking), add it here.
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
  updateLaneSize()
  observer = new ResizeObserver(updateLaneSize)
  observer.observe(sliderEl.value)

  const el = sliderEl.value
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
  const el = sliderEl.value
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
   Computed thumb style
-------------------------- */
const thumbStyle = computed(() => {
  // Map value to position
  const {min, max } = laneConstraints.value
  const value = lanePosition.value

  const range = max - min || 1

  const ratio = (value - min) / range
  const pos = ratio * laneSize.value + laneOffset.value

  return {
    transform: horizontal.value
      ? `translate3d(${pos}px,0,0)`
      : `translate3d(0,${pos}px,0)`,
    transition: dragging.value ? 'none' : 'transform 150ms ease-out',
    willChange: 'transform'
  }
})
</script>

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #eee;
  overflow: hidden;
  touch-action: none;
}

.slider-track {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.163);
  position: absolute;
}
.slider-container[data-axis="horizontal"] .slider-track {
  inset: 40% 5%;
}

.slider-container[data-axis="vertical"] .slider-track {
  inset: 5% 40%;
}

.slider-thumb {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
}

.slider-container[data-axis="horizontal"] .slider-thumb {
  align-items: center;
}

.slider-container[data-axis="vertical"] .slider-thumb {
  justify-content: center;
}
</style>
