// resourceStore.js - управление ресурсами колонии
import { ref } from 'vue'
import api from '@/services/api'

export function useResourceStore() {
  // Resources state
  const resources = ref([
    { id: 'water', value: 100, unit: 'кг', name: 'Вода' },
    { id: 'fuel', value: 100, unit: 'кг', name: 'Топливо' },
    { id: 'food', value: 100, unit: 'кг', name: 'Еда' },
    { id: 'energy', value: 100, unit: 'кВт•ч', name: 'Энергия' },
    { id: 'oxygen', value: 100, unit: 'кг', name: 'Кислород' },
    { id: 'co2', value: 100, unit: 'кг', name: 'Углекислый газ' },
    { id: 'waste', value: 0, unit: 'кг', name: 'Отходы' },
    { id: 'construction', value: 100000, unit: 'кг', name: 'Строительные материалы' }
  ])

  // Error state
  const error = ref(null)

  /**
   * Обновление отдельного ресурса
   * @param {string} id - идентификатор ресурса
   * @param {number} newValue - новое значение ресурса
   */
  async function updateResource(id, newValue, userId) {
    const resource = resources.value.find(r => r.id === id)
    if (resource) {
      resource.value = Math.max(0, newValue)
      
      // Отправляем на сервер, если передан ID пользователя
      if (userId) {
        try {
          console.log(`Ресурс ${id} обновлен до ${newValue}`)
        } catch (err) {
          console.error('Ошибка обновления ресурса:', err)
        }
      }
    }
  }

  /**
   * Обновление нескольких ресурсов
   * @param {Object} resourceData - объект с ресурсами и их значениями
   * @param {number} userId - ID пользователя
   */
  async function updateResources(resourceData, userId) {
    if (userId) {
      try {
        const updatedResources = await api.game.updateResources(userId, resourceData);
        if (updatedResources) {
          // Обновление локальных ресурсов на основе полученных данных
          resources.value = mapResourcesFromAPI(updatedResources);
        }
        return true;
      } catch (err) {
        error.value = err.message || 'Ошибка обновления ресурсов';
        console.error('Ошибка при обновлении ресурсов:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Сброс состояния ресурсов
   */
  function resetResources() {
    resources.value = [
      { id: 'water', value: 0, unit: 'кг', name: 'Вода' },
      { id: 'fuel', value: 0, unit: 'кг', name: 'Топливо' },
      { id: 'food', value: 0, unit: 'кг', name: 'Еда' },
      { id: 'energy', value: 0, unit: 'кВт•ч', name: 'Энергия' },
      { id: 'oxygen', value: 0, unit: 'кг', name: 'Кислород' },
      { id: 'co2', value: 0, unit: 'кг', name: 'Углекислый газ' },
      { id: 'waste', value: 0, unit: 'кг', name: 'Отходы' },
      { id: 'construction', value: 0, unit: 'кг', name: 'Строительные материалы' }
    ]
  }

  /**
   * Преобразование ресурсов из формата API в формат приложения
   * @param {Array} apiResources - ресурсы из API
   * @returns {Array} преобразованные ресурсы
   */
  function mapResourcesFromAPI(apiResources) {
    const resourceMap = {
      water: { id: 'water', unit: 'кг', name: 'Вода' },
      fuel: { id: 'fuel', unit: 'кг', name: 'Топливо' },
      food: { id: 'food', unit: 'кг', name: 'Еда' },
      energy: { id: 'energy', unit: 'кВт•ч', name: 'Энергия' },
      oxygen: { id: 'oxygen', unit: 'кг', name: 'Кислород' },
      co2: { id: 'co2', unit: 'кг', name: 'Углекислый газ' },
      waste: { id: 'waste', unit: 'кг', name: 'Отходы' },
      construction: { id: 'construction', unit: 'кг', name: 'Строительные материалы' }
    }
    
    return Object.entries(apiResources).map(([key, value]) => {
      return {
        ...resourceMap[key],
        value: value
      }
    })
  }

  /**
   * Загрузка ресурсов из данных колонии
   */
  function loadResources(colonyData) {
    if (colonyData && colonyData.resources) {
      resources.value = mapResourcesFromAPI(colonyData.resources)
    }
  }

  return {
    // State
    resources,
    error,
    
    // Actions
    updateResource,
    updateResources,
    resetResources,
    mapResourcesFromAPI,
    loadResources
  }
}