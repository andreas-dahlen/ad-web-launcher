<template>
  <!-- ======================== CAROUSEL ======================== -->
  <div v-if="type === 'carousel'"
    ref="carouselEl" 
    :class="['carousel-default', $attrs.class]"
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

  <!-- ======================== SLIDER ======================== -->
  <div v-else-if="type === 'slider'"
    ref="sliderEl" 
    v-bind="$attrs" 
    :class="['slider-container-default', $attrs.class]"
    :data-lane="lane" 
    :data-axis="axis"
    data-swipe-type="slider" 
    :data-react-swipe="reactSwipe ? true : null"
    :data-react-swipe-start="reactSwipeStart ? true : null"
    :data-react-swipe-commit="reactSwipeCommit ? true : null">
    <div class="slider-track-default"></div>
    <div ref="thumbEl" 
    class="thumb-default"
    :style="thumbStyle">
      <slot name="slider-content"/>
    </div>
  </div>

  <!-- ======================== DRAG ======================== -->
  <div v-else-if="type === 'drag'"
    ref="dragEl" 
    :class="['non-interactive-default', $attrs.class]">
    <div ref="dragItem" 
      class="interactive-default"
      :style="itemStyle" 
      :data-lane="lane"
      data-axis="both" 
      data-swipe-type="drag"
      :data-locked="isLocked ? true : null"
      :data-snap-x="snapX"
      :data-snap-y="snapY"
      :data-react-swipe-commit="reactSwipeCommit ? true : null">
      <slot name="drag-content" :locked="isLocked"/>
    </div>
  </div>

  <!-- ======================== BUTTON ======================== -->
  <div v-else-if="type === 'button'"
    ref="buttonEl" 
    class="non-interactive-default">
    <div ref="buttonItem" 
    class="interactive-default"
      v-bind="$attrs"
      :data-lane="lane"
      :data-press="press ? true : null"
      :data-action="action || null"
      :data-react-press="reactPress ? true : null"
      :data-react-press-release="reactPressRelease ? true : null"
      :data-react-press-cancel="reactPressCancel ? true : null">
    </div>
    <slot name="button-content"/>
  </div>

  
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state } from '../interaction/state/stateManager'
import { useLaneSizing, useSliderSizing, useDragSizing } from './useLaneSizing'
import { usePointerForwarding } from '../interaction/bridge/bridge'
import { useCarouselMotion, useSliderMotion, useDragMotion } from './useLaneMotion'
import { useCarouselScenes } from './useLaneScenes'

const emit = defineEmits([
  'swipeCommit',
  'volumeChange',
  'press',
  'pressRelease',
  'pressCancel'
])

const props = defineProps({
  type: { type: String, required: true }, // 'carousel' | 'slider' | 'drag' | 'button'
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
  snapY: { type: Number, required: false },
  isLocked: { type: Boolean, default: false},
  //button
  action: String,
  press: { type: Boolean, default: false },
  reactPress: { type: Boolean, default: false },
  reactPressRelease: { type: Boolean, default: false },
  reactPressCancel: { type: Boolean, default: false }
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

/* ==========================================================
   BUTTON
   ========================================================== */

const buttonEl = ref(null)
const buttonItem = ref(null)

if (props.type === 'button') {
  usePointerForwarding({
    elRef: buttonItem,
    onReaction(e) {
      const type = e.detail?.type
      if (!type) return

      if (type === 'press' && !props.reactPress) return
      if (type === 'pressRelease' && !props.reactPressRelease) return
      if (type === 'pressCancel' && !props.reactPressCancel) return

      if (type === 'press') emit('press', e.detail)
      if (type === 'pressRelease') emit('pressRelease', e.detail)
      if (type === 'pressCancel') emit('pressCancel', e.detail)
    }
  })
}
</script>

<style scoped>
/* ======================== CAROUSEL ======================== */
.carousel-default {
  touch-action: none;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.scene-default {
  user-select: none;
  contain: layout style paint;
}

/* ======================== SLIDER ======================== */
.slider-container-default {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.slider-track-default {
  border-radius: 999px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.163);
  position: absolute;
}

.slider-container-default[data-axis="horizontal"] .slider-track-default {
  height: 10px;
  width: 90%;
  left: 5%;
  top: 50%;
  transform: translateY(-50%);
}

.slider-container-default[data-axis="vertical"] .slider-track-default {
  width: 10px;
  height: 90%;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.thumb-default {
  will-change: transform;
}

.slider-container-default[data-axis="horizontal"] .thumb-default {
  display: flex;
  height: 100%;
  align-items: center;
}

.slider-container-default[data-axis="vertical"] .thumb-default {
  display: flex;
  width: 100%;
  justify-content: center;
}

/* ======================== DRAG ======================== */
.non-interactive-default {
  position: relative;
  pointer-events: none;
}

.interactive-default {
  position: absolute;
  user-select: none;
  pointer-events: auto;
  /* contain: layout style paint; */
}

</style>
