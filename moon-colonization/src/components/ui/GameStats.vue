<script setup>
import { useGameStore } from '../../stores/gameStore'

const store = useGameStore()

// Function to handle stat click
const handleStatClick = (statName) => {
  // Example: Increase stat by 1 on click
  if (statName === 'success') {
    store.stats.success = Math.min(100, store.stats.success + 1)
  } else if (statName === 'mood') {
    store.stats.mood = Math.min(100, store.stats.mood + 1)
  } else if (statName === 'population') {
    store.stats.population += 10
  } else if (statName === 'research') {
    store.stats.research += 1
  }
}
</script>

<template>
  <div class="stats-panel" data-status="Open">
    <div class="time-display">
      <div class="time">{{ store.timeString }}</div>
      <div class="date">{{ store.dateString }}</div>
    </div>
    
    <div class="stats-content">
      <div class="success-section">
        <div class="success-header">
          <div class="title">Успешность</div>
        </div>
        <div class="success-value" @click="handleStatClick('success')">{{ store.stats.success }}%</div>
        <div class="progress-bar">
          <div class="progress-background"></div>
          <div class="progress-fill" :style="{ width: `${store.stats.success}%` }"></div>
        </div>
      </div>
      
      <div class="stats-list">
        <div class="stat-item" @click="handleStatClick('mood')">
          <div class="stat-label">Настроение</div>
          <div class="stat-value">{{ store.stats.mood }}%</div>
        </div>
        <div class="stat-item" @click="handleStatClick('population')">
          <div class="stat-label">Кол-во населения</div>
          <div class="stat-value">{{ store.stats.population }} чел.</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Состояние ресурсов</div>
          <div class="stat-value">{{ store.stats.resources }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Централизация</div>
          <div class="stat-value">{{ store.stats.centralization }}</div>
        </div>
        <div class="stat-item" @click="handleStatClick('research')">
          <div class="stat-label">Кол-во исследований</div>
          <div class="stat-value">{{ store.stats.research }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.stats-panel {
  position: fixed;
  width: 308px;
  right: 20px;
  top: 92px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: 'Feature Mono', monospace;
  pointer-events: auto;
  z-index: 100;
}

.time-display {
  padding: 5px;
  background: rgba(0, 0, 0, 0.8);
  outline: 1px white solid;
  outline-offset: -1px;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
}

.stats-content {
  padding: 5px;
}

.success-section {
  margin-bottom: 10px;
}

.success-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.progress-bar {
  width: 100%;
  height: 5px;
  background: white;
  box-shadow: 0px 0px 3px 2px rgba(255, 255, 255, 0.2);
  margin-top: 5px;
  position: relative;
}

.progress-fill {
  position: absolute;
  height: 100%;
  background: #BCFE37;
  box-shadow: 0px 0px 3px 2px rgba(188, 254, 55, 0.2);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background: rgba(70, 70, 70, 0.5);
}

.stat-label {
  background: #464646;
  padding: 2px 5px;
  width: 190px;
}

.stat-value {
  color: #BCFE37;
  padding: 2px 5px;
  outline: 1px #464646 solid;
  outline-offset: -1px;
}

.success-value {
  cursor: pointer;
  transition: color 0.2s;
}

.success-value:hover {
  color: #BCFE37;
}
</style> 