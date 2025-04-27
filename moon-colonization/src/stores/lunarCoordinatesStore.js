// lunarCoordinatesStore.js - управление лунными координатами
import { ref, watch } from 'vue'
import api from '@/services/api'

export function useLunarCoordinatesStore() {
  // Lunar coordinates state
  const lunarCoordinates = ref(null)
  const error = ref(null)

  /**
   * Получение реальных лунных координат для игровых координат
   * @param {number} x - координата X в игровом мире
   * @param {number} z - координата Z в игровом мире (соответствует Y на бэкенде)
   * @param {number} zoneId - ID зоны
   * @returns {Promise<Object>} объект с лунными координатами
   */
  async function getLunarCoordinates(x, z, zoneId) {
    if (!zoneId) {
      return null
    }
    
    try {
      const coordinates = await api.lunarCoordinates.getLunarCoordinates(
        zoneId,
        x,
        z
      )
      
      // Обновляем состояние
      lunarCoordinates.value = coordinates
      
      return coordinates
    } catch (err) {
      console.error('Ошибка при получении лунных координат:', err)
      error.value = err.message || 'Не удалось получить лунные координаты'
      return null
    }
  }
  
  /**
   * Обновление лунных координат для выбранной ячейки
   */
  async function updateCoordinatesForCell(cell, zoneId) {
    if (!cell) {
      lunarCoordinates.value = null
      return
    }
    
    await getLunarCoordinates(cell.x, cell.z, zoneId)
  }

  return {
    // State
    lunarCoordinates,
    error,
    
    // Actions
    getLunarCoordinates,
    updateCoordinatesForCell
  }
}