<template>
  <div
    ref="buttonEl" 
    class="non-interactive-default">
    <div ref="buttonItem" 
    class="interactive-default"
      v-bind="$attrs"
      :data-id="id"
      :data-press="press ? true : null"
      :data-action="action || null"
      :data-react-press="reactPress ? true : null"
      :data-react-press-release="reactPressRelease ? true : null"
      :data-react-press-cancel="reactPressCancel ? true : null">
      <slot name="button-content"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePointerForwarding } from '../bridge/bridge'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['press', 'pressRelease', 'pressCancel'])

const props = defineProps({
  id: { type: String, required: true },
  action: String,
  press: { type: Boolean, default: false },
  reactPress: { type: Boolean, default: false },
  reactPressRelease: { type: Boolean, default: false },
  reactPressCancel: { type: Boolean, default: false }
})

const buttonEl = ref(null)
const buttonItem = ref(null)

usePointerForwarding({
  elRef: buttonItem,
  onReaction(e) {
    const event = e.detail?.event
    if (!event) return

    if (event === 'press' && !props.reactPress) return
    if (event === 'pressRelease' && !props.reactPressRelease) return
    if (event === 'pressCancel' && !props.reactPressCancel) return

    if (event === 'press') emit('press', e.detail)
    if (event === 'pressRelease') emit('pressRelease', e.detail)
    if (event === 'pressCancel') emit('pressCancel', e.detail)
  }
})
</script>

<style scoped>
.non-interactive-default {
  position: relative;
  pointer-events: none;
}

.interactive-default {
  position: absolute;
  user-select: none;
  pointer-events: auto;
}
</style>
