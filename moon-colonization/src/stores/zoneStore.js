// zoneStore.js - управление зонами
import { ref, reactive } from 'vue'
import api from '@/services/api'

export function useZoneStore() {
  // Zone state
  const currentZone = ref(null)
  const zones = ref([])
  const error = ref(null)
  
  // Terrain cache
  const terrainCache = reactive({})

  // Zone actions
  async function loadZones(userId) {
    if (userId) {
      try {
        const areasData = await api.area.getAreas()
        if (areasData && Array.isArray(areasData)) {
          zones.value = areasData.map(area => ({
            type: area.type,
            name: area.name,
            x: area.x,
            y: area.y,
            id: area.id
          }))
        }
        return zones.value
      } catch (err) {
        console.error('Ошибка загрузки зон:', err)
        error.value = err.message || 'Ошибка загрузки зон'
        return []
      }
    }
    return zones.value
  }
  
  function selectZone(zone) {
    currentZone.value = zone
  }

  function returnToColonization() {
    currentZone.value = null
  }

  /**
   * Получение данных о рельефе зоны
   * @param {number} zoneId - ID зоны
   * @returns {Promise<Array>} Массив данных о ячейках зоны
   */
  async function getZoneTerrainData(zoneId, userId) {
    if (!userId) {
      console.error('Пользователь не авторизован')
      return []
    }
    
    try {
      // Если данные уже загружены для этой зоны, возвращаем их из кэша
      if (terrainCache[zoneId]) {
        return terrainCache[zoneId]
      }
      
      // Запрос данных о рельефе зоны с бэкенда
      const response = await api.zone.getTerrainData(zoneId)
      
      if (response && Array.isArray(response.cells)) {
        // Преобразуем данные в удобный формат
        const terrainData = response.cells.map(cell => ({
          x: cell.x,
          y: cell.y,  // На бэкенде используется y вместо z
          height: cell.height,
          angle: cell.angle, 
          type: response.type || 'unknown',
          illumination: response.illumination || 50
        }))
        
        // Кэшируем данные
        terrainCache[zoneId] = terrainData
        
        return terrainData
      }
      
      return []
    } catch (error) {
      console.error('Ошибка при получении данных о рельефе:', error)
      return []
    }
  }

  async function getZoneSuitability(zoneId) {
    try {
      return await api.area.getZoneSuitability(zoneId || currentZone.value?.id)
    } catch (err) {
      error.value = err.message || 'Ошибка получения данных о пригодности зоны'
      console.error('Ошибка при получении данных о пригодности зоны:', err)
      return null
    }
  }

  return {
    // State
    currentZone,
    zones,
    error,
    
    // Actions
    loadZones,
    selectZone,
    returnToColonization,
    getZoneTerrainData,
    getZoneSuitability
  }
}