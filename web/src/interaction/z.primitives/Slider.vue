<template>
  <div
    ref="sliderEl" 
    v-bind="$attrs" 
    :class="['slider-container-default', $attrs.class]"
    :data-id="id" 
    :data-axis="axis"
    data-type="slider" 
    :data-react-swipe="reactSwipe ? true : null"
    :data-react-swipe-start="reactSwipeStart ? true : null"
    :data-react-swipe-commit="reactSwipeCommit ? true : null">

    <div class="slider-track-default">
      <slot name="slider-track"></slot>
    </div>

    <div ref="thumbEl" class="thumb-default"
    :style="thumbStyle">
      <slot name="slider-content"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../state/stateManager'
import { useSliderSizing } from './composables/useLaneSizing'
import { usePointerForwarding } from '../bridge/bridge'
import { useSliderMotion } from './composables/useLaneMotion'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['volumeChange'])

const props = defineProps({
  id: { type: String, required: true },
  axis: { type: String, default: 'horizontal' },
  reactSwipe: { type: Boolean, default: false },
  reactSwipeStart: { type: Boolean, default: false },
  reactSwipeCommit: { type: Boolean, default: false }
})

const sliderEl = ref(null)
const thumbEl = ref(null)

const horizontal = computed(() => props.axis === 'horizontal')
const laneState = state.get('slider', props.id)
const lastEmitted = ref(null)

const dragging = computed(() => laneState.dragging ?? false)
const lanePosition = computed(() => state.getPosition('slider', props.id) ?? 0)
const laneConstraints = computed(() => state.getConstraints('slider', props.id) ?? { min: 0, max: 100 })
const laneSize = computed(() => {
  const size = state.getSize('slider', props.id)
  if (!size) return 0
  return horizontal.value ? size.x : size.y
})
const laneThumbSize = computed(() => {
  const size = state.getThumbSize('slider', props.id)
  if (!size) return 0
  return horizontal.value ? size.x : size.y
})

watchEffect(() => state.ensure('slider', props.id))

useSliderSizing({
  elRef: sliderEl,
  thumbRef: thumbEl,
  type: 'slider',
  id: computed(() => props.id)
})

usePointerForwarding({
  elRef: sliderEl,
  onReaction(e) {
    const event = e.detail?.event
    if (!event) return

    const shouldReact =
      (event === 'swipe' && props.reactSwipe) ||
      (event === 'swipeStart' && props.reactSwipeStart) ||
      (event === 'swipeCommit' && props.reactSwipeCommit)

    if (!shouldReact) return
    let value = Math.round(lanePosition.value)
    if (!horizontal.value) {
      const { min, max } = laneConstraints.value
      value = max - (value - min)
    }
    if (value === lastEmitted.value) return
    emit('volumeChange', value)
    lastEmitted.value = value
  }
})

const { thumbStyle } = useSliderMotion({
  lanePosition,
  laneConstraints,
  laneSize,
  laneThumbSize,
  dragging,
  horizontal
})
</script>

<style scoped>
.slider-container-default {
  position: relative;
  pointer-events: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider-track-default {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}


.thumb-default {
  position: absolute;
  will-change: transform;
}

.slider-container-default[data-axis="horizontal"] .thumb-default {
  left: 0;
}

.slider-container-default[data-axis="vertical"] .thumb-default {
  top: 0;
}
</style>
