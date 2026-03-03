<template>
  <div class="scene-root a">
    <div class="spin-box" aria-label="spin test" ></div>
    <!-- <div class="label">MID · A</div> -->
  </div>
</template>

<script setup>
defineOptions({ name: 'MidMir1' })
</script>

<style scoped>
.a {
  display: grid;
  place-items: center;
  gap: 0px;
  /* padding: 24px; */
}

.spin-box {
  width: 265px;
  height: 265px;
  border-radius: 24px;
  background: radial-gradient(circle at 30% 30%, #ffe8d1, #ff9f68 60%, #f45b69);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
