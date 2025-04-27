// timeStore.js - управление игровым временем
import { ref, computed } from 'vue'
import api from '@/services/api'

export function useTimeStore() {
  // Time state
  const currentTime = ref({
    hours: 16,
    minutes: 58,
    day: 9,
    month: 3,
    year: 2055
  })

  // Computed time string in format HH:MM
  const timeString = computed(() => {
    return `${currentTime.value.hours.toString().padStart(2, '0')}:${currentTime.value.minutes.toString().padStart(2, '0')}`
  })

  // Computed date string in format DD.MM.YYYY
  const dateString = computed(() => {
    return `${currentTime.value.day.toString().padStart(2, '0')}.${currentTime.value.month.toString().padStart(2, '0')}.${currentTime.value.year}`
  })

  /**
   * Увеличение времени на одну минуту
   * @param {Function} updateStateCallback - колбэк для обновления состояния при смене дня
   * @param {number} userId - ID пользователя для API-запросов
   */
  async function incrementTime(updateStateCallback, userId) {
    currentTime.value.minutes++
    if (currentTime.value.minutes >= 60) {
      currentTime.value.minutes = 0
      currentTime.value.hours++
      if (currentTime.value.hours >= 24) {
        currentTime.value.hours = 0
        currentTime.value.day++
        
        // При смене дня делаем запрос к API для обновления состояния колонии
        if (userId) {
          try {
            const dayChanges = await api.game.addDay(userId)
            // Передаем изменения через колбэк
            if (dayChanges && updateStateCallback) {
              updateStateCallback(dayChanges)
            }
          } catch (err) {
            console.error('Ошибка при добавлении дня:', err)
          }
        }
        
        // Переход к следующему месяцу
        if (currentTime.value.day > 30) {
          currentTime.value.day = 1
          currentTime.value.month++
          if (currentTime.value.month > 12) {
            currentTime.value.month = 1
            currentTime.value.year++
          }
        }
      }
    }
  }

  /**
   * Загрузка времени из данных колонии
   */
  function loadTime(colonyData) {
    if (colonyData && colonyData.time) {
      currentTime.value = {
        hours: colonyData.time.hours || 0,
        minutes: colonyData.time.minutes || 0,
        day: colonyData.time.day || 1,
        month: colonyData.time.month || 1,
        year: colonyData.time.year || 2055
      }
    }
  }

  return {
    // State
    currentTime,
    timeString,
    dateString,
    
    // Actions
    incrementTime,
    loadTime
  }
}