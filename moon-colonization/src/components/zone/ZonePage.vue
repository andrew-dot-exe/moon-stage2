<script setup>
import { useGameStore } from '../../stores/gameStore'
import UIHeader from '../ui/Header.vue'
import ZoneModeBar from './ZoneModeBar.vue'
import ZoneStats from './ZoneStats.vue'
import ZoneMap from './ZoneMap.vue'

const store = useGameStore()

const selectZone = (zone) => {
  store.selectZone(zone)
}
</script>

<template>
  <div class="zone-page">
    <UIHeader />
    <div class="content">
      <ZoneModeBar />
      <ZoneMap @zone-selected="selectZone" />
      <ZoneStats />
    </div>
  </div>
</template>

<style>
.zone-page {
  width: 100%;
  height: 100vh;
  position: relative;
  background: black;
  background-image: url('/textures/all-zones.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style> 

