<template>
  <div class="interactive-layer">
    <MirrorCarousel 
    sourceId="top" 
    :scenes="topScenes" 
    axis="horizontal" />
    
    <MirrorCarousel 
    sourceId="mid" 
    :scenes="midScenes"
    axis="horizontal" />
    
    <MirrorCarousel 
    sourceId="bottom" 
    :scenes="bottomScenes" 
    axis="horizontal" />
  </div>
<div class="content-layer">
  <MirrorCarousel 
  sourceId="wallpaper" 
  :scenes="wallpaperScene" 
  axis="vertical" />
</div>
</template>

<script setup>
import MirrorCarousel from '../lanes/MirrorCarousel.vue';
import { MIRLANES } from '../scenes/laneIndex';
// import EmptyLane  from '../scenes/EmptyLane.vue'

const wallpaperScene = MIRLANES.wallpaper
const topScenes = MIRLANES.top
const midScenes = MIRLANES.mid
const bottomScenes = MIRLANES.bottom

// const emptyTopScenes = new Array(topScenes.length).fill(EmptyLane)
// const emptyMidScenes = new Array(midScenes.length).fill(EmptyLane)
// const emptyBottomScenes = new Array(bottomScenes.length).fill(EmptyLane)
// const emptyWallpaperScene = new Array(wallpaperScene.length).fill(EmptyLane)

</script>

<style scoped>
.content-layer {
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* display: none; */
  opacity: 100;
  background: none;
}
.interactive-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 100%;
  /* Stack lanes vertically */
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

</style>
