import { defineStore } from 'pinia'
import { ref, computed, reactive, watch } from 'vue'
import api from '@/services/api'
import { 
  loadModuleTypes,
  mapModuleToBuilding, 
  getModuleTypeById,
  getModuleCost,
  moduleTypesState
} from '@/utils/buildingsData'

export const useGameStore = defineStore('game', () => {
  // User state
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref(null)
  
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

  // Stats state
  const stats = ref({
    success: 90,
    mood: 80,
    population: 500,
    resources: 'Много',
    centralization: 'Хорошая',
    research: 10
  })

  // Time state
  const currentTime = ref({
    hours: 16,
    minutes: 58,
    day: 9,
    month: 3,
    year: 2055
  })

  // Computed time string
  const timeString = computed(() => {
    return `${currentTime.value.hours.toString().padStart(2, '0')}:${currentTime.value.minutes.toString().padStart(2, '0')}`
  })

  // Computed date string
  const dateString = computed(() => {
    return `${currentTime.value.day.toString().padStart(2, '0')}.${currentTime.value.month.toString().padStart(2, '0')}.${currentTime.value.year}`
  })

  // Map state
  const mapState = ref({
    zoom: 1,
    gridSize: 20,
    cellSize: 1,
    selectedCell: null,
    cells: {},
    cameraPosition: { x: 0, y: 10, z: 0 },
    isDragging: false,
    lastMousePosition: { x: 0, y: 0 },
    textureBasePath: '/textures/moon/',
    textureLODs: {
      'low': {
        resolution: 512,
        path: 'low/'
      },
      'medium': {
        resolution: 1024,
        path: 'medium/'
      },
      'high': {
        resolution: 2048,
        path: 'high/'
      }
    },
    currentLOD: 'medium',
    textureTypes: {
      'heights': 'heights',
      'lowlands': 'lowlands',
      'plains': 'plains'
    },
    currentTextureType: 'heights',
    zoneTextures: {
      'heights': {
        color: '#BCFE37',
        texture: 'heights'
      },
      'lowlands': {
        color: '#4A90E2',
        texture: 'lowlands'
      },
      'plains': {
        color: '#F5A623',
        texture: 'plains'
      }
    }
  })

  // Zone state
  const currentZone = ref(null)
  const zones = ref([])

  // Buildings state
  const buildings = ref({}) // Хранилище построенных зданий: { "x,z": { type, icon, footprint, ... } }

  // Lunar coordinates state
  const lunarCoordinates = ref(null);

  // Terrain cache
  const terrainCache = reactive({});

  // User Authentication Actions
  
  /**
   * Авторизация пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} данные пользователя
   */
  async function login(email, password) {
    isLoading.value = true
    error.value = null
    
    try {
      const userData = await api.user.login(email, password)
      user.value = userData
      // Загружаем данные о колонии, если они есть
      if (userData.colony) {
        loadColonyData(userData.colony)
      }
      return userData
    } catch (err) {
      error.value = err.message || 'Ошибка входа'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Регистрация нового пользователя
   * @param {Object} userData - данные пользователя
   * @returns {Promise<number>} ID созданного пользователя
   */
  async function register(userData) {
    isLoading.value = true
    error.value = null
    
    try {
      const userId = await api.user.register(userData)
      // После регистрации можно автоматически авторизоваться
      if (userId) {
        return login(userData.email, userData.password)
      }
      return userId
    } catch (err) {
      error.value = err.message || 'Ошибка регистрации'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Выход пользователя из системы
   */
  function logout() {
    user.value = null
    // Сбрасываем состояние колонии
    resetColonyState()
  }
  
  /**
   * Загрузка данных о колонии из ответа API
   * @param {Object} colonyData - данные о колонии
   */
  function loadColonyData(colonyData) {
    // Загрузка ресурсов, если они есть в данных колонии
    if (colonyData.resources) {
      resources.value = mapResourcesFromAPI(colonyData.resources)
    }
    
    // Загрузка статистики
    if (colonyData.stats) {
      stats.value = {
        success: colonyData.stats.success || 0,
        mood: colonyData.stats.mood || 0,
        population: colonyData.stats.population || 0,
        resources: colonyData.stats.resources || 'Нет данных',
        centralization: colonyData.stats.centralization || 'Нет данных',
        research: colonyData.stats.research || 0
      }
    }
    
    // Загрузка игрового времени
    if (colonyData.time) {
      currentTime.value = {
        hours: colonyData.time.hours || 0,
        minutes: colonyData.time.minutes || 0,
        day: colonyData.time.day || 1,
        month: colonyData.time.month || 1,
        year: colonyData.time.year || 2055
      }
    }
    
    // Загрузка модулей
    if (colonyData.modules) {
      loadModulesFromAPI(colonyData.modules)
    }
  }
  
  /**
   * Сброс состояния колонии
   */
  function resetColonyState() {
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
    
    stats.value = {
      success: 0,
      mood: 0,
      population: 0,
      resources: 'Нет данных',
      centralization: 'Нет данных',
      research: 0
    }
    
    buildings.value = {}
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
   * Загрузка модулей из API в хранилище зданий
   * @param {Array} modules - модули из API
   */
  function loadModulesFromAPI(modules) {
    buildings.value = {}
    
    modules.forEach(module => {
      // На бэкенде координаты хранятся как x, y
      // На фронтенде мы используем x, z (y - вертикальная ось в Three.js)
      const x = module.x
      const z = module.y // Преобразуем y с бэкенда в z для фронтенда
      
      const key = `${x},${z}`
      buildings.value[key] = mapModuleToBuilding(module)
    })
  }
  
  /**
   * Преобразование модуля из API в формат здания для приложения
   * @param {Object} module - модуль из API
   * @returns {Object} здание в формате приложения
   */
  function mapModuleToBuilding(module) {
    // Здесь нужно преобразовать тип модуля в путь к иконке
    const iconPath = getIconPathForModuleType(module.module_type)
    
    return {
      type: module.module_type,
      icon: iconPath,
      id: module.id,
      footprint: [], // Рассчитывается на основе типа модуля
      placedAt: module.placed_at || new Date().toISOString(),
      meta: {
        id_zone: module.id_zone,
        // Другие метаданные
      }
    }
  }
  
  /**
   * Получение пути к иконке для типа модуля
   * @param {number} moduleType - тип модуля из API
   * @returns {string} путь к иконке
   */
  function getIconPathForModuleType(moduleType) {
    // Преобразование типа модуля в путь к изображению
    // Здесь нужна логика сопоставления типов модулей из API с путями к изображениям
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
      // ... другие типы модулей
    }
    
    const iconPath = moduleTypeMap[moduleType] || '/buildings/technological/repair-module.png';
    console.log('Getting icon path for module type:', moduleType, '→', iconPath);
    return iconPath;
  }

  // Actions
  async function updateResource(id, newValue) {
    const resource = resources.value.find(r => r.id === id)
    if (resource) {
      resource.value = Math.max(0, newValue)
      
      // Отправляем на сервер, если пользователь авторизован
      if (isAuthenticated.value && user.value.id) {
        try {
          // Здесь должна быть отправка обновленных ресурсов на сервер
          // Но в API пока нет такого эндпоинта, поэтому заглушка
          console.log(`Ресурс ${id} обновлен до ${newValue}`)
        } catch (err) {
          console.error('Ошибка обновления ресурса:', err)
        }
      }
    }
  }

  async function updateResources(resourceData) {
    if (isAuthenticated.value && user.value.id) {
      try {
        const updatedResources = await api.game.updateResources(user.value.id, resourceData);
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

  async function incrementTime() {
    currentTime.value.minutes++
    if (currentTime.value.minutes >= 60) {
      currentTime.value.minutes = 0
      currentTime.value.hours++
      if (currentTime.value.hours >= 24) {
        currentTime.value.hours = 0
        currentTime.value.day++
        
        // При смене дня делаем запрос к API для обновления состояния колонии
        if (isAuthenticated.value && user.value.id) {
          try {
            const dayChanges = await api.game.addDay(user.value.id)
            // Обновляем ресурсы и другие параметры на основе полученных данных
            if (dayChanges) {
              updateStateFromDayChanges(dayChanges)
            }
          } catch (err) {
            console.error('Ошибка при добавлении дня:', err)
          }
        }
        
        // Simple month handling
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
   * Обновление состояния на основе изменений за день
   * @param {Object} dayChanges - изменения за день
   */
  function updateStateFromDayChanges(dayChanges) {
    // Обновляем ресурсы
    if (dayChanges.resources) {
      Object.entries(dayChanges.resources).forEach(([key, value]) => {
        const resource = resources.value.find(r => r.id === key)
        if (resource) {
          resource.value = value
        }
      })
    }
    
    // Обновляем статистику
    if (dayChanges.stats) {
      Object.entries(dayChanges.stats).forEach(([key, value]) => {
        if (stats.value.hasOwnProperty(key)) {
          stats.value[key] = value
        }
      })
    }
  }

  async function getColonizationStatus() {
    if (isAuthenticated.value && user.value.id) {
      try {
        return await api.game.getColonizationStatus(user.value.id);
      } catch (err) {
        error.value = err.message || 'Ошибка получения статуса колонизации';
        console.error('Ошибка при получении статуса колонизации:', err);
        return null;
      }
    }
    return null;
  }

  async function finishColonization() {
    if (isAuthenticated.value && user.value.id) {
      try {
        const result = await api.game.finishColonization(user.value.id);
        return result;
      } catch (err) {
        error.value = err.message || 'Ошибка завершения колонизации';
        console.error('Ошибка при завершении колонизации:', err);
        return null;
      }
    }
    return null;
  }

  // Map actions
  function updateZoom(newZoom) {
    mapState.value.zoom = Math.max(0.1, Math.min(5, newZoom))
  }

  function selectCell(cell) {
    mapState.value.selectedCell = cell
  }

  function updateCell(x, z, data) {
    const key = `${x},${z}`
    mapState.value.cells[key] = {
      ...mapState.value.cells[key],
      ...data
    }
  }

  function startDragging(x, y) {
    mapState.value.isDragging = true
    mapState.value.lastMousePosition = { x, y }
  }

  function stopDragging() {
    mapState.value.isDragging = false
  }

  function updateCameraPosition(x, y, z) {
    mapState.value.cameraPosition = { x, y, z }
  }

  // Zone actions
  async function loadZones() {
    if (isAuthenticated.value) {
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
      } catch (err) {
        console.error('Ошибка загрузки зон:', err)
      }
    }
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
  async function getZoneTerrainData(zoneId) {
    if (!user.value || !user.value.id) {
      console.error('Пользователь не авторизован');
      return [];
    }
    
    try {
      // Если данные уже загружены для этой зоны, возвращаем их из кэша
      if (terrainCache[zoneId]) {
        return terrainCache[zoneId];
      }
      
      // Запрос данных о рельефе зоны с бэкенда
      const response = await api.zone.getTerrainData(zoneId);
      
      if (response && Array.isArray(response.cells)) {
        // Преобразуем данные в удобный формат
        const terrainData = response.cells.map(cell => ({
          x: cell.x,
          y: cell.y,  // На бэкенде используется y вместо z
          height: cell.height,
          angle: cell.angle, 
          type: response.type || 'unknown',
          illumination: response.illumination || 50
        }));
        
        // Кэшируем данные
        terrainCache[zoneId] = terrainData;
        
        return terrainData;
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка при получении данных о рельефе:', error);
      return [];
    }
  }

  async function getZoneSuitability(zoneId) {
    try {
      return await api.area.getZoneSuitability(zoneId || currentZone.value?.id);
    } catch (err) {
      error.value = err.message || 'Ошибка получения данных о пригодности зоны';
      console.error('Ошибка при получении данных о пригодности зоны:', err);
      return null;
    }
  }

  // Building actions
  async function addBuilding(coords, buildingData) {
    // Создаем ключ для здания по координатам
    const key = `${coords.x},${coords.z}`

    // Если пользователь авторизован, отправляем запрос на сервер
    if (isAuthenticated.value && user.value && user.value.id !== undefined && user.value.id !== null ) {
      try {
        // Преобразуем строковый тип модуля в числовой ID для API
        const moduleTypeId = getModuleTypeIdFromString(buildingData.type);
        
        if (!moduleTypeId) {
          error.value = `Неизвестный тип модуля: ${buildingData.type}`;
          console.error('Ошибка: неизвестный тип модуля:', buildingData.type);
          return false;
        }
        
        // Получаем стоимость модуля
        const buildingCost = getModuleCost(moduleTypeId);
        const requiredMaterials = buildingCost.construction || 0;
        
        // Находим ресурс строительных материалов
        const constructionMaterials = resources.value.find(r => r.id === 'construction');
        
        // Проверяем, достаточно ли у игрока строительных материалов
        if (!constructionMaterials || constructionMaterials.value < requiredMaterials) {
          error.value = `Недостаточно строительных материалов. Требуется: ${requiredMaterials} кг`;
          console.error(`Ошибка: недостаточно строительных материалов. Имеется: ${constructionMaterials?.value || 0} кг, требуется: ${requiredMaterials} кг`);
          return false;
        }
        
        // Формируем данные для API
        // На бэкенде используется y вместо z, преобразуем координаты соответственно
        const moduleData = {
          id_user: Number(user.value.id),
          id_zone: currentZone.value?.id || 1, // ID текущей зоны или 1 по умолчанию
          module_type: moduleTypeId, // Используем числовой ID
          x: Number(coords.x),
          y: Number(coords.z) // В API используется y вместо z для вертикальной оси в 2D представлении
        }
        
        console.log('Данные для размещения модуля:', JSON.stringify(moduleData));
        
        // Создаем модуль через API (сервер сам проверит возможность размещения)
        const moduleStatus = await api.module.createModule(moduleData);
        console.log('Статус создания модуля:', moduleStatus);
        
        if (moduleStatus) {
          // Вычитаем строительные материалы при успешном размещении модуля
          constructionMaterials.value -= requiredMaterials;
          
          // Обновляем информацию о ресурсах на сервере
          try {
            const resourceUpdate = { construction: constructionMaterials.value };
            await updateResources(resourceUpdate);
          } catch (err) {
            console.error('Ошибка при обновлении ресурсов на сервере:', err);
            // Продолжаем выполнение даже при ошибке обновления ресурсов,
            // так как модуль уже был создан
          }
          
          // Сохраняем данные о здании локально только при успешном ответе API
          buildings.value[key] = {
            type: buildingData.type,
            icon: buildingData.icon,
            id: moduleStatus, // Сохраняем ID модуля, полученный от API
            footprint: buildingData.footprint,
            placedAt: new Date().toISOString(),
            meta: {
              id_zone: currentZone.value?.id,
              ...buildingData.meta
            }
          }
          
          return true
        } else {
          // API вернул falsy значение
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
      // Также проверяем наличие ресурсов даже в локальном режиме
      try {
        // Получаем стоимость модуля
        const moduleTypeId = getModuleTypeIdFromString(buildingData.type);
        const buildingCost = moduleTypeId ? getModuleCost(moduleTypeId) : { construction: 5000 }; // Значение по умолчанию, если тип неизвестен
        const requiredMaterials = buildingCost.construction || 0;
        
        // Находим ресурс строительных материалов
        const constructionMaterials = resources.value.find(r => r.id === 'construction');
        
        // Проверяем, достаточно ли у игрока строительных материалов
        if (!constructionMaterials || constructionMaterials.value < requiredMaterials) {
          error.value = `Недостаточно строительных материалов. Требуется: ${requiredMaterials} кг`;
          console.error(`Ошибка: недостаточно строительных материалов. Имеется: ${constructionMaterials?.value || 0} кг, требуется: ${requiredMaterials} кг`);
          return false;
        }
        
        // Вычитаем строительные материалы
        constructionMaterials.value -= requiredMaterials;
        
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
        error.value = err.message || 'Ошибка создания модуля';
        console.error('Ошибка при создании модуля:', err);
        return false;
      }
    }
  }

  /**
   * Преобразует строковый тип модуля в числовой ID для API
   * @param {string} typeString - Строковый тип модуля (например, 'admin_module')
   * @returns {number|null} - Числовой ID типа модуля или null, если тип не найден
   */
  function getModuleTypeIdFromString(typeString) {
    if (!typeString) return null;
    
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
    };
    
    return typeToIdMap[typeString] || null;
  }

  function getBuildings() {
    return buildings.value
  }

  function hasBuildingAt(x, z) {
    return !!buildings.value[`${x},${z}`]
  }

  async function removeBuilding(x, z) {
    const key = `${x},${z}`
    const building = buildings.value[key]

    if (building) {
      // Если пользователь авторизован, удаляем здание через API
      if (isAuthenticated.value && user.value.id && building.id) {
        try {
          await api.module.deleteModule(user.value.id, building.id)
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
  
  // Link (connection) actions
  async function createLink(fromModuleId, toModuleId) {
    if (!isAuthenticated.value || !user.value?.id) {
      error.value = 'Создание соединений доступно только авторизованным пользователям';
      return false;
    }
    
    try {
      const linkData = {
        id_user: user.value.id,
        id_from: fromModuleId,
        id_to: toModuleId
      };
      
      const result = await api.link.createLink(linkData);
      return result;
    } catch (err) {
      error.value = err.message || 'Ошибка создания соединения';
      console.error('Ошибка при создании соединения:', err);
      return false;
    }
  }

  async function deleteLink(fromModuleId, toModuleId) {
    if (!isAuthenticated.value || !user.value?.id) {
      error.value = 'Удаление соединений доступно только авторизованным пользователям';
      return false;
    }
    
    try {
      const linkData = {
        id_user: user.value.id,
        id_from: fromModuleId,
        id_to: toModuleId
      };
      
      await api.link.deleteLink(linkData);
      return true;
    } catch (err) {
      error.value = err.message || 'Ошибка удаления соединения';
      console.error('Ошибка при удалении соединения:', err);
      return false;
    }
  }

  async function getUserLinks() {
    if (!isAuthenticated.value || !user.value?.id) {
      return [];
    }
    
    try {
      return await api.link.getUserLinks(user.value.id);
    } catch (err) {
      error.value = err.message || 'Ошибка получения соединений';
      console.error('Ошибка при получении соединений:', err);
      return [];
    }
  }

  // Terrain handling methods
  async function getZoneSuitability(zoneId) {
    try {
      return await api.area.getZoneSuitability(zoneId || currentZone.value?.id);
    } catch (err) {
      error.value = err.message || 'Ошибка получения данных о пригодности зоны';
      console.error('Ошибка при получении данных о пригодности зоны:', err);
      return null;
    }
  }

  // Check if cosmodrome can be placed at given coordinates
  async function checkCosmodromePlacement(x, z) {
    if (!currentZone.value?.id) return false;
    
    try {
      // Используем специальный метод проверки требований к космодрому
      // На бэкенде используется y вместо z
      const moduleData = {
        id_zone: currentZone.value.id,
        x: Number(x),
        y: Number(z) // В API используется y вместо z для вертикальной оси в 2D представлении
      };
      
      console.log('Данные для проверки размещения космодрома:', JSON.stringify(moduleData));
      return await api.module.checkCosmodromeRequirements(moduleData);
    } catch (err) {
      console.error('Ошибка при проверке размещения космодрома:', err);
      return false;
    }
  }

  /**
   * Получение реальных лунных координат для игровых координат
   * @param {number} x - координата X в игровом мире
   * @param {number} z - координата Z в игровом мире (соответствует Y на бэкенде)
   * @returns {Promise<Object>} объект с лунными координатами
   */
  async function getLunarCoordinates(x, z) {
    if (!currentZone.value?.id) {
      return null;
    }
    
    try {
      return await api.lunarCoordinates.getLunarCoordinates(
        currentZone.value.id,
        x,
        z
      );
    } catch (err) {
      console.error('Ошибка при получении лунных координат:', err);
      error.value = err.message || 'Не удалось получить лунные координаты';
      return null;
    }
  }
  
  /**
   * Обновление лунных координат для выбранной ячейки
   */
  async function updateLunarCoordinatesForSelectedCell() {
    if (!mapState.value.selectedCell) {
      lunarCoordinates.value = null;
      return;
    }
    
    const cell = mapState.value.selectedCell;
    lunarCoordinates.value = await getLunarCoordinates(cell.x, cell.z);
  }
  
  // Наблюдаем за изменениями выбранной ячейки для обновления лунных координат
  watch(() => mapState.value.selectedCell, async () => {
    await updateLunarCoordinatesForSelectedCell();
  });

  // Инициализация - загрузка данных при создании хранилища
  async function initialize() {
    // Загружаем типы модулей с бэкенда
    try {
      await loadModuleTypes()
      console.log('Типы модулей успешно загружены:', moduleTypesState.types.length)
    } catch (err) {
      console.error('Ошибка загрузки типов модулей:', err)
    }
    
    // Проверяем, есть ли сохраненные данные сессии
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        // Загружаем данные колонии и зоны
        if (user.value.id) {
          await Promise.all([
            loadZones(),
            api.user.getStatistics(user.value.id).then(stats => {
              loadColonyData({stats})
            })
          ])
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err)
        // Если произошла ошибка, сбрасываем состояние
        logout()
      }
    }
  }
  
  // Вызываем инициализацию (в реальном приложении это обычно делается при создании приложения)
  // initialize()

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    resources,
    stats,
    currentTime,
    timeString,
    dateString,
    mapState,
    currentZone,
    zones,
    buildings,
    lunarCoordinates,
    
    // User actions
    login,
    register,
    logout,
    initialize,
    
    // Resource actions
    updateResource,
    updateResources,
    incrementTime,
    
    // Map actions
    updateZoom,
    selectCell,
    updateCell,
    startDragging,
    stopDragging,
    updateCameraPosition,
    
    // Zone actions
    loadZones,
    selectZone,
    returnToColonization,
    getZoneTerrainData,
    getZoneSuitability,
    
    // Building actions
    addBuilding,
    getBuildings,
    hasBuildingAt,
    removeBuilding,
    checkCosmodromePlacement,

    // Colonization actions
    getColonizationStatus,
    finishColonization,
    
    // Link actions
    createLink,
    deleteLink,
    getUserLinks,

    // Lunar coordinates actions
    getLunarCoordinates,
    updateLunarCoordinatesForSelectedCell
  }
})