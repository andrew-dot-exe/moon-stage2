// gameStore.js - центральное хранилище состояния игры (композиция всех других хранилищ)
import { defineStore } from 'pinia'
import { watch } from 'vue'

// Импортируем все модульные хранилища
import { useUserStore } from './userStore'
import { useResourceStore } from './resourceStore'
import { useTimeStore } from './timeStore'
import { useMapStore } from './mapStore'
import { useZoneStore } from './zoneStore'
import { useBuilingStore } from './buildingStore'
import { useLinkStore } from './linkStore'
import { useLunarCoordinatesStore } from './lunarCoordinatesStore'
import { useStatsStore } from './statsStore'
import { useColonizationStore } from './colonizationStore'

export const useGameStore = defineStore('game', () => {
  // Создаем экземпляры всех модульных хранилищ
  const userStore = useUserStore()
  const resourceStore = useResourceStore()
  const timeStore = useTimeStore()
  const mapStore = useMapStore()
  const zoneStore = useZoneStore()
  const buildingStore = useBuilingStore()
  const linkStore = useLinkStore()
  const lunarCoordsStore = useLunarCoordinatesStore()
  const statsStore = useStatsStore()
  const colonizationStore = useColonizationStore()

  // Настраиваем наблюдатели за состоянием ячейки для обновления лунных координат
  watch(() => mapStore.mapState.value.selectedCell, async (selectedCell) => {
    if (selectedCell && zoneStore.currentZone.value) {
      await lunarCoordsStore.updateCoordinatesForCell(
        selectedCell, 
        zoneStore.currentZone.value.id
      )
    } else {
      lunarCoordsStore.lunarCoordinates.value = null
    }
  })

  /**
   * Обновление состояния при смене дня
   */
  function updateStateFromDayChanges(dayChanges) {
    // Обновляем ресурсы
    if (dayChanges.resources) {
      Object.entries(dayChanges.resources).forEach(([key, value]) => {
        resourceStore.updateResource(key, value)
      })
    }
    
    // Обновляем статистику
    if (dayChanges.stats) {
      statsStore.updateStats(dayChanges.stats)
    }
  }

  /**
   * Загрузка данных о колонии
   */
  function loadColonyData(colonyData) {
    if (!colonyData) return
    
    // Загружаем ресурсы
    resourceStore.loadResources(colonyData)
    
    // Загружаем статистику
    statsStore.loadStats(colonyData)
    
    // Загружаем игровое время
    timeStore.loadTime(colonyData)
    
    // Загружаем модули
    if (colonyData.modules) {
      buildingStore.loadModulesFromAPI(colonyData.modules)
    }
  }

  /**
   * Сброс состояния колонии
   */
  function resetColonyState() {
    resourceStore.resetResources()
    statsStore.resetStats()
    buildingStore.buildings.value = {}
  }

  /**
   * Обертка для входа пользователя с загрузкой данных колонии
   */
  async function login(email, password) {
    try {
      const userData = await userStore.login(email, password)
      // Загружаем данные о колонии, если они есть
      if (userData.colony) {
        loadColonyData(userData.colony)
      }
      return userData
    } catch (err) {
      throw err
    }
  }

  /**
   * Обертка для выхода из системы с сбросом данных колонии
   */
  function logout() {
    userStore.logout()
    resetColonyState()
  }

  /**
   * Инициализация данных при старте приложения
   */
  async function initialize() {
    // Инициализировать модуль зданий
    await buildingStore.initialize()
    
    // Проверяем, есть ли сохраненные данные сессии
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        userStore.user.value = JSON.parse(savedUser)
        // Загружаем данные колонии и зоны
        if (userStore.user.value.id) {
          await Promise.all([
            zoneStore.loadZones(userStore.user.value.id),
            statsStore.loadStats({stats: await api.user.getStatistics(userStore.user.value.id)})
          ])
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err)
        // Если произошла ошибка, сбрасываем состояние
        logout()
      }
    }
  }

  return {
    // State (из userStore)
    get user() { return userStore.user },
    get isAuthenticated() { return userStore.isAuthenticated },
    get isLoading() { return userStore.isLoading },
    get error() { 
      // Объединяем ошибки из всех хранилищ
      return userStore.error || 
             resourceStore.error || 
             buildingStore.error || 
             linkStore.error || 
             zoneStore.error || 
             lunarCoordsStore.error || 
             colonizationStore.error 
    },
    
    // Resources (из resourceStore)
    get resources() { return resourceStore.resources },
    
    // Stats (из statsStore)
    get stats() { return statsStore.stats },
    
    // Time (из timeStore)
    get currentTime() { return timeStore.currentTime },
    get timeString() { return timeStore.timeString },
    get dateString() { return timeStore.dateString },
    
    // Map (из mapStore)
    get mapState() { return mapStore.mapState },
    
    // Zone (из zoneStore)
    get currentZone() { return zoneStore.currentZone },
    get zones() { return zoneStore.zones },
    
    // Buildings (из buildingStore)
    get buildings() { return buildingStore.buildings },
    
    // Lunar coordinates (из lunarCoordsStore)
    get lunarCoordinates() { return lunarCoordsStore.lunarCoordinates },
    
    // User actions
    login,
    register: userStore.register,
    logout,
    initialize,
    
    // Resource actions
    updateResource: (id, newValue) => resourceStore.updateResource(id, newValue, userStore.user.value?.id),
    updateResources: (resourceData) => resourceStore.updateResources(resourceData, userStore.user.value?.id),
    incrementTime: () => timeStore.incrementTime(updateStateFromDayChanges, userStore.user.value?.id),
    
    // Map actions
    updateZoom: mapStore.updateZoom,
    selectCell: mapStore.selectCell,
    updateCell: mapStore.updateCell,
    startDragging: mapStore.startDragging,
    stopDragging: mapStore.stopDragging,
    updateCameraPosition: mapStore.updateCameraPosition,
    
    // Zone actions
    loadZones: () => zoneStore.loadZones(userStore.user.value?.id),
    selectZone: zoneStore.selectZone,
    returnToColonization: zoneStore.returnToColonization,
    getZoneTerrainData: (zoneId) => zoneStore.getZoneTerrainData(zoneId, userStore.user.value?.id),
    getZoneSuitability: zoneStore.getZoneSuitability,
    
    // Building actions
    addBuilding: (coords, buildingData) => buildingStore.addBuilding(
      coords, 
      buildingData, 
      userStore.user.value?.id, 
      zoneStore.currentZone.value?.id,
      // Колбэк для управления ресурсами
      async (resourceId, amount) => {
        const resource = resourceStore.resources.value.find(r => r.id === resourceId)
        if (!resource) return false
        if (resource.value + amount < 0) return false
        
        resourceStore.updateResource(resourceId, resource.value + amount, userStore.user.value?.id)
        return true
      }
    ),
    getBuildings: buildingStore.getBuildings,
    hasBuildingAt: buildingStore.hasBuildingAt,
    removeBuilding: (x, z) => buildingStore.removeBuilding(x, z, userStore.user.value?.id),
    checkCosmodromePlacement: (x, z) => buildingStore.checkCosmodromePlacement(x, z, zoneStore.currentZone.value?.id),

    // Colonization actions
    getColonizationStatus: () => colonizationStore.getColonizationStatus(userStore.user.value?.id),
    finishColonization: () => colonizationStore.finishColonization(userStore.user.value?.id),
    
    // Link actions
    createLink: (fromModuleId, toModuleId) => linkStore.createLink(fromModuleId, toModuleId, userStore.user.value?.id),
    deleteLink: (fromModuleId, toModuleId) => linkStore.deleteLink(fromModuleId, toModuleId, userStore.user.value?.id),
    getUserLinks: () => linkStore.getUserLinks(userStore.user.value?.id),

    // Lunar coordinates actions
    getLunarCoordinates: (x, z) => lunarCoordsStore.getLunarCoordinates(x, z, zoneStore.currentZone.value?.id),
    updateLunarCoordinatesForSelectedCell: () => {
      if (mapStore.mapState.value.selectedCell && zoneStore.currentZone.value) {
        return lunarCoordsStore.updateCoordinatesForCell(
          mapStore.mapState.value.selectedCell, 
          zoneStore.currentZone.value.id
        )
      }
    }
  }
})