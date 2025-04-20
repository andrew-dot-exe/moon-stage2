// buildingsData.js
// Файл содержит все данные о постройках и логику для работы с ними
import api from '@/services/api'
import { ref, reactive } from 'vue'

/**
 * Класс BuildingEntity
 * Представляет построенное здание на карте.
 * @param {THREE.Mesh} mesh - 3D-объект здания
 * @param {number} x - Координата X ячейки (левая верхняя)
 * @param {number} z - Координата Z ячейки (левая верхняя)
 * @param {object} [meta] - Дополнительные параметры (например, тип здания, footprint)
 */
export class BuildingEntity {
  constructor(mesh, x, z, meta = {}) {
    this.mesh = mesh
    this.x = x
    this.z = z
    this.meta = meta
    // footprint — массив координат ячеек, которые занимает здание
    this.footprint = meta.footprint || [{ x, z }]
    // Добавьте свои поля ниже:
    // this.health = meta.health || 100
    // this.owner = meta.owner || null
    // this.level = meta.level || 1
    // и т.д.
  }
}

/**
 * Состояние типов модулей, загруженных с бэкенда
 */
export const moduleTypesState = reactive({
  loaded: false,
  loading: false,
  types: [],
  error: null
})

/**
 * Словарь соответствий API-типов модулей с их визуальным представлением
 * Ключи - имена типов модулей из API, значения - объекты с дополнительной информацией
 */
export const MODULE_TYPE_MAPPING = {
  // Обитаемые модули
  LIVE_MODULE_X: {
    type: 'residential_complex_2x1',
    size: '2x1',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/2x1living-module.png',
    description: 'Жилые помещения для колонистов. Вмещает до 50 человек.',
    production: { co2: 5 },
    consumption: { oxygen: 10, water: 8, energy: 12, food: 6 }
  },
  LIVE_MODULE_Y: {
    type: 'residential_complex_2x1',
    size: '2x1',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/2x1living-module.png',
    description: 'Жилые помещения для колонистов. Улучшенная версия.',
    production: { co2: 5 },
    consumption: { oxygen: 8, water: 6, energy: 10, food: 5 }
  },
  LIVE_ADMINISTRATIVE_MODULE: {
    type: 'admin_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/admin-module.png',
    description: 'Центр управления колонией. Повышает эффективность других модулей и улучшает настроение колонистов.',
    production: { energy: -5 },
    consumption: {}
  },
  ADMINISTRATIVE_MODULE: {
    type: 'admin_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/habitables/admin-module.png',
    description: 'Административный центр для управления нежилой инфраструктурой.',
    production: {},
    consumption: { energy: 5 }
  },
  SPORT_MODULE: {
    type: 'sport_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/sport-module.png',
    description: 'Модуль для физической активности колонистов. Улучшает настроение и здоровье.',
    production: {},
    consumption: { energy: 6 }
  },
  MEDICAL_MODULE: {
    type: 'medical_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/medical-module.png',
    description: 'Обеспечивает медицинскую помощь колонистам. Повышает общее здоровье и снижает смертность.',
    production: {},
    consumption: { energy: 8, water: 4 }
  },
  PLANTATION: {
    type: 'plantation',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/plantation.png',
    description: 'Выращивание пищи. Производит пищевые ресурсы и потребляет воду.',
    production: { food: 15, oxygen: 8 },
    consumption: { water: 10, energy: 7, co2: 5 }
  },
  RESEARCH_MODULE_PLANTATION: {
    type: 'research_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/research-module.png',
    description: 'Исследовательская лаборатория для улучшения сельскохозяйственных технологий.',
    production: {},
    consumption: { energy: 12 }
  },
  RESEARCH_MODULE_MINE: {
    type: 'research_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/research-module.png',
    description: 'Исследовательская лаборатория для улучшения горнодобывающих технологий.',
    production: {},
    consumption: { energy: 12 }
  },
  RESEARCH_MODULE_TELESCOPE: {
    type: 'research_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/research-module.png',
    description: 'Исследовательская лаборатория для астрономических исследований.',
    production: {},
    consumption: { energy: 12 }
  },
  RESEARCH_MODULE_TERRITORY: {
    type: 'research_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'habitable',
    icon: '/buildings/habitables/research-module.png',
    description: 'Исследовательская лаборатория для изучения лунной поверхности.',
    production: {},
    consumption: { energy: 12 }
  },
  HALLWAY: {
    type: 'hallway',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'infrastructure',
    icon: '/buildings/technological/repair-module.png',
    description: 'Коридоры для соединения модулей колонии.',
    production: {},
    consumption: { energy: 2 }
  },
  
  // Технологические модули
  SOLAR_POWER_PLANT: {
    type: 'solar_power_plant',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/solar-power-plant.png',
    description: 'Производит энергию для колонии из солнечного света.',
    production: { energy: 50 },
    consumption: {}
  },
  REPAIR_MODULE: {
    type: 'repair_module',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/repair-module.png',
    description: 'Обслуживает и ремонтирует другие модули. Увеличивает срок службы всех модулей.',
    production: {},
    consumption: { energy: 8, construction: 2 }
  },
  COSMODROME: {
    type: 'cosmodrome',
    size: '2x2',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 0, z: 1 }, { x: 1, z: 1 }],
    category: 'infrastructure',
    icon: '/buildings/technological/cosmodrome.png',
    description: 'Площадка для приема и отправки космических кораблей.',
    production: {},
    consumption: { energy: 30, fuel: 15 }
  },
  COMMUNICATION_TOWER: {
    type: 'communication_tower',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'infrastructure',
    icon: '/buildings/technological/communication-tower.png',
    description: 'Обеспечивает связь между модулями колонии и с Землей.',
    production: {},
    consumption: { energy: 8 }
  },
  LANDFILL: {
    type: 'waste_center',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/waste-center.png',
    description: 'Перерабатывает отходы в полезные ресурсы. Снижает загрязнение.',
    production: { water: 2, construction: 1 },
    consumption: { waste: 15, energy: 10 }
  },
  LANDFILL_BIO: {
    type: 'waste_center',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/waste-center.png',
    description: 'Специализированный центр для переработки биологических отходов.',
    production: { water: 5, food: 2 },
    consumption: { waste: 15, energy: 10 }
  },
  MANUFACTURING_ENTERPRISE: {
    type: 'manufacture',
    size: '2x1',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/manufacture.png',
    description: 'Перерабатывает добытые ресурсы в строительные материалы и компоненты.',
    production: { construction: 25 },
    consumption: { energy: 20 }
  },
  MANUFACTURING_ENTERPRISE_FUEL: {
    type: 'manufacture',
    size: '2x1',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/manufacture.png',
    description: 'Специализированное производство топлива для космических кораблей.',
    production: { fuel: 20 },
    consumption: { energy: 25 }
  },
  ASTRONOMICAL_SITE: {
    type: 'telescope',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'infrastructure',
    icon: '/buildings/technological/telescope.png',
    description: 'Наблюдение за космическим пространством. Способствует научному прогрессу.',
    production: {},
    consumption: { energy: 15 }
  },
  MINE_BASE: {
    type: 'mining_base',
    size: '2x1',
    footprint: [{ x: 0, z: 0 }, { x: 1, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/mining-base.png',
    description: 'Добывает полезные ископаемые с лунной поверхности. Основной источник строительных материалов.',
    production: { construction: 35 },
    consumption: { energy: 25 }
  },
  WAREHOUSE_FOOD: {
    type: 'warehouse',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/warehouse.png',
    description: 'Хранилище для пищевых ресурсов. Увеличивает максимальное количество хранимой еды.',
    production: {},
    consumption: { energy: 3 },
    storage: { capacity: 10000, type: 'food' }
  },
  WAREHOUSE_GASES: {
    type: 'warehouse',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/warehouse.png',
    description: 'Хранилище для газов. Увеличивает максимальное количество хранимого кислорода и CO2.',
    production: {},
    consumption: { energy: 3 },
    storage: { capacity: 10000, type: 'gases' }
  },
  WAREHOUSE_FUEL: {
    type: 'warehouse',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/warehouse.png',
    description: 'Хранилище для топлива. Увеличивает максимальное количество хранимого топлива.',
    production: {},
    consumption: { energy: 3 },
    storage: { capacity: 10000, type: 'fuel' }
  },
  WAREHOUSE_MATERIAL: {
    type: 'warehouse',
    size: '1x1',
    footprint: [{ x: 0, z: 0 }],
    category: 'technological',
    icon: '/buildings/technological/warehouse.png',
    description: 'Хранилище для строительных материалов. Увеличивает максимальное количество хранимых материалов.',
    production: {},
    consumption: { energy: 3 },
    storage: { capacity: 10000, type: 'material' }
  }
}

/**
 * Загрузка типов модулей с сервера
 * @returns {Promise<Array>} Массив типов модулей
 */
export async function loadModuleTypes() {
  if (moduleTypesState.loaded) {
    return moduleTypesState.types
  }
  
  moduleTypesState.loading = true
  moduleTypesState.error = null
  
  try {
    const response = await api.module.getModuleTypes()
    if (response && response.moduleTypes) {
      moduleTypesState.types = response.moduleTypes.map(moduleType => {
        // Соединяем данные из API с визуальным представлением из маппинга
        const visualData = MODULE_TYPE_MAPPING[moduleType.name] || {
          type: moduleType.name.toLowerCase(),
          size: '1x1',
          footprint: [{ x: 0, z: 0 }],
          category: moduleType.isLivingModule ? 'habitable' : 'technological',
          icon: '/buildings/technological/repair-module.png',
          description: `Модуль типа ${moduleType.name}`,
          production: {},
          consumption: {}
        }
        
        return {
          id: moduleType.id,
          apiName: moduleType.name,
          name: getReadableName(moduleType.name),
          cost: moduleType.cost,
          peopleRequired: moduleType.peopleRequired,
          isLivingModule: moduleType.isLivingModule,
          ...visualData
        }
      })
      
      moduleTypesState.loaded = true
    }
    return moduleTypesState.types
  } catch (error) {
    console.error('Ошибка при загрузке типов модулей:', error)
    moduleTypesState.error = error.message || 'Ошибка при загрузке типов модулей'
    throw error
  } finally {
    moduleTypesState.loading = false
  }
}

/**
 * Преобразование технического имени в читабельное название
 * @param {string} apiName - Техническое имя из API
 * @returns {string} - Читабельное название
 */
function getReadableName(apiName) {
  const nameMap = {
    'LIVE_MODULE_X': 'Жилой модуль тип X',
    'LIVE_MODULE_Y': 'Жилой модуль тип Y',
    'LIVE_ADMINISTRATIVE_MODULE': 'Жилой административный модуль',
    'ADMINISTRATIVE_MODULE': 'Административный модуль',
    'SPORT_MODULE': 'Спортивный модуль',
    'MEDICAL_MODULE': 'Медицинский модуль',
    'PLANTATION': 'Плантация',
    'RESEARCH_MODULE_PLANTATION': 'Исследовательский модуль (плантация)',
    'RESEARCH_MODULE_MINE': 'Исследовательский модуль (добыча)',
    'RESEARCH_MODULE_TELESCOPE': 'Исследовательский модуль (телескоп)',
    'RESEARCH_MODULE_TERRITORY': 'Исследовательский модуль (территория)',
    'HALLWAY': 'Коридор',
    'SOLAR_POWER_PLANT': 'Солнечная электростанция',
    'REPAIR_MODULE': 'Ремонтный модуль',
    'COSMODROME': 'Космодром',
    'COMMUNICATION_TOWER': 'Коммуникационная башня',
    'LANDFILL': 'Центр утилизации',
    'LANDFILL_BIO': 'Биологический центр утилизации',
    'MANUFACTURING_ENTERPRISE': 'Производственное предприятие',
    'MANUFACTURING_ENTERPRISE_FUEL': 'Производство топлива',
    'ASTRONOMICAL_SITE': 'Астрономическая площадка',
    'MINE_BASE': 'Горнодобывающая база',
    'WAREHOUSE_FOOD': 'Склад пищи',
    'WAREHOUSE_GASES': 'Склад газов',
    'WAREHOUSE_FUEL': 'Склад топлива',
    'WAREHOUSE_MATERIAL': 'Склад материалов'
  }
  
  return nameMap[apiName] || apiName.replace(/_/g, ' ').toLowerCase()
}

/**
 * Получение типа модуля по ID из API
 * @param {number} id - ID типа модуля
 * @returns {object|null} - Данные о типе модуля или null, если не найден
 */
export function getModuleTypeById(id) {
  if (!moduleTypesState.loaded) {
    console.warn('Типы модулей не загружены. Используйте loadModuleTypes() перед вызовом getModuleTypeById.')
    return null
  }
  
  return moduleTypesState.types.find(moduleType => moduleType.id === id) || null
}

/**
 * Получение типа модуля по имени из API
 * @param {string} name - Имя типа модуля
 * @returns {object|null} - Данные о типе модуля или null, если не найден
 */
export function getModuleTypeByName(name) {
  if (!moduleTypesState.loaded) {
    console.warn('Типы модулей не загружены. Используйте loadModuleTypes() перед вызовом getModuleTypeByName.')
    return null
  }
  
  return moduleTypesState.types.find(moduleType => moduleType.apiName === name) || null
}

/**
 * Получение всех доступных типов модулей
 * @returns {Array} - Массив типов модулей
 */
export function getAvailableModuleTypes() {
  return moduleTypesState.types
}

/**
 * Проверка возможности размещения постройки
 * @param {object} params - Параметры для проверки
 * @param {object} params.buildingType - Тип постройки
 * @param {object} params.cell - Координаты ячейки для размещения (x, z)
 * @param {object} params.buildings - Карта существующих построек
 * @param {object} params.cells - Карта ячеек
 * @returns {object} - Результат проверки { canPlace: boolean, message: string }
 */
export function canPlaceBuilding({ buildingType, cell, buildings, cells }) {
  if (!buildingType || !cell) {
    return { canPlace: false, message: 'Не указан тип постройки или ячейка' }
  }
  
  // Получаем footprint для размещения
  const footprint = buildingType.footprint
    ? buildingType.footprint.map(offset => ({
        x: cell.x + offset.x,
        z: cell.z + offset.z
      }))
    : [{ x: cell.x, z: cell.z }]
  
  // Проверяем все ячейки footprint
  for (const pos of footprint) {
    const key = `${pos.x},${pos.z}`
    
    // Проверка на занятость ячейки другой постройкой
    if (buildings[key]) {
      return { 
        canPlace: false, 
        message: `Невозможно построить: ячейка ${key} уже занята другой постройкой` 
      }
    }
    
    // Проверка на доступность ячейки
    const cellEntity = cells[key]
    if (!cellEntity || cellEntity.isOccupied) {
      return { 
        canPlace: false, 
        message: `Невозможно построить: ячейка ${key} недоступна` 
      }
    }
  }
  
  // Если все проверки пройдены, можно строить
  return { canPlace: true }
}

/**
 * Преобразование модуля из API в формат здания для приложения
 * @param {Object} module - модуль из API
 * @returns {Object} здание в формате приложения
 */
export function mapModuleToBuilding(module) {
  // Получаем информацию о типе модуля
  const moduleType = getModuleTypeById(module.module_type)
  
  // Если тип модуля найден, используем его данные, иначе формируем базовые
  return {
    type: module.module_type,
    apiName: moduleType?.apiName,
    icon: moduleType?.icon || '/buildings/technological/repair-module.png',
    id: module.id,
    footprint: moduleType?.footprint || [{ x: 0, z: 0 }],
    placedAt: module.placed_at || new Date().toISOString(),
    meta: {
      id_zone: module.id_zone,
      peopleRequired: moduleType?.peopleRequired || 0,
      isLivingModule: moduleType?.isLivingModule || false
    }
  }
}

/**
 * Расчет стоимости постройки модуля
 * @param {object|number} moduleType - Объект типа модуля или ID типа
 * @returns {object} - Стоимость постройки по ресурсам
 */
export function getModuleCost(moduleType) {
  let moduleData
  
  if (typeof moduleType === 'object') {
    moduleData = moduleType
  } else if (typeof moduleType === 'number') {
    moduleData = getModuleTypeById(moduleType)
  }
  
  if (!moduleData) {
    return { construction: 0 }
  }
  
  return { construction: moduleData.cost || 0 }
}

/**
 * Расчет производства и потребления ресурсов для модуля
 * @param {object|number} moduleType - Объект типа модуля или ID типа
 * @returns {object} - Объект с производством и потреблением ресурсов
 */
export function getModuleResourceFlow(moduleType) {
  let moduleData
  
  if (typeof moduleType === 'object') {
    moduleData = moduleType
  } else if (typeof moduleType === 'number') {
    moduleData = getModuleTypeById(moduleType)
  }
  
  if (!moduleData) {
    return { production: {}, consumption: {} }
  }
  
  return {
    production: moduleData.production || {},
    consumption: moduleData.consumption || {}
  }
}

// Сохраняем совместимость со старыми функциями
export const getBuildingById = getModuleTypeById
export const getBuildingByType = getModuleTypeByName
export const AVAILABLE_BUILDINGS = moduleTypesState.types
export const getBuildingCost = getModuleCost
export const getBuildingResourceFlow = getModuleResourceFlow