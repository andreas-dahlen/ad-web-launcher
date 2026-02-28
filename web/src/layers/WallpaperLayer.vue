<!-- scenes/LaneWallpaper.vue -->
<!--
  Background Wallpaper Layer
  
  Contains the wallpaper carousel that responds to vertical swipes.
  This is the bottom-most visual layer in the stack.
-->
<template>
  <div class="wallpaper-layer">
    <SwipeLane
      type="carousel"
      lane="wallpaper"
      :scenes="scenes"
      axis="vertical"
    />
  </div>
</template>

<script setup>
import SwipeLane from '../lanes/SwipeLane.vue'
import { LANES } from '../scenes/laneIndex'
// import EmptyLane from '../scenes/EmptyLane.vue';

// Wallpaper scenes from lane index
const scenes = LANES.wallpaper

// const emptyScenes = new Array(scenes.length).fill(EmptyLane)
</script>

<style scoped>
.wallpaper-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  opacity: 100;
  
  /* Lowest z-index - behind all other layers */
  /* z-index: 1; */
  
  /* GPU compositing */
  transform: translateZ(0);
  
  /* No pointer events - swipes handled by SwipeZones */
  pointer-events: none;
}

/* Allow carousel to receive events */
.wallpaper-layer :deep(.carousel) {
  pointer-events: auto;
}
</style>
