<template>
  <div class="scene-root">
    <SwipeLane
      type="drag"
      class="relative-max-size"
      id="top-drag-test"
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
import SwipeLane from '../../../interaction/z.primitives/drag.vue'
defineOptions({ name: 'TopMir3' })
</script>

<style scoped>
</style>
