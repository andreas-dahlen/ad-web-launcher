<template>
  <div class="scene-root">

    <SwipeLane
      type="drag"
      class="relative-max-size"
      lane="mid-drag"
      :reactSwipeCommit="true"
      :locked="USER_SETTINGS.dragLock"
      >
      <template #drag-content>
        <div class="relative-max-size"
        
        >

        <SwipeLane
          type="button"
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
            <div>hello</div>
          </template> 
        </SwipeLane>

        </div>
      </template>
    </SwipeLane>

  </div> 
</template>

<script setup>
import { USER_SETTINGS } from '../../config/appSettings';
import SwipeLane from '../../lanes/SwipeLane.vue';
import { ref } from 'vue';
defineOptions({ name: 'MidMir3' })


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

:deep(.interactive-default) {
  /* styling xD */
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    width: 70px;
    height: 70px;
    background-color:rgb(255, 187, 0);
}

:deep(.interactive-default[data-state='released']) {
    background-color: hotPink;
}

:deep(.interactive-default[data-state='pressed']) {
    background-color: rgb(255, 128, 0);
}

:deep(.interactive-default[data-state='cancel']) {
    background-color: rgb(255, 0, 0);
}
</style>
