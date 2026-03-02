<template>
  <!-- ======================== CAROUSEL ======================== -->
  <div v-if="type === 'carousel'"
    ref="carouselEl" class="carousel" 
    :style="carouselStyle" 
    :data-lane="lane" 
    :data-axis="axis"
    :data-lock-prev-at="lockPrevAt"
    :data-lock-next-at="lockNextAt"
    :data-swipe-type="'carousel'" 
    :data-react-swipe-commit="reactSwipeCommit ? true : null">

    <component 
      v-if="totalScenes > 0" 
      :is="prevScene" 
      class="scene" 
      :style="prevStyle" />

    <component 
      v-if="totalScenes > 0" 
      :is="currentScene" class="scene" 
      :style="currentStyle"
      @transitionend="onTransitionEnd" />

    <component v-if="totalScenes > 0" 
      :is="nextScene" class="scene" 
      :style="nextStyle" />
  </div>

  <!-- ======================== SLIDER ======================== -->
  <div v-else-if="type === 'slider'"
    ref="sliderEl" 
    v-bind="$attrs" class="slider-container" 
    :data-lane="lane" 
    :data-axis="axis"
    data-swipe-type="slider" 
    :data-react-swipe="reactSwipe ? true : null"
    :data-react-swipe-start="reactSwipeStart ? true : null"
    :data-react-swipe-commit="reactSwipeCommit ? true : null">
    <div class="slider-track"></div>
    <div ref="thumbEl" class="thumbEl" :style="thumbStyle">
      <slot name="slider-content"/>
    </div>
  </div>

  <!-- ======================== DRAG ======================== -->
  <div v-else-if="type === 'drag'"
    ref="dragEl" class="drag-surface">
    <div ref="dragItem" 
      class="drag-item" 
      :style="itemStyle" 
      :data-lane="lane"
      data-axis="both" 
      data-swipe-type="drag"
      :data-snap-x="snapX"
      :data-snap-y="snapY"
      :data-react-swipe-commit="reactSwipeCommit ? true : null">
      <slot name="drag-content"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { useLaneSizing, useSliderSizing, useDragSizing } from './useLaneSizing'
import { usePointerForwarding } from '../interaction/bridge/bridge'
import { useCarouselMotion, useSliderMotion, useDragMotion } from './useLaneMotion'
import { useCarouselScenes } from './useLaneScenes'

const emit = defineEmits(['swipeCommit', 'volumeChange'])

const props = defineProps({
  type: { type: String, required: true }, // 'carousel' | 'slider' | 'drag'
  lane: { type: String, required: true },
  axis: { type: String, default: 'horizontal' },
  // carousel
  scenes: { type: Array, default: () => [] },
  reactSwipeCommit: { type: Boolean, default: false },
  lockPrevAt: {type: Number, required: false}, 
  lockNextAt: {type: Number, required: false},
  // slider
  reactSwipe: { type: Boolean, default: false },
  reactSwipeStart: { type: Boolean, default: false },
  // drag
  snapX: { type: Number, required: false },
  snapY: { type: Number, required: false }
})

/* ==========================================================
   CAROUSEL
   ========================================================== */
const carouselEl = ref(null)

// Carousel-specific (guarded — composables only called when type matches)
let totalScenes, currentScene, prevScene, nextScene
let currentStyle, prevStyle, nextStyle, carouselStyle, onTransitionEnd

if (props.type === 'carousel') {
  const horizontal = computed(() => props.axis === 'horizontal')
  const laneState = state.get('carousel', props.lane)

  // watchEffect(() => {
  //   state.setLocks('carousel', props.lane, {
  //     lockPrevAt: props.lockPrevAt,
  //     lockNextAt: props.lockNextAt
  //   })
  // })

  watchEffect(() => {
    state.setCount('carousel', props.lane, props.scenes.length)
  })

  const { laneSize } = useLaneSizing({
    elRef: carouselEl,
    axisRef: computed(() => props.axis),
    swipeType: 'carousel',
    laneId: computed(() => props.lane)
  })

  usePointerForwarding({
    elRef: carouselEl,
    onReaction(e) {
      if (!props.reactSwipeCommit) return
      if (e.detail?.type !== 'swipeCommit') return
      emit('swipeCommit', e.detail)
    }
  })

  ;({ totalScenes, currentScene, prevScene, nextScene } = useCarouselScenes({
    scenes: computed(() => props.scenes),
    laneState
  }))

  ;({ currentStyle, prevStyle, nextStyle, carouselStyle, onTransitionEnd } = useCarouselMotion({
    laneState,
    laneSize,
    horizontal,
    lane: props.lane,
    indexP: props.indexP,
    indexN: props.indexN
  }))
}

/* ==========================================================
   SLIDER
   ========================================================== */
const sliderEl = ref(null)
const thumbEl = ref(null)
let thumbStyle

if (props.type === 'slider') {
  const horizontal = computed(() => props.axis === 'horizontal')
  const laneState = state.get('slider', props.lane)
  const lastEmitted = ref(null)

  const dragging = computed(() => laneState.dragging ?? false)
  const lanePosition = computed(() => state.getPosition('slider', props.lane) ?? 0)
  const laneConstraints = computed(() => state.getConstraints('slider', props.lane) ?? { min: 0, max: 100 })
  const laneSize = computed(() => {
    const size = state.getSize('slider', props.lane)
    if (!size) return 0
    return horizontal.value ? size.x : size.y
  })
  const laneThumbSize = computed(() => {
    const size = state.getThumbSize('slider', props.lane)
    if (!size) return 0
    return horizontal.value ? size.x : size.y
  })

  watchEffect(() => state.ensure('slider', props.lane))

  useSliderSizing({
    elRef: sliderEl,
    thumbRef: thumbEl,
    swipeType: 'slider',
    laneId: computed(() => props.lane)
  })

  usePointerForwarding({
    elRef: sliderEl,
    onReaction(e) {
      const type = e.detail?.type
      if (!type) return

      const shouldReact =
        (type === 'swipe' && props.reactSwipe) ||
        (type === 'swipeStart' && props.reactSwipeStart) ||
        (type === 'swipeCommit' && props.reactSwipeCommit)

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

  ;({ thumbStyle } = useSliderMotion({
    lanePosition,
    laneConstraints,
    laneSize,
    laneThumbSize,
    dragging,
    horizontal
  }))
}

/* ==========================================================
   DRAG
   ========================================================== */
const dragEl = ref(null)
const dragItem = ref(null)
let itemStyle

if (props.type === 'drag') {
  const laneState = state.get('drag', props.lane)
  const lanePosition = computed(() => laneState.position ?? { x: 0, y: 0 })
  const offset = computed(() => laneState.offset ?? { x: 0, y: 0 })
  const dragging = computed(() => laneState.dragging ?? false)

  watchEffect(() => state.ensure('drag', props.lane))

  useDragSizing({
    containerRef: dragEl,
    itemRef: dragItem,
    laneId: computed(() => props.lane)
  })

  usePointerForwarding({
    elRef: dragItem,
    onReaction(e) {
      if (!props.reactSwipeCommit) return
      if (e.detail?.type !== 'swipeCommit') return
      emit('swipeCommit', e.detail)
    }
  })

  ;({ itemStyle } = useDragMotion({
    lanePosition,
    offset,
    dragging
  }))
}
</script>

<style scoped>
/* ======================== CAROUSEL ======================== */
.carousel {
  touch-action: none;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.scene {
  user-select: none;
  contain: layout style paint;
}

/* ======================== SLIDER ======================== */
.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #eee;
  touch-action: none;
  pointer-events: auto;
}

.slider-track {
  border-radius: 999px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.163);
  position: absolute;
}
.slider-container[data-axis="horizontal"] .slider-track {
  height: 10px;
  width: 90%;
  left: 5%;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}
.slider-container[data-axis="vertical"] .slider-track {
  width: 10px;
  height: 90%;
  top: 5%;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.thumbEl {
  will-change: transform;
}
.slider-container[data-axis="horizontal"] .thumbEl {
  display: flex;
  height: 100%;
  align-items: center;
}
.slider-container[data-axis="vertical"] .thumbEl {
  display: flex;
  width: 100%;
  justify-content: center;
}

/* ======================== DRAG ======================== */
.drag-surface {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.drag-item {
  position: absolute;
  user-select: none;
  pointer-events: auto;
  contain: layout style paint;
  z-index: 10;
}
</style>
