<template>
    <div class="button-root" lane="top">
        <TestButton lane="top" :scenes="topScenes" />
    </div>
</template>

<script setup>
import TestButton from './TestButton.vue'
import { LANES } from '../lanes/laneIndex'
defineOptions({ name: 'TopA' })
const topScenes = LANES.top
</script>

<style scoped>
.button-root {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(119, 255, 0);
}

.button-root {

}
</style>