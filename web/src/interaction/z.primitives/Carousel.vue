<template>
  <div
    ref="carouselEl" 
    :class="['carousel-default', $attrs.class]"
    :style="carouselStyle" 
    :data-id="id" 
    :data-axis="axis"
    :data-lock-prev-at="lockPrevAt"
    :data-lock-next-at="lockNextAt"
    :data-type="'carousel'" 
    :data-react-swipe-commit="reactSwipeCommit ? true : null">

    <component 
      v-if="totalScenes > 0" 
      :is="prevScene" 
      class="scene-default"
      :style="prevStyle" />

    <component 
      v-if="totalScenes > 0" 
      :is="currentScene" 
      class="scene-default"
      :style="currentStyle"
      @transitionend="onTransitionEnd" />

    <component v-if="totalScenes > 0" 
      :is="nextScene" 
      class="scene-default"
      :style="nextStyle" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../state/stateManager'
import { useLaneSizing } from './composables/useLaneSizing'
import { usePointerForwarding } from '../bridge/bridge'
import { useCarouselMotion } from './composables/useLaneMotion'
import { useCarouselScenes } from './composables/useLaneScenes'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['swipeCommit'])

const props = defineProps({
  id: { type: String, required: true },
  axis: { type: String, default: 'horizontal' },
  scenes: { type: Array, default: () => [] },
  reactSwipeCommit: { type: Boolean, default: false },
  lockPrevAt: { type: Number, required: false },
  lockNextAt: { type: Number, required: false }
})

const carouselEl = ref(null)

const horizontal = computed(() => props.axis === 'horizontal')
const laneState = state.get('carousel', props.id)

// watchEffect(() => {
//   state.setLocks('carousel', props.id, {
//     lockPrevAt: props.lockPrevAt,
//     lockNextAt: props.lockNextAt
//   })
// })

watchEffect(() => {
  state.setCount('carousel', props.id, props.scenes.length)
})

const { laneSize } = useLaneSizing({
  elRef: carouselEl,
  axisRef: computed(() => props.axis),
  type: 'carousel',
  id: computed(() => props.id)
})

usePointerForwarding({
  elRef: carouselEl,
  onReaction(e) {
    if (!props.reactSwipeCommit) return
    if (e.detail?.event !== 'swipeCommit') return
    emit('swipeCommit', e.detail)
  }
})

const { totalScenes, currentScene, prevScene, nextScene } = useCarouselScenes({
  scenes: computed(() => props.scenes),
  laneState
})

const { currentStyle, prevStyle, nextStyle, carouselStyle, onTransitionEnd } = useCarouselMotion({
  laneState,
  laneSize,
  horizontal,
  id: props.id,
  indexP: props.indexP,
  indexN: props.indexN
})
</script>

<style scoped>
.carousel-default {
  touch-action: none;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.scene-default {
  user-select: none;
  contain: layout style paint;
}
</style>
