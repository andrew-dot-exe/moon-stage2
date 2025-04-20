<template>
  <div class="lunar-coordinates-panel" v-if="showPanel && lunarCoordinates">
    <div class="panel-header">
      <h3>Лунные координаты</h3>
      <button class="close-button" @click="closePanel">×</button>
    </div>
    <div class="panel-body">
      <div class="zone-info">
        <span class="label">Зона:</span>
        <span class="value">{{ lunarCoordinates.zone }}</span>
      </div>
      <div class="coordinate-info">
        <span class="label">Широта:</span>
        <span class="value">{{ lunarCoordinates.latitude }}</span>
      </div>
      <div class="coordinate-info">
        <span class="label">Долгота:</span>
        <span class="value">{{ lunarCoordinates.longitude }}</span>
      </div>
      <div class="game-coordinates">
        <span class="label">Игровые координаты:</span>
        <span class="value">X: {{ cellX }}, Z: {{ cellZ }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps({
  cellX: {
    type: Number,
    default: null
  },
  cellZ: {
    type: Number,
    default: null
  }
});

const store = useGameStore();
const showPanel = ref(false);

// Получаем лунные координаты из хранилища
const lunarCoordinates = computed(() => store.lunarCoordinates);

// Следим за изменениями в cellX и cellZ и наличием лунных координат
watch([() => props.cellX, () => props.cellZ, lunarCoordinates], ([newX, newZ, newCoords]) => {
  if (newX !== null && newZ !== null && newCoords) {
    showPanel.value = true;
  } else {
    showPanel.value = false;
  }
});

function closePanel() {
  showPanel.value = false;
}
</script>

<style scoped>
.lunar-coordinates-panel {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  border-radius: 4px;
  padding: 15px;
  color: white;
  font-family: 'Feature Mono', monospace;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(188, 254, 55, 0.5);
  padding-bottom: 8px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #BCFE37;
}

.close-button {
  background: none;
  border: none;
  color: #BCFE37;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-button:hover {
  color: white;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zone-info, .coordinate-info, .game-coordinates {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.value {
  color: #BCFE37;
  font-size: 14px;
  font-weight: bold;
}

.game-coordinates {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(188, 254, 55, 0.3);
}
</style>