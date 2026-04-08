<template>
  <!-- <div class="phone"> -->
    <div class="app-content">
      <LaneWallpaper/>
      <LanesHorizontal/>
      <InteractiveLayer/>
      <OverlayLayer/>
      
    </div>
  <!-- </div> -->
</template>

<script setup>
import LaneWallpaper from '../layers/WallpaperLayer.vue'
import LanesHorizontal from '../layers/CarouselLayer.vue'
import InteractiveLayer from '../layers/InteractiveLayer.vue';
import OverlayLayer from '../layers/OverlayLayer.vue';
</script>

<style scoped>

.app-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0);
}

</style>
