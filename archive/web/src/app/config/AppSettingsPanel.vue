<template>
    <div class="settings-panel">
        <h3>App Settings</h3>

        <!-- Drag Lock Toggle -->
        <div class="row">
            <label for="dragLock">Lock Drag Items</label>
            <input type="checkbox" id="dragLock" class="enable-event"
            v-model="USER_SETTINGS.dragLock" />
        </div>
        <div class="row">
            <label for="dragGridVisual">Show Drag Grid</label>
            <input type="checkbox" id="dragGridVisual" class="enable-event"
            v-model="USER_SETTINGS.dragGridVisual" />
        </div>

        <div class="row">change snapping
            <label for="defultSnapX">X</label>
            <select class="enable-event"v-model.number="USER_SETTINGS.defaultSnapX">
                <option v-for="n in 9" :key="n - 1" :value="n - 1">
                    {{ n - 1 }}
                </option>
            </select>

            <label for="defultSnapY">Y</label>
            <select class="enable-event"v-model.number="USER_SETTINGS.defaultSnapY">
                <option v-for="n in 19" :key="n - 1" :value="n - 1">
                    {{ n - 1 }}
                </option>
            </select>
        </div>

        <!-- Debug Panel Toggle (optional) -->
        <!-- <div class="row">
            <label for="debugPanel">Show Debug Panel</label>
            <input type="checkbox" id="debugPanel" v-model="USER_SETTINGS.debugPanel" />
        </div> -->

        <!-- Add more toggles as needed -->
    </div>
</template>

<script setup>
import { USER_SETTINGS } from './appSettings'
// import { watch } from 'vue';

// watch(
//   () => USER_SETTINGS.defaultSnapX,
//   (newVal) => {
//     console.log('defaultSnapX changed to:', newVal)
//   }
// )
</script>

<style scoped>
.settings-panel {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 220px;
    padding: 12px 16px;
    background: rgba(20, 25, 35, 0.95);
    border-radius: 12px;
    color: #f8fafc;
    font-size: 14px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.settings-panel h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    text-align: center;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;

}

label {
    font-weight: 500;
}
input[type="checkbox"] {
    width: 25px;
    height: 25px;
    accent-color: #ff9f68;
    cursor: pointer;
}
.enable-event {
    pointer-events: auto;
}
</style>