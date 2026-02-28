<!-- scenes/LanesHorizontal.vue -->
<!--
  Zone Layout - Contains all carousel lanes
  
  Layout Structure:
  - 3 horizontal lanes (top, mid, bottom) stacked vertically
  - Each lane is a SwipeLane with its own scenes
  
  The swipe detection zones are handled separately in SwipeZones.vue
  which overlays invisible touch areas with data-lane attributes.
-->
<template>
  <div class="carousel-layer">
    <SwipeLane
      type="carousel"
      lane="top"
      :scenes="topScenes"
      axis="horizontal"
    />

    <SwipeLane
      type="carousel"
      lane="mid"
      :scenes="midScenes"
      axis="horizontal"
    />

    <SwipeLane
      type="carousel"
      lane="bottom"
      :scenes="bottomScenes"
      axis="horizontal"

    />
  </div>
</template>

<script setup>
import SwipeLane from '../lanes/SwipeLane.vue'
import { LANES } from '../scenes/laneIndex'
// import EmptyLane  from '../scenes/EmptyLane.vue'

// Scene components for each lane
const topScenes = LANES.top
const midScenes = LANES.mid
const bottomScenes = LANES.bottom

// const emptyTopScenes = new Array(topScenes.length).fill(EmptyLane)
// const emptyMidScenes = new Array(midScenes.length).fill(EmptyLane)
// const emptyBottomScenes = new Array(bottomScenes.length).fill(EmptyLane)

</script>

<style scoped>
.carousel-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 50%;
  /* Stack lanes vertically */
  display: flex;
  flex-direction: column;
  
  /* Layer above background, below swipe zones */
  /* z-index: 1; */
  
  /* GPU compositing hint */
  transform: translateZ(0);
  
  /* Prevent any pointer events on container */
  pointer-events: none;
}

/* Allow pointer events on carousel children */
.carousel-layer :deep(.carousel) {
  pointer-events: auto;
}
</style>
