<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['zone-selected'])

const markerPaths = '/ui/zone-markers'

// Original coordinates in pixels (based on the original map size)
const zones = [
  { type: 'heights', name: 'Высоты 2', x: 493, y: 399 },
  { type: 'heights', name: 'Высоты 1', x: 613, y: 332 },
  { type: 'lowlands', name: 'Низины 2', x: 590, y: 770 },
  { type: 'lowlands', name: 'Низины 1', x: 612, y: 640 },
  { type: 'plains', name: 'Равнины 1', x: 863, y: 189 },
  { type: 'plains', name: 'Равнины 2', x: 959, y: 256 }
]

const handleZoneClick = (zone) => {
  emit('zone-selected', zone)
}
</script>

<template>
  <div class="map-container">
    <div class="map-aspect-ratio">
      <div class="map-content">
        <img class="map-image" src="/textures/all-zones.svg" alt="Moon Map" />
        
        <div v-for="(zone, index) in zones" :key="index" 
             class="zone-marker" 
             :class="zone.type"
             :style="{
               left: `${(zone.x / 1920) * 100}%`,
               top: `${(zone.y / 1080) * 100}%`
             }"
             @click="handleZoneClick(zone)"
             style="cursor: pointer;">
          <div class="marker-icon" :style="{ backgroundImage: `url(${markerPaths}/${zone.type}.svg)` }"></div>
          <div class="zone-name">{{ zone.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: black;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-aspect-ratio {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 1080/1920 = 0.5625 */
  position: relative;
}

.map-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
}

.zone-marker {
  position: absolute;
  display: flex;
  align-items: flex-start;
  gap: clamp(5px, 1vw, 10px);
  transform: translate(-50%, -50%);
  z-index: 1;
}

.marker-icon {
  width: clamp(40px, 4vw, 60px);
  height: clamp(40px, 4vw, 60px);
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.zone-name {
  color: white;
  font-family: 'Feature Mono', monospace;
  font-size: clamp(14px, 1.5vw, 20px);
  font-weight: 80;
  letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(15, 15, 15, 1);
}
</style> 