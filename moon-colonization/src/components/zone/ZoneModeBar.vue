<script setup>
const modes = [
  { name: 'Режим выбора области', active: true },
  { name: 'Режим строительства', active: false }
]
</script>

<template>
  <div class="mode-bar">
    <div v-for="(mode, index) in modes" :key="index" class="mode-item">
      <span class="mode-name">{{ mode.name }}</span>
      <span v-if="index < modes.length - 1" class="separator">|</span>
    </div>
  </div>
</template>

<style>
.mode-bar {
  width: 100%;
  height: 20px;
  background: #BCFE37;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-name {
  color: black;
  font-family: 'Feature Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.75px;
}

.separator {
  color: black;
  font-family: 'Feature Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.75px;
}
</style> 