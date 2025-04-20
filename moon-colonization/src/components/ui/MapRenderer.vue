<script setup>
import { ref, onMounted, onUnmounted, watch, defineEmits } from 'vue'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'
import CellInfoPanel from './CellInfoPanel.vue'

const props = defineProps({
  isMinimap: {
    type: Boolean,
    default: false
  },
  viewportSize: {
    type: Object,
    default: () => ({ width: 1, height: 1 })
  }
})

// Определяем события, которые компонент будет эмитить
const emit = defineEmits(['openBuildMenu', 'removeBuilding']);

const store = useGameStore()
const container = ref(null)
const selectedCell = ref(null)
const showCellInfo = ref(false)
const isBuildMenuOpen = ref(false)

// Добавляем состояния для отображения подсказки при наведении на ячейку
const hoveredCell = ref(null);
const showHoverTooltip = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });

// Use non-reactive variables for Three.js objects
let scene = null
let camera = null
const renderer = new THREE.WebGLRenderer({ antialias: true })
const cells = new Map()

// Кэшируем загруженные текстуры для предотвращения повторных загрузок
const textureCache = new Map();

// Helper function to format coordinates
function formatCoordinate(value, type) {
  if (type === 'lat') {
    return `${value.toFixed(2)}° N`;
  } else if (type === 'long') {
    return `${value.toFixed(2)}° E`;
  }
  return value.toFixed(2);
}

function initScene() {
  if (!container.value) return

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera setup
  const gridSize = store.mapState.gridSize
  const cellSize = store.mapState.cellSize
  
  if (props.isMinimap) {
    // Используем ортографическую камеру с тем же обзором, что и у основной карты
    // для обеспечения визуального соответствия
    camera = new THREE.OrthographicCamera(
      -gridSize/2, // left
      gridSize/2,  // right
      gridSize/2,  // top
      -gridSize/2, // bottom
      0.1,        // near
      1000        // far
    )
    // Установим камеру сверху, направленную вниз, как на основной карте
    camera.position.set(0, 20, 0)
    camera.lookAt(0, 0, 0)
  } else {
    // Calculate center position
    const centerX = 0
    const centerZ = 0
    const distance = Math.max(gridSize, gridSize) * 1.5 // Adjust multiplier as needed
    
    camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
    camera.position.set(centerX, distance, centerZ)
    camera.lookAt(centerX, 0, centerZ)
  }

  // Grid setup
  const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize)
  const cellMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    roughness: 0.8,
    metalness: 0.2
  })

  // Create cells
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let z = -gridSize/2; z < gridSize/2; z++) {
      const cell = new THREE.Mesh(cellGeometry, cellMaterial.clone())
      cell.position.set(x, 0, z)
      cell.rotation.x = -Math.PI / 2
      cell.userData = { x, z }
      scene.add(cell)
      cells.set(`${x},${z}`, cell)
    }
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // Renderer setup
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  // Start animation loop
  animate()
}

function updateTextures() {
  const textureLoader = new THREE.TextureLoader()
  
  cells.forEach((cell, key) => {
    const coords = cell.userData
    const zone = store.zones.find(z => 
      z.x === coords.x && z.z === coords.z
    )
    
    // Проверяем, есть ли здание в этой ячейке
    const buildingKey = `${coords.x},${coords.z}`
    const building = store.buildings[buildingKey]
    
    if (building) {
      // Если в ячейке есть здание, отображаем его текстуру
      textureLoader.load(building.icon, (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        
        cell.material.map = texture
        cell.material.needsUpdate = true
        
        // Убеждаемся, что материал не зависит от LOD 
        // и не будет заменен при обновлении текстур зон
        cell._hasBuilding = true
      })
    } else if (zone && !cell._hasBuilding) {
      // Если в ячейке зона и нет здания, показываем текстуру зоны
      const zoneType = zone.type
      const texturePath = `${store.mapState.textureBasePath}${store.mapState.textureLODs[store.mapState.currentLOD].path}${store.mapState.zoneTextures[zoneType].texture}.jpg`
      
      textureLoader.load(texturePath, (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)
        texture.minFilter = THREE.LinearMipMapLinearFilter
        texture.magFilter = THREE.LinearFilter
        
        cell.material.map = texture
        cell.material.color.setHex(0x808080)
        cell.material.needsUpdate = true
      })
    }
  })
}

// Функция для загрузки и отображения построенных зданий из хранилища
function loadBuildingsFromStore(forceReload = false) {
  if (!scene) return;
  
  const buildings = store.getBuildings();
  
  // Выводим лог только при первой загрузке или при принудительной перезагрузке
  if (forceReload) {
    console.log('Force reloading buildings from store:', buildings);
  }
  
  const textureLoader = new THREE.TextureLoader();
  
  // Сначала помечаем все ячейки как не содержащие зданий
  cells.forEach(cell => {
    if (!forceReload && cell._hasBuilding) return; // Пропускаем уже обработанные ячейки при обычном обновлении
    cell._hasBuilding = false;
  });
  
  // Проходим по всем зданиям в хранилище
  Object.entries(buildings).forEach(([key, building]) => {
    // Проверяем наличие необходимых данных
    if (!building || !building.icon) {
      if (forceReload) console.warn(`Building at ${key} missing icon property:`, building);
      return;
    }
    
    const coords = key.split(',').map(Number);
    const cellKey = `${coords[0]},${coords[1]}`;
    const cell = cells.get(cellKey);
    
    if (!cell) {
      if (forceReload) console.error(`Cell not found for coordinates ${cellKey}`);
      return;
    }
    
    // Проверяем, было ли уже загружено здание для этой ячейки и не изменилась ли текстура
    const cacheKey = `${cellKey}:${building.icon}`;
    if (!forceReload && cell._hasBuilding && cell._buildingIcon === building.icon) {
      return; // Пропускаем, если ячейка уже содержит то же самое здание
    }
    
    // Помечаем ячейку как содержащую здание и сохраняем путь к текстуре для будущих проверок
    cell._hasBuilding = true;
    cell._buildingIcon = building.icon;
    
    // Проверяем, есть ли текстура в кэше
    if (textureCache.has(building.icon)) {
      const cachedTexture = textureCache.get(building.icon);
      applyBuildingTexture(cell, cachedTexture);
    } else {
      // Загружаем текстуру, если ее нет в кэше
      textureLoader.load(building.icon, 
        // При успешной загрузке
        (texture) => {
          // Сохраняем текстуру в кэш
          textureCache.set(building.icon, texture);
          applyBuildingTexture(cell, texture);
        }, 
        // При прогрессе загрузки
        undefined, 
        // При ошибке
        (error) => {
          console.error('Error loading building texture:', error, 'Path:', building.icon);
          cell._hasBuilding = false; // Сбрасываем флаг при ошибке
          cell._buildingIcon = null;
        }
      );
    }
  });
}

// Вспомогательная функция для применения текстуры к ячейке
function applyBuildingTexture(cell, texture) {
  // Клонируем текстуру, чтобы избежать проблем с общим использованием
  const textureClone = texture.clone();
  
  // Настраиваем параметры текстуры
  textureClone.wrapS = THREE.ClampToEdgeWrapping;
  textureClone.wrapT = THREE.ClampToEdgeWrapping;
  textureClone.repeat.set(1, 1);
  textureClone.offset.set(0, 0);
  textureClone.center.set(0, 0);
  textureClone.minFilter = THREE.LinearFilter;
  textureClone.magFilter = THREE.LinearFilter;

  // Создаем новый материал с текстурой
  const buildingMaterial = new THREE.MeshBasicMaterial({
    map: textureClone,
    side: THREE.DoubleSide,
    transparent: true
  });

  // Применяем новый материал к ячейке
  if (cell.material) cell.material.dispose();
  cell.material = buildingMaterial;
  cell.material.needsUpdate = true;
  
  // Поддерживаем правильную ориентацию
  cell.rotation.x = -Math.PI / 2;
}

// Функция для обработки клика по ячейке
function handleCellClick(event) {
  if (!scene || !camera) return

  // Вычисляем позицию мыши в нормализованных координатах (-1 до +1)
  const rect = container.value.getBoundingClientRect()
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Создаем raycaster для определения пересечения луча с объектами сцены
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera)

  // Создаем массив всех ячеек для проверки пересечения
  const cellMeshes = Array.from(cells.values())
  const intersects = raycaster.intersectObjects(cellMeshes)

  if (intersects.length > 0) {
    const intersectedCell = intersects[0].object
    const x = intersectedCell.userData.x
    const z = intersectedCell.userData.z
    
    // Извлекаем данные о высоте и угле наклона из userData ячейки
    const height = intersectedCell.userData.height || 0
    const angle = intersectedCell.userData.angle || 0
    
    // Обновляем выбранную ячейку с дополнительными данными
    selectedCell.value = { 
      x, 
      z, 
      height, 
      angle
    }
    
    // Показываем панель информации о ячейке
    showCellInfo.value = true
    
    // Уведомляем хранилище о выбранной ячейке для обновления лунных координат
    store.selectCell({ x, z, height, angle })
    
    // После выбора ячейки загружаем данные о рельефе, если они доступны
    if (store.currentZone && store.currentZone.id) {
      loadCellTerrainData(x, z);
    }
    
    // Подсветка выбранной ячейки (опционально)
    cells.forEach(cell => {
      if (cell._hasBuilding) return // Не меняем цвет ячеек со зданиями
      
      if (cell === intersectedCell) {
        cell.material.emissive = new THREE.Color(0x003300)
        cell.material.emissiveIntensity = 0.5
      } else {
        cell.material.emissive = new THREE.Color(0x000000)
        cell.material.emissiveIntensity = 0
      }
    })
  }
}

// Функция для обработки движения мыши над ячейками (hovering)
function handleMouseMove(event) {
  if (!scene || !camera) return;
  
  // Вычисляем позицию мыши в нормализованных координатах (-1 до +1)
  const rect = container.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Обновляем raycaster
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
  
  // Проверяем пересечение с ячейками
  const cellMeshes = Array.from(cells.values());
  const intersects = raycaster.intersectObjects(cellMeshes);
  
  if (intersects.length > 0) {
    const intersectedCell = intersects[0].object;
    const x = intersectedCell.userData.x;
    const z = intersectedCell.userData.z;
    const height = intersectedCell.userData.height || 0;
    const angle = intersectedCell.userData.angle || 0;
    
    // Обновляем информацию о ячейке под курсором
    hoveredCell.value = { x, z, height, angle };
    
    // Получаем лунные координаты для этой ячейки, если возможно
    if (store.currentZone && store.currentZone.id) {
      store.getLunarCoordinates(x, z).then(coords => {
        if (coords && hoveredCell.value && hoveredCell.value.x === x && hoveredCell.value.z === z) {
          hoveredCell.value.lunarCoords = coords;
        }
      }).catch(err => {
        console.error('Ошибка при получении лунных координат для подсказки:', err);
      });
    }
    
    // Показываем подсказку и обновляем её позицию
    showHoverTooltip.value = true;
    tooltipPosition.value = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Подсветка ячейки при наведении (если она не выбрана)
    if (!intersectedCell._isSelected) {
      intersectedCell.material.emissive = new THREE.Color(0x222222);
      intersectedCell.material.emissiveIntensity = 0.3;
    }
  } else {
    // Скрываем подсказку, если не наводим на ячейку
    showHoverTooltip.value = false;
    hoveredCell.value = null;
    
    // Убираем подсветку со всех ячеек, кроме выбранной
    cells.forEach(cell => {
      if (!cell._isSelected) {
        cell.material.emissive = new THREE.Color(0x000000);
        cell.material.emissiveIntensity = 0;
      }
    });
  }
}

// Функция для загрузки данных о рельефе ячейки
async function loadCellTerrainData(x, z) {
  try {
    const zoneId = store.currentZone.id;
    const terrainData = await store.getZoneTerrainData(zoneId);
    
    if (terrainData) {
      // Найдем данные для конкретной ячейки
      const cellTerrain = terrainData.find(t => 
        t.x === x && t.y === z
      );
      
      if (cellTerrain) {
        // Обновляем данные о высоте ячейки
        const cell = cells.get(`${x},${z}`);
        if (cell) {
          // Обновляем userData в Three.js объекте
          cell.userData.height = cellTerrain.height || 0;
          cell.userData.angle = cellTerrain.angle || 0;
          
          // Визуально отображаем высоту (если нужно)
          // cell.position.y = cellTerrain.height / 1000; // Нормализуем для визуализации
          
          // Если у нас есть объект CellEntity, обновляем и его тоже
          const cellKey = `${x},${z}`;
          const cellEntity = cells.get(cellKey);
          if (cellEntity && typeof cellEntity.updateHeight === 'function') {
            cellEntity.updateHeight(cellTerrain.height, cellTerrain.angle);
          }
          
          // Обновляем выбранную ячейку для корректного отображения в панели
          if (selectedCell.value && selectedCell.value.x === x && selectedCell.value.z === z) {
            selectedCell.value = {
              ...selectedCell.value,
              height: cellTerrain.height,
              angle: cellTerrain.angle
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных о рельефе:', error);
  }
}

// Функция для загрузки данных о рельефе всей зоны
async function loadZoneTerrainData() {
  try {
    if (!store.currentZone || !store.currentZone.id) return;
    
    const zoneId = store.currentZone.id;
    const terrainData = await store.getZoneTerrainData(zoneId);
    
    if (terrainData && Array.isArray(terrainData)) {
      console.log(`Загружено ${terrainData.length} ячеек с данными о рельефе`);
      
      // Применяем данные о рельефе ко всем ячейкам
      terrainData.forEach(cellData => {
        const x = cellData.x;
        const z = cellData.y; // На бэкенде используется y вместо z
        const height = cellData.height || 0;
        const angle = cellData.angle || 0;
        
        // Находим ячейку по координатам
        const cellKey = `${x},${z}`;
        const cell = cells.get(cellKey);
        
        if (cell) {
          // Обновляем userData в Three.js объекте
          cell.userData.height = height;
          cell.userData.angle = angle;
          
          // Визуально отображаем высоту
          const visualHeight = height / 400;
          cell.position.y = visualHeight;
          
          // Если у ячейки есть информация о наклоне, применяем его
          if (angle > 0) {
            const angleRad = (angle * Math.PI) / 180;
            const maxAngle = 0.2; // Ограничиваем максимальный угол для визуализации
            const scaledAngle = Math.min(angleRad * 0.1, maxAngle);
            
            // Применяем случайное направление наклона для более реалистичного вида
            cell.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * scaledAngle;
            cell.rotation.z = (Math.random() - 0.5) * scaledAngle;
          }
          
          // Окрашиваем ячейку в зависимости от высоты
          colorCellByHeight(cell, height);
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных о рельефе зоны:', error);
  }
}

// Функция для окрашивания ячейки в зависимости от высоты
function colorCellByHeight(cell, height) {
  if (!cell || !cell.material || cell._hasBuilding) return;
  
  // Минимальная и максимальная высота для нормализации цвета
  const minHeight = -5000; // минимальная высота рельефа в метрах
  const maxHeight = 5000;  // максимальная высота рельефа в метрах
  
  // Нормализуем высоту от 0 до 1
  let normalizedHeight = (height - minHeight) / (maxHeight - minHeight);
  normalizedHeight = Math.max(0, Math.min(1, normalizedHeight));
  
  // Создаем градиент цвета от синего (низины) через зеленый (средняя высота) к белому (высоты)
  let color = new THREE.Color();
  
  if (normalizedHeight < 0.3) {
    // Градиент от синего к голубому (для низин)
    color.setRGB(
      0.1 + normalizedHeight * 0.3,
      0.1 + normalizedHeight * 0.3,
      0.5 + normalizedHeight * 0.3
    );
  } else if (normalizedHeight < 0.7) {
    // Градиент от голубого к зеленому (для равнин)
    const t = (normalizedHeight - 0.3) / 0.4;
    color.setRGB(
      0.4 - t * 0.2,
      0.4 + t * 0.4,
      0.8 - t * 0.6
    );
  } else {
    // Градиент от зеленого к белому (для высот)
    const t = (normalizedHeight - 0.7) / 0.3;
    color.setRGB(
      0.2 + t * 0.8,
      0.8 + t * 0.2,
      0.2 + t * 0.8
    );
  }
  
  // Применяем цвет к материалу ячейки
  cell.material.color = color;
  cell.material.needsUpdate = true;
}

// Функция для закрытия панели информации о ячейке
function closeCellInfo() {
  showCellInfo.value = false
}

// Функция для открытия меню строительства
function openBuildMenu() {
  isBuildMenuOpen.value = true
  if (selectedCell.value) {
    emit('openBuildMenu', selectedCell.value);
  }
}

// Функция для удаления здания
function handleRemoveBuilding({ x, z }) {
  emit('removeBuilding', { x, z });
}

/**
 * Обновление уровня детализации текстур (LOD) в зависимости от зума
 */
function updateTextureLOD() {
  // Определяем LOD на основе текущего масштаба
  let newLOD
  if (store.mapState.zoom < 1.0) {
    newLOD = 'low'
  } else if (store.mapState.zoom < 2.0) {
    newLOD = 'medium'
  } else {
    newLOD = 'high'
  }
  
  // Если LOD изменился, обновляем его в хранилище
  if (newLOD !== store.mapState.currentLOD) {
    store.mapState.currentLOD = newLOD
    // Обновление произойдет автоматически через watch-эффекты
  }
}

function animate() {
  requestAnimationFrame(animate)
  
  if (props.isMinimap) {
    // For minimap, keep camera fixed
    camera.position.y = 10
  } else {
    // For main view, update camera based on zoom and position
    const gridSize = store.mapState.gridSize
    const centerX = 0
    const centerZ = 0
    const baseDistance = Math.max(gridSize, gridSize) * 1.5
    const zoomedDistance = baseDistance * store.mapState.zoom
    
    // Calculate camera position relative to center
    const cameraX = centerX + store.mapState.cameraPosition.x
    const cameraZ = centerZ + store.mapState.cameraPosition.z
    
    camera.position.set(cameraX, zoomedDistance, cameraZ)
    camera.lookAt(cameraX, 0, cameraZ)
    
    // Check for LOD updates
    updateTextureLOD()
  }
  
  renderer.render(scene, camera)
}

function handleResize() {
  if (!container.value) return
  
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

function cleanup() {
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement.parentNode === container.value) {
      container.value.removeChild(renderer.domElement)
    }
  }

  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose()
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose())
      } else {
        object.material.dispose()
      }
    }
  })
}

onMounted(() => {
  initScene()
  updateTextures()
  loadBuildingsFromStore() // Загружаем и отображаем здания из хранилища
  loadZoneTerrainData() // Загружаем данные о рельефе всей зоны
  window.addEventListener('resize', handleResize)
  container.value.addEventListener('click', handleCellClick) // Добавляем обработчик клика
  container.value.addEventListener('mousemove', handleMouseMove); // Добавляем обработчик движения мыши
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  container.value.removeEventListener('click', handleCellClick) // Убираем обработчик клика
  container.value.removeEventListener('mousemove', handleMouseMove); // Убираем обработчик движения мыши
  cleanup()
})

// Watch for zone changes to update textures
watch(() => store.zones, () => {
  updateTextures()
}, { deep: true })

// Наблюдаем за изменениями LOD и обновляем только текстуры зон
watch(() => store.mapState.currentLOD, () => {
  updateTextures()
  // Не вызываем loadBuildingsFromStore() при изменении LOD,
  // так как здания уже загружены и их текстуры не зависят от LOD
})

// Наблюдаем за изменениями в хранилище зданий только при реальных изменениях
// с использованием глубокого равенства для предотвращения ненужных обновлений
const previousBuildings = ref({});
watch(() => store.buildings, (newBuildings) => {
  // Проверяем, действительно ли изменились здания (добавлены новые или удалены существующие)
  const newKeys = Object.keys(newBuildings);
  const prevKeys = Object.keys(previousBuildings.value);
  
  // Если количество зданий изменилось, безусловно обновляем
  if (newKeys.length !== prevKeys.length) {
    loadBuildingsFromStore();
    previousBuildings.value = JSON.parse(JSON.stringify(newBuildings));
    return;
  }
  
  // Проверяем, изменились ли сами здания
  let buildingsChanged = false;
  
  for (const key of newKeys) {
    const newBuilding = newBuildings[key];
    const prevBuilding = previousBuildings.value[key];
    
    // Если здание новое или изменилась его текстура
    if (!prevBuilding || prevBuilding.icon !== newBuilding.icon) {
      buildingsChanged = true;
      break;
    }
  }
  
  if (buildingsChanged) {
    loadBuildingsFromStore();
    previousBuildings.value = JSON.parse(JSON.stringify(newBuildings));
  }
}, { deep: true, immediate: true })

// Наблюдаем за изменениями масштаба и обновляем LOD
watch(() => store.mapState.zoom, () => {
  updateTextureLOD()
})

// Expose raw Three.js objects
defineExpose({
  scene,
  camera
})
</script>

<template>
  <div class="map-container" ref="container">
    <!-- Добавляем панель информации о ячейке -->
    <CellInfoPanel 
      :cellInfo="selectedCell" 
      :visible="showCellInfo"
      :isBuildMenuOpen="isBuildMenuOpen"
      @close="closeCellInfo"
      @build="openBuildMenu"
      @remove="handleRemoveBuilding"
    />
    
    <!-- Добавляем всплывающую подсказку при наведении -->
    <div 
      v-if="showHoverTooltip && hoveredCell" 
      class="cell-hover-tooltip" 
      :style="{
        left: tooltipPosition.x + 'px',
        top: tooltipPosition.y + 'px'
      }"
    >
      <div class="tooltip-content">
        <div class="tooltip-row">
          <span>X: {{ hoveredCell.x }}, Z: {{ hoveredCell.z }}</span>
        </div>
        <div class="tooltip-row" v-if="hoveredCell.height">
          <span>Высота: {{ hoveredCell.height }} м</span>
        </div>
        <div class="tooltip-row" v-if="hoveredCell.angle">
          <span>Наклон: {{ hoveredCell.angle.toFixed(1) }}°</span>
        </div>
        <div class="tooltip-row" v-if="hoveredCell.lunarCoords && hoveredCell.lunarCoords.latitude !== undefined">
          <span>{{ formatCoordinate(hoveredCell.lunarCoords.latitude, 'lat') }}, {{ formatCoordinate(hoveredCell.lunarCoords.longitude, 'long') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.cell-hover-tooltip {
  position: fixed;
  transform: translate(10px, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  padding: 8px;
  border-radius: 4px;
  color: white;
  font-family: 'Feature Mono', monospace;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
}
</style>

<script>
export default {
  expose: ['getScene', 'getCamera'],
  setup() {
    const getScene = () => scene
    const getCamera = () => camera
    
    return {
      getScene,
      getCamera
    }
  }
}
</script>