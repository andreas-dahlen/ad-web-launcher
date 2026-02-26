<template>
    <div class="button-root">
        <TestButton />
    </div>
</template>

<script setup>
import TestButton from './TestButton.vue'
</script>

<style scoped>
.button-root {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(119, 255, 0);
}

</style>