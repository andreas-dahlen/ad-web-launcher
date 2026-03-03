<template>
    <DragOrSlot lane="mid3-button-1" class="scene-root">
      <template #drag-content>
        <div class="button-base move-col">Drag me</div>
      </template>
      
      <template #fallback>
        <div class="button-base locked-col">locked</div>
      </template>
    </DragOrSlot>
</template>

<script setup>
import DragOrSlot from '../../components/DragOrSlot.vue';
defineOptions({ name: 'MidMir3' })
</script>

<style scoped>
</style>
