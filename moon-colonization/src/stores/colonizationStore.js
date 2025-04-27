// colonizationStore.js - управление процессом колонизации
import { ref } from 'vue'
import api from '@/services/api'

export function useColonizationStore() {
  // State
  const error = ref(null)

  /**
   * Получение статуса колонизации
   * @param {number} userId - ID пользователя
   */
  async function getColonizationStatus(userId) {
    if (!userId) {
      error.value = 'Пользователь не авторизован'
      return null
    }
    
    try {
      return await api.game.getColonizationStatus(userId)
    } catch (err) {
      error.value = err.message || 'Ошибка получения статуса колонизации'
      console.error('Ошибка при получении статуса колонизации:', err)
      return null
    }
  }

  /**
   * Завершение процесса колонизации
   * @param {number} userId - ID пользователя
   */
  async function finishColonization(userId) {
    if (!userId) {
      error.value = 'Пользователь не авторизован'
      return null
    }
    
    try {
      const result = await api.game.finishColonization(userId)
      return result
    } catch (err) {
      error.value = err.message || 'Ошибка завершения колонизации'
      console.error('Ошибка при завершении колонизации:', err)
      return null
    }
  }

  return {
    // State
    error,
    
    // Actions
    getColonizationStatus,
    finishColonization
  }
}