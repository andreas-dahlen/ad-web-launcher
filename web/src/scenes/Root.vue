<template>
  <!-- <div class="phone"> -->
    <div class="app-content">
      <LaneWallpaper/>
      <LanesHorizontal/>
      <contentLayer/>
    </div>
  <!-- </div> -->
</template>

<script setup>
import LaneWallpaper from '../domTree/WallpaperLayer.vue'
import LanesHorizontal from '../domTree/CarouselLayer.vue'
import contentLayer from '../domTree/InteractiveLayer.vue'
</script>

<style scoped>
.phone {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
}

.app-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: hotpink;
}

</style>
