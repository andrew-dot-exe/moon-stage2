// statsStore.js - управление статистикой колонии
import { ref } from 'vue'

export function useStatsStore() {
  // Stats state
  const stats = ref({
    success: 90,
    mood: 80,
    population: 500,
    resources: 'Много',
    centralization: 'Хорошая',
    research: 10
  })

  /**
   * Обновление статистики
   * @param {Object} newStats - новые данные статистики
   */
  function updateStats(newStats) {
    if (!newStats) return
    
    Object.entries(newStats).forEach(([key, value]) => {
      if (stats.value.hasOwnProperty(key)) {
        stats.value[key] = value
      }
    })
  }

  /**
   * Загрузка статистики из данных колонии
   */
  function loadStats(colonyData) {
    if (colonyData && colonyData.stats) {
      stats.value = {
        success: colonyData.stats.success || 0,
        mood: colonyData.stats.mood || 0,
        population: colonyData.stats.population || 0,
        resources: colonyData.stats.resources || 'Нет данных',
        centralization: colonyData.stats.centralization || 'Нет данных',
        research: colonyData.stats.research || 0
      }
    }
  }

  /**
   * Сброс статистики
   */
  function resetStats() {
    stats.value = {
      success: 0,
      mood: 0,
      population: 0,
      resources: 'Нет данных',
      centralization: 'Нет данных',
      research: 0
    }
  }

  return {
    // State
    stats,
    
    // Actions
    updateStats,
    loadStats,
    resetStats
  }
}