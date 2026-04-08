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

    <!-- Keyed v-for: Vue matches by sceneIndex so components are
         reused (not unmounted/remounted) when the lane index changes,
         preserving internal animations and component state. -->
    <div
      v-for="entry in styledScenes"
      :key="entry.sceneIndex"
      class="scene-default"
      :style="entry.style"
      @transitionend="onTransitionEnd">
      <component :is="entry.component" />
    </div>
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

const { visibleScenes } = useCarouselScenes({
  scenes: computed(() => props.scenes),
  laneState
})

const { styleForRole, carouselStyle, onTransitionEnd } = useCarouselMotion({
  laneState,
  laneSize,
  horizontal,
  id: props.id
})

// Attach computed style to each visible scene entry by role
const roleStyles = {
  prev: styleForRole('prev'),
  current: styleForRole('current'),
  next: styleForRole('next')
}
const styledScenes = computed(() =>
  visibleScenes.value.map(entry => ({
    ...entry,
    style: roleStyles[entry.role].value
  }))
)
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
