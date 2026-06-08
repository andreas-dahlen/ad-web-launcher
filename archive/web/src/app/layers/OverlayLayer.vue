<template>
    <div class="interactive-layer">
        <DragGridVisual/>
    </div>
</template>

<script setup>
import DragGridVisual from '../components/DragGridVisual.vue';
</script>

<style scoped>
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
