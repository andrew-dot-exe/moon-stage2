<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import MapRenderer from './MapRenderer.vue'

const store = useGameStore()
const container = ref(null)

// Handle window resize
const handleResize = () => {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  store.updateViewportSize({ width, height })
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="map-container" ref="container">
    <MapRenderer :is-minimap="false" :viewport-size="store.mapState.viewportSize" />
  </div>
</template>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style> 