<template>
  <div class="scene-root c">
    <SwipeLane
      type="drag"
      class="relative-max-size"
      id="bottom-drag"
      axis="both"
      :reactSwipeCommit="true"
      >

      <template #drag-content>
        <div class="button-base move-col">Drag me</div>
      </template>
    </SwipeLane>
  </div>
</template>

<script setup>
import SwipeLane from '../../lanes/SwipeLane.vue'
defineOptions({ name: 'BottomMir3' })

// :snapX="snappingX"
// :snapY="snappingY"
// const snappingX = "100"
// const snappingY = "200"

</script>

<style scoped>
</style>