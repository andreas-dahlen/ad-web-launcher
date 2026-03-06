<template>
  <div class="scene-root">
    TOP · B
    <SwipeLane
    type="button"
    class="button-base"
    lane="test-button-lane"
    press 
    react-press 
    react-press-release 
    react-press-cancel 
    @press="onPress"
    @pressRelease="onPressRelease" 
    @pressCancel="onPressCancel"
    :data-state="interaction" 
    
    >
    
      <template #button-content>
        <div class="test-button">
          Click Me!!!
        </div>
      </template>
    </SwipeLane>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SwipeLane from '../../lanes/SwipeLane.vue';
defineOptions({ name: 'TopMir2' })

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
  width: 150px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px, solid, black;
  border-radius: 8px;
  color: white;
  user-select: none;
  pointer-events: auto;
}

:deep(.interactive-default) {
    display: inline-flex;
    align-items: center;
    background-color: rgba(255, 105, 180, 0.416);
    border-radius: 10px;
    justify-content: center;
    width: 100%;
    height: 100%;
}

:deep(.interactive-default[data-state='released']) {
    background-color: hotPink;
}

:deep(.interactive-default[data-state='pressed']) {
    background-color: chocolate;
}

:deep(.interactive-default[data-state='cancel']) {
    background-color: tomato;
}

</style>
