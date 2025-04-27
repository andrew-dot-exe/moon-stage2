// buildingStore.js - управление зданиями и модулями
import { ref } from 'vue'
import api from '@/services/api'
import { 
  loadModuleTypes,
  getModuleCost,
  moduleTypesState
} from '@/utils/buildingsData'

export function useBuilingStore() {
  // Buildings state
  const buildings = ref({}) // Хранилище построенных зданий: { "x,z": { type, icon, footprint, ... } }
  const error = ref(null)

  /**
   * Добавление здания
   */
  async function addBuilding(coords, buildingData, userId, currentZoneId, updateResourceCallback) {
    // Создаем ключ для здания по координатам
    const key = `${coords.x},${coords.z}`

    // Если пользователь авторизован, отправляем запрос на сервер
    if (userId !== undefined && userId !== null) {
      try {
        // Преобразуем строковый тип модуля в числовой ID для API
        const moduleTypeId = getModuleTypeIdFromString(buildingData.type)
        
        if (!moduleTypeId) {
          error.value = `Неизвестный тип модуля: ${buildingData.type}`
          console.error('Ошибка: неизвестный тип модуля:', buildingData.type)
          return false
        }
        
        // Получаем стоимость модуля
        const buildingCost = getModuleCost(moduleTypeId)
        const requiredMaterials = buildingCost.construction || 0
        
        // Проверяем наличие достаточного количества материалов через колбэк
        if (!updateResourceCallback) {
          error.value = 'Не удалось проверить ресурсы'
          return false
        }
        
        const hasEnoughResources = await updateResourceCallback('construction', -requiredMaterials)
        if (!hasEnoughResources) {
          error.value = `Недостаточно строительных материалов. Требуется: ${requiredMaterials} кг`
          return false
        }
        
        // Формируем данные для API
        // На бэкенде используется y вместо z, преобразуем координаты соответственно
        const moduleData = {
          id_user: Number(userId),
          id_zone: currentZoneId || 1, // ID текущей зоны или 1 по умолчанию
          module_type: moduleTypeId, // Используем числовой ID
          x: Number(coords.x),
          y: Number(coords.z) // В API используется y вместо z для вертикальной оси в 2D представлении
        }
        
        console.log('Данные для размещения модуля:', JSON.stringify(moduleData))
        
        // Создаем модуль через API (сервер сам проверит возможность размещения)
        const moduleStatus = await api.module.createModule(moduleData)
        console.log('Статус создания модуля:', moduleStatus)
        
        if (moduleStatus) {
          // Сохраняем данные о здании локально
          buildings.value[key] = {
            type: buildingData.type,
            icon: buildingData.icon,
            id: moduleStatus, // Сохраняем ID модуля, полученный от API
            footprint: buildingData.footprint,
            placedAt: new Date().toISOString(),
            meta: {
              id_zone: currentZoneId,
              ...buildingData.meta
            }
          }
          
          return true
        } else {
          // API вернул falsy значение
          // Возвращаем строительные материалы
          await updateResourceCallback('construction', requiredMaterials)
          error.value = 'Сервер отклонил создание модуля'
          return false
        }
      } catch (err) {
        // Произошла ошибка при запросе к API
        error.value = err.message || 'Ошибка создания модуля'
        console.error('Ошибка при создании модуля:', err)
        return false
      }
    } else {
      // Локальное добавление здания (без API)
      try {
        // Получаем стоимость модуля
        const moduleTypeId = getModuleTypeIdFromString(buildingData.type)
        const buildingCost = moduleTypeId ? getModuleCost(moduleTypeId) : { construction: 5000 } // Значение по умолчанию, если тип неизвестен
        const requiredMaterials = buildingCost.construction || 0
        
        // Проверяем наличие достаточного количества материалов через колбэк
        if (!updateResourceCallback) {
          error.value = 'Не удалось проверить ресурсы'
          return false
        }
        
        const hasEnoughResources = await updateResourceCallback('construction', -requiredMaterials)
        if (!hasEnoughResources) {
          error.value = `Недостаточно строительных материалов. Требуется: ${requiredMaterials} кг`
          return false
        }
        
        // Сохраняем здание
        buildings.value[key] = {
          type: buildingData.type,
          icon: buildingData.icon,
          footprint: buildingData.footprint,
          placedAt: new Date().toISOString(),
          meta: buildingData.meta || {}
        }
        
        return true
      } catch (err) {
        error.value = err.message || 'Ошибка создания модуля'
        console.error('Ошибка при создании модуля:', err)
        return false
      }
    }
  }

  /**
   * Преобразует строковый тип модуля в числовой ID для API
   * @param {string} typeString - Строковый тип модуля (например, 'admin_module')
   * @returns {number|null} - Числовой ID типа модуля или null, если тип не найден
   */
  function getModuleTypeIdFromString(typeString) {
    if (!typeString) return null
    
    // Таблица соответствия строковых типов и числовых ID
    const typeToIdMap = {
      // Обитаемые модули
      'residential_complex_2x1': 1, // Жилой комплекс
      'admin_module': 2,            // Административный модуль
      'medical_module': 3,          // Медицинский модуль
      'sport_module': 4,            // Спортивные модули
      'research_module': 5,         // Исследовательский модуль
      'plantation': 6,              // Плантация
      
      // Технологические модули
      'solar_power_plant': 10,      // Солнечная электростанция
      'mining_base': 11,            // Горнодобывающая база
      'manufacture': 12,            // Производство
      'warehouse': 13,              // Склад
      'waste_center': 14,           // Центр утилизации
      'repair_module': 15,          // Ремонтный модуль
      
      // Связь и инфраструктура
      'communication_tower': 20,    // Коммуникационная башня
      'telescope': 21,              // Телескоп
      'cosmodrome': 22,             // Космодром
    }
    
    return typeToIdMap[typeString] || null
  }

  /**
   * Получение пути к иконке для типа модуля
   * @param {number} moduleType - тип модуля из API
   * @returns {string} путь к иконке
   */
  function getIconPathForModuleType(moduleType) {
    // Преобразование типа модуля в путь к изображению
    const moduleTypeMap = {
      // Жилые модули
      1: '/buildings/habitables/2x1living-module.png',
      2: '/buildings/habitables/admin-module.png',
      3: '/buildings/habitables/medical-module.png',
      4: '/buildings/habitables/sport-module.png',
      5: '/buildings/habitables/research-module.png',
      6: '/buildings/habitables/plantation.png',
      // Технологические модули
      10: '/buildings/technological/solar-power-plant.png',
      11: '/buildings/technological/mining-base.png',
      12: '/buildings/technological/manufacture.png',
      13: '/buildings/technological/warehouse.png',
      14: '/buildings/technological/waste-center.png',
      15: '/buildings/technological/repair-module.png',
      // Инфраструктура и связь
      20: '/buildings/technological/communication-tower.png',
      21: '/buildings/technological/telescope.png',
      22: '/buildings/technological/cosmodrome.png',
    }
    
    const iconPath = moduleTypeMap[moduleType] || '/buildings/technological/repair-module.png'
    console.log('Getting icon path for module type:', moduleType, '→', iconPath)
    return iconPath
  }

  function getBuildings() {
    return buildings.value
  }

  function hasBuildingAt(x, z) {
    return !!buildings.value[`${x},${z}`]
  }

  async function removeBuilding(x, z, userId) {
    const key = `${x},${z}`
    const building = buildings.value[key]

    if (building) {
      // Если пользователь авторизован, удаляем здание через API
      if (userId && building.id) {
        try {
          await api.module.deleteModule(userId, building.id)
        } catch (err) {
          console.error('Ошибка при удалении модуля:', err)
          error.value = err.message || 'Ошибка удаления модуля'
          return false
        }
      }
      
      // Удаляем здание из всех ячеек его footprint
      if (building.footprint) {
        building.footprint.forEach(pos => {
          const posKey = `${pos.x},${pos.z}`
          if (buildings.value[posKey]) {
            delete buildings.value[posKey]
          }
        })
      } else {
        delete buildings.value[key]
      }
      
      return true
    }
    
    return false
  }

  /**
   * Проверка возможности размещения космодрома
   */
  async function checkCosmodromePlacement(x, z, zoneId) {
    if (!zoneId) return false
    
    try {
      // Используем специальный метод проверки требований к космодрому
      // На бэкенде используется y вместо z
      const moduleData = {
        id_zone: zoneId,
        x: Number(x),
        y: Number(z) // В API используется y вместо z для вертикальной оси в 2D представлении
      }
      
      console.log('Данные для проверки размещения космодрома:', JSON.stringify(moduleData))
      return await api.module.checkCosmodromeRequirements(moduleData)
    } catch (err) {
      console.error('Ошибка при проверке размещения космодрома:', err)
      return false
    }
  }

  /**
   * Загрузка модулей из API в хранилище зданий
   * @param {Array} modules - модули из API
   */
  function loadModulesFromAPI(modules) {
    buildings.value = {}
    
    if (!modules || !Array.isArray(modules)) return
    
    modules.forEach(module => {
      // На бэкенде координаты хранятся как x, y
      // На фронтенде мы используем x, z (y - вертикальная ось в Three.js)
      const x = module.x
      const z = module.y // Преобразуем y с бэкенда в z для фронтенда
      
      const key = `${x},${z}`
      buildings.value[key] = {
        type: module.module_type,
        icon: getIconPathForModuleType(module.module_type),
        id: module.id,
        footprint: [], // Рассчитывается на основе типа модуля
        placedAt: module.placed_at || new Date().toISOString(),
        meta: {
          id_zone: module.id_zone,
          // Другие метаданные
        }
      }
    })
  }

  /**
   * Инициализация данных о модулях
   */
  async function initialize() {
    try {
      await loadModuleTypes()
      console.log('Типы модулей успешно загружены:', moduleTypesState.types.length)
    } catch (err) {
      console.error('Ошибка загрузки типов модулей:', err)
      error.value = err.message || 'Ошибка загрузки типов модулей'
    }
  }

  return {
    // State
    buildings,
    error,
    
    // Actions
    addBuilding,
    getBuildings,
    hasBuildingAt,
    removeBuilding,
    checkCosmodromePlacement,
    loadModulesFromAPI,
    getModuleTypeIdFromString,
    getIconPathForModuleType,
    initialize
  }
}