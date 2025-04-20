// buildingApi.js
// Файл содержит логику взаимодействия с API для работы с постройками

import { useGameStore } from '../stores/gameStore'
import * as THREE from 'three'
import { BuildingEntity } from './buildingsData'
import api from '../services/api' // Добавляем импорт API сервиса

/**
 * Функция для подтверждения размещения здания
 * Вызывает API для размещения здания и обновляет state
 */
export async function confirmBuildingPlacement({ selectedItem, selectedCell, three, buildings, cells, showBuildMenu, errorMessage }) {
  if (!selectedItem.value || !selectedCell.value) return false
  
  const coords = { 
    x: selectedCell.value.x, 
    z: selectedCell.value.z 
  }
  
  const key = `${coords.x},${coords.z}`
  
  // Проверяем, нет ли уже здания в этой ячейке
  if (buildings.value[key]) {
    errorMessage.value = 'На этой ячейке уже есть постройка'
    return false
  }
  
  const store = useGameStore()
  
  try {
    // Преобразуем строковое название типа модуля в числовой ID, если это необходимо
    let moduleTypeId = selectedItem.value.typeId || null;
    
    if (!moduleTypeId && selectedItem.value.type) {
      // Если typeId не задан, пытаемся преобразовать строковый тип в числовой ID
      moduleTypeId = store.getModuleTypeIdFromString ? 
                    store.getModuleTypeIdFromString(selectedItem.value.type) : 
                    null;
      
      // Если строковый тип не удалось преобразовать в числовой ID,
      // используем карту соответствия типов модулей
      if (!moduleTypeId) {
        const typeToIdMap = {
          'residential_complex_2x1': 1,
          'admin_module': 2,
          'medical_module': 3,
          'sport_module': 4,
          'research_module': 5,
          'plantation': 6,
          'solar_power_plant': 10,
          'mining_base': 11,
          'manufacture': 12,
          'warehouse': 13,
          'waste_center': 14,
          'repair_module': 15,
          'communication_tower': 20,
          'telescope': 21,
          'cosmodrome': 22
        };
        
        moduleTypeId = typeToIdMap[selectedItem.value.type] || null;
      }
    }
    
    // Проверяем, что удалось получить числовой ID типа модуля
    if (!moduleTypeId) {
      errorMessage.value = `Неизвестный тип модуля: ${selectedItem.value.type}`;
      console.error('Ошибка: не удалось определить числовой ID типа модуля:', selectedItem.value.type);
      return false;
    }
    
    // Проверка наличия достаточного количества строительных материалов
    // Импортируем функцию для получения стоимости модуля
    const { getModuleCost } = await import('./buildingsData');
    
    // Получаем стоимость модуля в строительных материалах
    const buildingCost = getModuleCost(moduleTypeId);
    const requiredMaterials = buildingCost.construction || 0;
    
    // Находим ресурс строительных материалов
    const constructionMaterials = store.resources.find(r => r.id === 'construction');
    
    // Проверяем, достаточно ли у игрока строительных материалов
    if (!constructionMaterials || constructionMaterials.value < requiredMaterials) {
      const available = constructionMaterials?.value || 0;
      errorMessage.value = `Недостаточно строительных материалов. Имеется: ${available} кг, требуется: ${requiredMaterials} кг`;
      console.warn(`Недостаточно строительных материалов для постройки. Имеется: ${available} кг, требуется: ${requiredMaterials} кг`);
      return false;
    }
    
    // Отправляем запрос для проверки возможности размещения
    // При этом преобразуем координаты в формат бэкенда (z -> y)
    const checkResult = await api.module.checkPlacement({
      id_user: Number(store.user?.id),
      module_type: Number(moduleTypeId),  // Гарантированно числовой ID
      x: Number(coords.x),
      y: Number(coords.z), // Используем параметр 'y' вместо 'z' для бэкенда
      id_zone: store.currentZone?.id || 1
    })
    
    console.log('Результат проверки размещения:', checkResult)
    
    if (!checkResult.possible) {
      errorMessage.value = checkResult.message || 'Невозможно разместить здание в этом месте';
      return false;
    }
    
    // Если проверка успешна, добавляем здание
    const result = await store.addBuilding(coords, selectedItem.value)
    
    if (result) {
      // Сбрасываем выбор
      selectedItem.value = null
      showBuildMenu.value = false
      
      // Обновляем внешний вид клетки, чтобы показать здание
      if (selectedCell.value) {
        selectedCell.value.isOccupied = true
        
        // Обновляем материал ячейки, чтобы показать здание
        // Логика зависит от реализации рендера в Three.js
      }
      
      return true
    } else {
      errorMessage.value = store.error || 'Не удалось разместить здание'
      return false
    }
  } catch (error) {
    console.error('Ошибка при размещении здания:', error)
    errorMessage.value = error.message || 'Произошла ошибка при размещении здания'
    return false
  }
}

/**
 * Визуализация постройки на карте: загрузка текстуры и отображение в ячейках
 * @param {object} params
 * @param {string} params.iconPath - Путь к текстуре здания
 * @param {Array} params.footprint - Массив ячеек, занимаемых зданием
 * @param {object} params.buildings - Реф на карту построек
 * @param {object} params.cells - Реф на карту ячеек
 * @param {object} params.selectedItem - Реф на выбранный объект строительства
 * @param {object} params.three - Объекты three.js
 * @returns {Promise} - Промис, разрешающийся после завершения отрисовки
 */
export function renderBuilding({ iconPath, footprint, buildings, cells, selectedItem, three }) {
  return new Promise((resolve, reject) => {
    // Загрузка текстуры здания
    const textureLoader = new THREE.TextureLoader()
    
    console.log('Attempting to load building texture from:', iconPath);
    
    textureLoader.load(iconPath, 
      (texture) => {
        console.log('Texture loaded successfully:', iconPath);
        // Настройка текстуры для лучшего отображения
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
      
        // Применяем текстуру к каждой ячейке в footprint здания
        for (const pos of footprint) {
          const key = `${pos.x},${pos.z}`
          const cell = cells.value[key]
          
          if (cell && cell.mesh) {
            console.log('Applying texture to cell:', key);
            // Отмечаем ячейку как занятую
            cell.isOccupied = true
            cell._hasBuilding = true
            
            // Сохраняем оригинальный материал
            if (!cell.originalMaterial) {
              cell.originalMaterial = cell.mesh.material.clone()
            }
            
            // Создаем новый материал с текстурой здания
            const buildingMaterial = new THREE.MeshBasicMaterial({
              map: texture.clone(), // Используем клон текстуры для каждой ячейки
              side: THREE.DoubleSide
            })
            
            // Заменяем материал ячейки
            if (cell.mesh.material) {
              cell.mesh.material.dispose()
            }
            
            // Применяем новый материал
            cell.mesh.material = buildingMaterial
            cell.mesh.material.needsUpdate = true
            
            // Сохраняем здание в локальной карте зданий
            buildings.value[key] = new BuildingEntity(
              null, // Нам не нужен отдельный mesh для здания, мы используем ячейку
              pos.x,
              pos.z,
              {
                type: selectedItem.value?.type || null,
                footprint,
                iconPath: iconPath,
                cells: [cell] // Сохраняем ссылки на ячейки для возможности удаления здания
              }
            )
          } else {
            console.error('Cell not found or has no mesh:', key);
          }
        }
        
        // Сброс цвета выделения всех ячеек
        Object.values(cells.value).forEach(cellEntity => {
          if (!cellEntity.isOccupied) {
            cellEntity.mesh.material.color.setHex(0x808080)
          }
          cellEntity.isSelected = false
        })
        
        resolve()
      }, 
      undefined,
      (error) => {
        console.error('Ошибка загрузки текстуры здания:', error, 'Path:', iconPath)
        // Показываем заместительную текстуру в случае ошибки
        const fallbackTexturePath = '/buildings/technological/repair-module.png'
        console.log('Trying fallback texture:', fallbackTexturePath);
        
        textureLoader.load(fallbackTexturePath, 
          (fallbackTexture) => {
            console.log('Fallback texture loaded successfully');
            // Применяем запасную текстуру к каждой ячейке
            for (const pos of footprint) {
              const key = `${pos.x},${pos.z}`
              const cell = cells.value[key]
              
              if (cell && cell.mesh) {
                // Остальной код по обработке ячейки...
                cell.isOccupied = true
                cell._hasBuilding = true
                
                if (!cell.originalMaterial) {
                  cell.originalMaterial = cell.mesh.material.clone()
                }
                
                const fallbackMaterial = new THREE.MeshBasicMaterial({
                  map: fallbackTexture.clone(),
                  side: THREE.DoubleSide
                })
                
                if (cell.mesh.material) {
                  cell.mesh.material.dispose()
                }
                
                cell.mesh.material = fallbackMaterial
                cell.mesh.material.needsUpdate = true
                
                buildings.value[key] = new BuildingEntity(
                  null,
                  pos.x,
                  pos.z,
                  {
                    type: selectedItem.value?.type || null,
                    footprint,
                    iconPath: fallbackTexturePath,
                    cells: [cell]
                  }
                )
              }
            }
            resolve()
          },
          undefined,
          (fallbackError) => {
            console.error('Even fallback texture failed to load:', fallbackError)
            reject(error)
          }
        )
      }
    )
  })
}

/**
 * Удаление постройки с карты
 * @param {object} params
 * @param {number} params.x - Координата X постройки
 * @param {number} params.z - Координата Z постройки
 * @param {object} params.buildings - Реф на карту построек
 * @param {object} params.cells - Реф на карту ячеек
 * @returns {Promise<boolean>} - Успешность операции
 */
export async function removeBuildingFromMap({ x, z, buildings, cells }) {
  const key = `${x},${z}`
  const building = buildings.value[key]
  
  if (!building) return false
  
  const store = useGameStore()
  
  try {
    // Удаляем здание через API и хранилище
    const success = await store.removeBuilding(x, z)
    
    if (!success) return false
    
    // Обновляем состояние ячеек на карте
    if (building.footprint) {
      building.footprint.forEach(pos => {
        const posKey = `${pos.x},${pos.z}`
        const cell = cells.value[posKey]
        
        if (cell) {
          // Возвращаем оригинальный материал ячейке
          if (cell.originalMaterial) {
            if (cell.mesh.material) {
              cell.mesh.material.dispose()
            }
            cell.mesh.material = cell.originalMaterial
            cell.mesh.material.needsUpdate = true
          }
          
          // Сбрасываем состояние ячейки
          cell.isOccupied = false
          cell._hasBuilding = false
        }
      })
    }
    
    return true
  } catch (error) {
    console.error('Ошибка при удалении здания:', error)
    return false
  }
}