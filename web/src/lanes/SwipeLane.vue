<template>
  <!-- ======================== CAROUSEL ======================== -->
  <div v-if="type === 'carousel'"
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

  <!-- ======================== SLIDER ======================== -->
  <div v-else-if="type === 'slider'"
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

  <!-- ======================== DRAG ======================== -->
  <div v-else-if="type === 'drag'"
    ref="dragEl" 
    class="non-interactive-default">
    <div ref="dragItem" 
      class="interactive-default"
      :style="itemStyle" 
      :data-id="id"
      data-axis="both" 
      data-type="drag"
      :data-locked="locked || null"
      :data-snap-x="snapX"
      :data-snap-y="snapY"
      :data-react-swipe-commit="reactSwipeCommit ? true : null">
      <slot name="drag-content"/>
    </div>
  </div>

  <!-- ======================== BUTTON ======================== -->
  <div v-else-if="type === 'button'"
    ref="buttonEl" 
    class="non-interactive-default">
    <div ref="buttonItem" 
    class="interactive-default"
      v-bind="$attrs"
      :data-id="id"
      :data-press="press ? true : null"
      :data-action="action || null"
      :data-react-press="reactPress ? true : null"
      :data-react-press-release="reactPressRelease ? true : null"
      :data-react-press-cancel="reactPressCancel ? true : null">
      <slot name="button-content"/>
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

const emit = defineEmits([
  'swipeCommit',
  'volumeChange',
  'press',
  'pressRelease',
  'pressCancel'
])

const props = defineProps({
  type: { type: String, required: true }, // 'carousel' | 'slider' | 'drag' | 'button'
  id: { type: String, required: true },
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
  locked: { type: Boolean, default: false},
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

  ;({ totalScenes, currentScene, prevScene, nextScene } = useCarouselScenes({
    scenes: computed(() => props.scenes),
    laneState
  }))

  ;({ currentStyle, prevStyle, nextStyle, carouselStyle, onTransitionEnd } = useCarouselMotion({
    laneState,
    laneSize,
    horizontal,
    id: props.id,
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
  const laneState = state.get('drag', props.id)
  const lanePosition = computed(() => laneState.position ?? { x: 0, y: 0 })
  const offset = computed(() => laneState.offset ?? { x: 0, y: 0 })
  const dragging = computed(() => laneState.dragging ?? false)
  watchEffect(() => state.ensure('drag', props.id))

  useDragSizing({
    containerRef: dragEl,
    itemRef: dragItem,
    id: computed(() => props.id)
  })

  usePointerForwarding({
    elRef: dragItem,
    onReaction(e) {
      if (!props.reactSwipeCommit) return
      if (e.detail?.event !== 'swipeCommit') return
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
      const event = e.detail?.event
      if (!event) return

      if (event === 'press' && !props.reactPress) return
      if (event === 'pressRelease' && !props.reactPressRelease) return
      if (event === 'pressCancel' && !props.reactPressCancel) return

      if (event === 'press') emit('press', e.detail)
      if (event === 'pressRelease') emit('pressRelease', e.detail)
      if (event === 'pressCancel') emit('pressCancel', e.detail)
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

/* ======================== DRAG ======================== */
.non-interactive-default {
  position: relative;
  pointer-events: none;
}

.interactive-default {
  position: absolute;
  user-select: none;
  pointer-events: auto;
}

</style>
