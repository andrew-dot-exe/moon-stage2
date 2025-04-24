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
  
  // Получаем footprint здания (может быть одной точкой или прямоугольником)
  const footprint = selectedItem.value.footprint || [{x:0,z:0}];
  
  // Определяем границы здания
  let minX, maxX, minZ, maxZ;
  
  if (footprint.length === 1) {
    // Одноячеечное здание
    minX = maxX = selectedCell.value.x;
    minZ = maxZ = selectedCell.value.z;
  } else {
    // Многоячеечное здание - рассчитываем относительно выбранной ячейки
    const [startPos, endPos] = footprint;
    const offsetX = selectedCell.value.x - startPos.x;
    const offsetZ = selectedCell.value.z - startPos.z;
    
    minX = offsetX + Math.min(startPos.x, endPos.x);
    maxX = offsetX + Math.max(startPos.x, endPos.x);
    minZ = offsetZ + Math.min(startPos.z, endPos.z);
    maxZ = offsetZ + Math.max(startPos.z, endPos.z);
  }
  // Проверяем все ячейки в области
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      const cellKey = `${x},${z}`;
      const cell = cells.value[cellKey];
      
      // Проверяем существование ячейки
      if (!cell) {
        errorMessage.value = `Ячейка ${cellKey} находится за границами карты`;
        return false;
      }
      
      // Проверяем занятость ячейки
      if (cell.isOccupied || buildings.value[cellKey]) {
        errorMessage.value = `Область строительства пересекается с существующей постройкой (${cellKey})`;
        return false;
      }
    }
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
          'residential_complex_2x1': 0,
          'residential_complex_1x2': 1,
          'live_admin_module': 2,
          'admin_module': 11,
          'medical_module': 4,
          'sport_module': 3,
          'p_research_module': 6,
          'm_research_module': 7,
          't_research_module': 8,
          'ter_research_module': 9,
          'plantation': 5,
          'hallway': 10,
          'solar_power_plant': 12,
          'mining_base': 21,
          'manufacture': 18,
          'fuel_manufacture': 19,
          'food_warehouse': 22,
          'gases_warehouse': 23,
          'fuel_warehouse': 24,
          'material_warehouse': 25,
          'waste_center':16,
          'bio_waste_center': 17,
          'repair_module': 13,
          'communication_tower':15,
          'telescope':20,
          'cosmodrome':14
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
      
      // TODO несколько ячеек?
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
// TODO проверить на работоспособность
export function renderBuilding({ iconPath, footprint, buildings, cells, selectedItem, three }) {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(iconPath, 
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Определяем границы здания
        let minX, maxX, minZ, maxZ;
        
        if (footprint.length === 1) {
          minX = maxX = footprint[0].x;
          minZ = maxZ = footprint[0].z;
        } else {
          const [startPos, endPos] = footprint;
          minX = Math.min(startPos.x, endPos.x);
          maxX = Math.max(startPos.x, endPos.x);
          minZ = Math.min(startPos.z, endPos.z);
          maxZ = Math.max(startPos.z, endPos.z);
        }

        // Размеры здания в ячейках
        const width = maxX - minX + 1;
        const depth = maxZ - minZ + 1;

        // Создаем геометрию для всего здания
        const geometry = new THREE.PlaneGeometry(width, depth);
        
        // Настраиваем UV-координаты для правильного растягивания текстуры
        const uvAttribute = geometry.attributes.uv;
        for (let i = 0; i < uvAttribute.count; i++) {
          uvAttribute.setX(i, uvAttribute.getX(i) * width);
          uvAttribute.setY(i, uvAttribute.getY(i) * depth);
        }
        uvAttribute.needsUpdate = true;

        // Создаем материал с текстурой
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true
        });

        // Создаем mesh для всего здания
        const buildingMesh = new THREE.Mesh(geometry, material);
        buildingMesh.position.set(
          minX + width / 2 - 0.5, // Центрируем по X
          0.01, // Немного выше поверхности
          minZ + depth / 2 - 0.5  // Центрируем по Z
        );
        buildingMesh.rotation.x = -Math.PI / 2; // Разворачиваем горизонтально

        // Добавляем mesh в сцену
        three.scene.add(buildingMesh);

        // Помечаем ячейки как занятые
        const buildingCells = [];
        for (let x = minX; x <= maxX; x++) {
          for (let z = minZ; z <= maxZ; z++) {
            const key = `${x},${z}`;
            const cell = cells.value[key];
            if (cell) {
              cell.isOccupied = true;
              cell._hasBuilding = true;
              buildingCells.push(cell);
            }
          }
        }

        // Сохраняем здание
        const buildingKey = `${minX},${minZ}`; // Используем первую ячейку как ключ
        buildings.value[buildingKey] = new BuildingEntity(
          buildingMesh,
          minX,
          minZ,
          {
            type: selectedItem.value?.type || null,
            footprint: footprint.length === 1 ? [footprint[0]] : footprint,
            iconPath: iconPath,
            cells: buildingCells,
            width,
            depth
          }
        );

        resolve();
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки текстуры:', error);
        reject(error);
      }
    );
  });
}
/*
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
*/
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