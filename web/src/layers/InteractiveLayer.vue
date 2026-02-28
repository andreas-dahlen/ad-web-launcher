<template>
  <div class="content-layer">
    <MirrorCarousel 
    sourceLane="wallpaper" 
    :scenes="emptyWallpaperScene" 
    axis="vertical" />
  </div>
  <div class="horizontal-layer">
    <MirrorCarousel 
    sourceLane="top" 
    :scenes="emptyTopScenes" 
    axis="horizontal" />

    <MirrorCarousel 
    sourceLane="mid" 
    :scenes="emptyMidScenes"
    axis="horizontal" />

    <MirrorCarousel 
    sourceLane="bottom" 
    :scenes="emptyBottomScenes" 
    axis="horizontal" />
  </div>
</template>

<script setup>
import MirrorCarousel from '../lanes/MirrorCarousel.vue';
import { LANES } from '../scenes/laneIndex';
import EmptyLane  from '../scenes/EmptyLane.vue'

const wallpaperScene = LANES.wallpaper
const topScenes = LANES.top
const midScenes = LANES.mid
const bottomScenes = LANES.bottom

const emptyTopScenes = new Array(topScenes.length).fill(EmptyLane)
const emptyMidScenes = new Array(midScenes.length).fill(EmptyLane)
const emptyBottomScenes = new Array(bottomScenes.length).fill(EmptyLane)
const emptyWallpaperScene = new Array(wallpaperScene.length).fill(EmptyLane)

console.log(emptyBottomScenes.length, emptyMidScenes.length, emptyBottomScenes.length, emptyWallpaperScene.length)

</script>

<style scoped>
.content-layer {
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* display: none; */
}

.content-layer>* {
  pointer-events: none;
}

.horizontal-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 50%;
  /* Stack lanes vertically */
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
</style>
