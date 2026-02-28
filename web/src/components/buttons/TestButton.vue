<template>
    <div class="test-button">
        <InputElement
        class="floating-btn"
            :data-state="interaction" 
            press 
            react-press 
            react-press-release 
            react-press-cancel 
            @press="onPress"
            @pressRelease="onPressRelease" 
            @pressCancel="onPressCancel">
            Fire Test Action
        </InputElement>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import InputElement from '../InputElement.vue'

const interaction = ref('idle')

function onPress() {
    interaction.value = 'pressed'
}
function onPressRelease() {
    interaction.value = 'released'
}
function onPressCancel() {
    interaction.value = 'cancel'
}

</script>

<style scoped>

.test-button {
    position: absolute;
    display: flex;
    justify-content: center;
    color: #f8fafc;
    width: 200px;
    height: 70px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.01em;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    touch-action: none;
    transition: background 120ms ease, transform 120ms ease;
}

.test-button :deep(.input-element) {
    display: inline-flex;
    align-items: center;
    background-color: black;
    border-radius: 10px;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.test-button :deep(.input-element[data-state='released']) {
    background-color: hotPink;
}

.test-button :deep(.input-element[data-state='pressed']) {
    background-color: chocolate;
}

.test-button :deep(.input-element[data-state='cancel']) {
    background-color: tomato;
}
</style>