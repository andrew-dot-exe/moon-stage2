<script setup>
/**
 * Компонент Colonization.vue
 * 
 * Основной компонент для визуализации карты колонизации Луны с помощью Three.js.
 * Реализует отображение сетки, ячеек, зон, построек, а также обработку пользовательских событий.
 * 
 * Основные функции:
 * - Генерация и хранение ячеек карты (CellEntity)
 * - Отображение и обновление текстур в зависимости от LOD и типа зоны
 * - Обработка событий мыши (выделение, перемещение, зум, построение)
 * - Взаимодействие с глобальным состоянием игры (store)
 * - UI-элементы для строительства и миникарты
 */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import BuildMenu from './ui/BuildMenu.vue'
import BuildButton from './ui/BuildButton.vue'
import BuildConfirmButton from './ui/BuildConfirmButton.vue'
import MiniMap from './ui/MiniMap.vue'
import MapRenderer from './ui/MapRenderer.vue' // Добавляем импорт компонента MapRenderer
import { handleCellClick, handleBuildConfirm } from '../utils/buildingMechanics'
import api from '../services/api' // Добавляем импорт API для запросов

/**
 * Класс CellEntity
 * Представляет сущность ячейки на карте.
 * 
 * @property {THREE.Mesh} mesh - 3D-объект ячейки
 * @property {number} x - Координата X в сетке
 * @property {number} z - Координата Z в сетке
 * @property {string|null} zoneType - Тип зоны (если есть)
 * @property {boolean} isSelected - Флаг выделения ячейки
 * @property {boolean} isOccupied - Флаг занятости ячейки (есть ли здание)
 */
class CellEntity {
  constructor(mesh, x, z, zoneType = null) {
    this.mesh = mesh
    this.x = x
    this.z = z
    this.zoneType = zoneType
    this.isSelected = false
    this.isOccupied = false
  }
}

// --- Реактивные переменные и ссылки ---
const container = ref(null) // DOM-элемент для рендера Three.js
const coordinates = ref('') // Текст текущих координат под курсором
const store = useGameStore() // Глобальное состояние игры (Pinia/Vuex)
const showBuildMenu = ref(false) // Флаг отображения меню строительства
const selectedItem = ref(null) // Выбранный для строительства объект
const selectedCell = ref(null) // Выбранная ячейка (CellEntity)
const buildings = ref({}) // Карта построек по координатам
const cells = ref({}) // Карта всех ячеек: { "x,z": CellEntity }
const errorMessage = ref('') // Сообщение об ошибке
const showError = ref(false) // Флаг отображения сообщения об ошибке
const showCellInfo = ref(false) // Флаг отображения окна с информацией о ячейке
const cellInfo = ref(null) // Данные о выбранной ячейке

// --- Объект для хранения ссылок на объекты Three.js ---
let three = {
  scene: null,
  camera: null,
  renderer: null,
  gridGroup: null,
  raycaster: null,
  mouse: null
}

/**
 * Обработчик кнопки "Строить"
 * @param {boolean} isActive - Активировать/скрыть меню строительства
 */
const handleBuildClick = (isActive) => {
  showBuildMenu.value = isActive
  if (!isActive) {
    selectedItem.value = null
  }
  
  // Скрываем сообщение об ошибке при открытии меню строительства
  if (isActive) {
    hideError()
  }
}

/**
 * Обработчик выбора объекта для строительства
 * @param {Object} item - Данные выбранного объекта
 */
const handleBuild = (item) => {
  selectedItem.value = item
  // Скрываем сообщение об ошибке при выборе нового объекта
  hideError()
}

/**
 * Отображение сообщения об ошибке
 * @param {string} message - Текст сообщения
 */
const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
  
  // Автоматически скрываем сообщение через 5 секунд
  setTimeout(() => {
    hideError()
  }, 5000)
}

/**
 * Скрытие сообщения об ошибке
 */
const hideError = () => {
  showError.value = false
  errorMessage.value = ''
}

/**
 * Подтверждение строительства на выбранной ячейке
 * Создаёт объект здания, размещает его на сцене и отмечает ячейку как занятую.
 */
const handleConfirm = () => {
  // Скрываем предыдущее сообщение об ошибке, если оно отображалось
  hideError()
  
  handleBuildConfirm({
    selectedItem,
    selectedCell,
    three,
    buildings,
    cells,
    showBuildMenu,
    errorMessage // Передаем реактивную ссылку на сообщение об ошибке
  })
  
  // Если после вызова функции в errorMessage появился текст, отображаем сообщение
  if (errorMessage.value) {
    showErrorMessage(errorMessage.value)
  }
}

/**
 * Обработчик события открытия меню строительства из панели информации о ячейке
 * @param {Object} cell - Информация о выбранной ячейке
 */
const handleOpenBuildMenu = (cell) => {
  // Если передана ячейка, устанавливаем ее как выбранную
  if (cell) {
    // Находим объект CellEntity для выбранной ячейки
    const cellKey = `${cell.x},${cell.z}`;
    selectedCell.value = cells.value[cellKey];
  }
  
  // Открываем меню строительства
  showBuildMenu.value = true;
  
  // Скрываем сообщение об ошибке при открытии меню
  hideError();
}

/**
 * Обработчик события удаления здания
 * @param {Object} params - Параметры с координатами здания
 * @param {number} params.x - Координата X здания
 * @param {number} params.z - Координата Z здания
 */
const handleRemoveBuilding = async ({ x, z }) => {
  try {
    // Удаляем здание с карты
    const result = await removeBuildingFromMap({ 
      x, 
      z, 
      buildings, 
      cells 
    });
    
    if (!result) {
      showErrorMessage('Не удалось удалить здание');
    }
  } catch (error) {
    console.error('Ошибка при удалении здания:', error);
    showErrorMessage(error.message || 'Произошла ошибка при удалении здания');
  }
}

/**
 * Получение информации о ячейке по её координатам
 * @param {number} x - Координата X
 * @param {number} z - Координата Z (в API это Y)
 * @param {number} zoneId - ID зоны (по умолчанию 1)
 */
const fetchCellInfo = async (x, z, zoneId = 1) => {
  try {
    // Получаем данные о рельефе для конкретной ячейки
    const terrainData = await api.area.getZoneTerrain(zoneId);
    
    // Находим данные для запрошенной ячейки
    let cellData = null;
    if (terrainData && terrainData.cells) {
      // Предполагаем, что cells - двумерный массив, где первый индекс - X, второй - Y(Z)
      if (terrainData.cells[x] && terrainData.cells[x][z]) {
        cellData = terrainData.cells[x][z];
      }
    }
    
    // Если не нашли конкретную ячейку, запрашиваем общие данные о зоне
    if (!cellData) {
      const areaData = await api.area.getAreas();
      const zone = areaData.find(area => area.id === zoneId);
      if (zone) {
        cellData = {
          zoneInfo: zone.name,
          illumination: zone.illumination,
          // Добавляем заглушки для других данных
          height: "Нет данных",
          angle: "Нет данных"
        };
      }
    }
    
    // Также запрашиваем лунные координаты
    try {
      const lunarCoords = await api.lunarCoordinates.getLunarCoordinates(zoneId, x, z);
      if (lunarCoords) {
        cellData = {
          ...cellData,
          lunarLatitude: lunarCoords.latitude,
          lunarLongitude: lunarCoords.longitude
        };
      }
    } catch (error) {
      console.warn('Не удалось получить лунные координаты:', error);
    }
    
    // Сохраняем полученную информацию
    cellInfo.value = cellData || {
      height: "Нет данных",
      angle: "Нет данных",
      zoneInfo: `Зона ${zoneId}`,
      gameX: x,
      gameZ: z
    };
    
    // Отображаем окно с информацией
    showCellInfo.value = true;
  } catch (error) {
    console.error('Ошибка при получении информации о ячейке:', error);
    cellInfo.value = {
      error: 'Не удалось загрузить данные о ячейке',
      gameX: x,
      gameZ: z
    };
    showCellInfo.value = true;
  }
};

/**
 * Обработчик события клика по ячейке
 * Расширяем существующую функцию handleCellClick, чтобы также загружать данные о ячейке
 */
const handleCellClickWithInfo = async ({ intersects, cells, selectedCell, store }) => {
  // Вызываем оригинальную функцию обработки клика
  handleCellClick({
    intersects,
    cells,
    selectedCell,
    store
  });
  
  // Если есть пересечение с ячейкой, получаем о ней информацию
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const cellEntity = Object.values(cells.value).find(c => c.mesh === mesh);
    if (cellEntity) {
      // Установим подсказку для пользователя, что данные загружаются
      cellInfo.value = { 
        loading: true,
        gameX: cellEntity.x,
        gameZ: cellEntity.z 
      };
      showCellInfo.value = true;
      
      // Запрашиваем информацию о ячейке
      await fetchCellInfo(cellEntity.x, cellEntity.z);
    }
  } else {
    // Если клик был не по ячейке, скрываем информационное окно
    showCellInfo.value = false;
  }
};

/**
 * Закрытие окна с информацией о ячейке
 */
const closeCellInfo = () => {
  showCellInfo.value = false;
};

/**
 * Обработчик события клика по ячейке на карте
 */
function onMouseClick(event) {
  if (store.mapState.isDragging) return;
  
  three.raycaster.setFromCamera(three.mouse, three.camera);
  const intersects = three.raycaster.intersectObjects(
    Object.values(cells.value).map(cellEntity => cellEntity.mesh)
  );
  
  handleCellClickWithInfo({
    intersects,
    cells,
    selectedCell,
    store
  });
}

/**
 * Инициализация сцены Three.js, генерация сетки, ячеек, загрузка текстур, настройка камеры и событий.
 */
function initThree() {
  if (!container.value) return
  
  // Scene setup
  three.scene = new THREE.Scene()
  three.scene.background = new THREE.Color(0x000000)
  
  // Camera setup
  three.camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  three.camera.position.set(10, 10, 10)
  three.camera.lookAt(0, 0, 0)
  
  // Grid setup
  const gridSize = store.mapState.gridSize
  const cellSize = store.mapState.cellSize
  
  // Create grid using lines
  three.gridGroup = new THREE.Group()
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x808080,
    transparent: true,
    opacity: 0.3,
    fog: false
  })
  
  // Create horizontal lines
  for (let z = -gridSize/2; z <= gridSize/2; z++) {
    const points = []
    points.push(new THREE.Vector3(-gridSize/2, 0.01, z))
    points.push(new THREE.Vector3(gridSize/2, 0.01, z))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, gridMaterial)
    line.renderOrder = 1
    three.gridGroup.add(line)
  }
  
  // Create vertical lines
  for (let x = -gridSize/2; x <= gridSize/2; x++) {
    const points = []
    points.push(new THREE.Vector3(x, 0.01, -gridSize/2))
    points.push(new THREE.Vector3(x, 0.01, gridSize/2))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, gridMaterial)
    line.renderOrder = 1
    three.gridGroup.add(line)
  }
  
  three.scene.add(three.gridGroup)
  
  // Create texture loader
  const textureLoader = new THREE.TextureLoader()
  
  // Function to get texture path based on LOD and type
  function getTexturePath(zoneType) {
    const lod = store.mapState.textureLODs[store.mapState.currentLOD]
    const textureType = store.mapState.zoneTextures[zoneType].texture
    return `${store.mapState.textureBasePath}${lod.path}${textureType}.jpg`
  }
  
  // Function to update texture based on zoom level
  function updateTextureLOD() {
    const zoom = store.mapState.zoom
    let newLOD = 'low'
    
    if (zoom > 2) {
      newLOD = 'high'
    } else if (zoom > 1) {
      newLOD = 'medium'
    }
    
    if (newLOD !== store.mapState.currentLOD) {
      store.mapState.currentLOD = newLOD
      loadTextures()
    }
  }
  
  // Функция для загрузки/обновления текстур в зависимости от LOD
  function loadTextures() {
    const textureLoader = new THREE.TextureLoader()
    const textureType = store.mapState.currentTextureType
    const lod = store.mapState.currentLOD
    const texturePath = `${store.mapState.textureBasePath}${store.mapState.textureLODs[lod].path}${textureType}.jpg`
    
    // Загружаем текстуру для базовых ячеек
    textureLoader.load(texturePath, (texture) => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1, 1)
      texture.minFilter = THREE.LinearMipMapLinearFilter
      texture.magFilter = THREE.LinearFilter
      
      // Обновляем текстуры только для тех ячеек, которые не содержат зданий
      Object.values(cells.value).forEach(cellEntity => {
        const key = `${cellEntity.x},${cellEntity.z}`
        // Проверяем, нет ли в этой ячейке здания
        if (!buildings.value[key] && !cellEntity._hasBuilding) {
          cellEntity.mesh.material.map = texture
          cellEntity.mesh.material.needsUpdate = true
        }
      })
    })
    
    // После загрузки текстур, перезагружаем здания для уверенности
    // что их текстуры не перезаписались
    setTimeout(() => {
      rebuildBuildingsDisplay()
    }, 100)
  }
  
  // Функция для обновления отображения зданий после изменения масштаба
  function rebuildBuildingsDisplay() {
    // Используем данные о зданиях из глобального хранилища
    const buildingsData = store.getBuildings()
    const textureLoader = new THREE.TextureLoader()
    
    Object.entries(buildingsData).forEach(([key, building]) => {
      if (building && building.icon) {
        const coords = key.split(',').map(Number)
        const cellKey = `${coords[0]},${coords[1]}`
        const cellEntity = cells.value[cellKey]
        
        if (cellEntity && cellEntity.mesh) {
          // Отмечаем ячейку как содержащую здание
          cellEntity._hasBuilding = true
          
          // Применяем текстуру здания
          textureLoader.load(building.icon, (texture) => {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            
            cellEntity.mesh.material.map = texture
            cellEntity.mesh.material.needsUpdate = true
          })
        }
      }
    })
  }
  
  // Create cells
  cells.value = {}
  const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize)
  const cellMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    roughness: 0.8,
    metalness: 0.2
  })
  
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let z = -gridSize/2; z < gridSize/2; z++) {
      const mesh = new THREE.Mesh(cellGeometry, cellMaterial.clone())
      mesh.position.set(x + cellSize/2, 0, z + cellSize/2)
      mesh.rotation.x = -Math.PI / 2
      mesh.userData = { x, z }
      three.scene.add(mesh)
      // Создаем сущность ячейки
      const cellEntity = new CellEntity(mesh, x, z)
      cells.value[`${x},${z}`] = cellEntity
    }
  }
  
  // Load initial textures
  loadTextures()
  

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  three.scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  three.scene.add(directionalLight)
  
  // Renderer setup
  three.renderer = new THREE.WebGLRenderer({ antialias: true })
  three.renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(three.renderer.domElement)
  
  // Raycaster setup
  three.raycaster = new THREE.Raycaster()
  three.mouse = new THREE.Vector2()
  
  // Event handlers
  function onMouseMove(event) {
    const rect = container.value.getBoundingClientRect()
    three.mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1
    three.mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1
    
    // Update coordinates display
    three.raycaster.setFromCamera(three.mouse, three.camera)
    const intersects = three.raycaster.intersectObjects(
      Object.values(cells.value).map(cellEntity => cellEntity.mesh)
    )
    if (intersects.length > 0) {
      const mesh = intersects[0].object
      const cellEntity = Object.values(cells.value).find(c => c.mesh === mesh)
      if (cellEntity) {
        coordinates.value = `X: ${cellEntity.x}, Z: ${cellEntity.z}`
      }
    } else {
      coordinates.value = ''
    }
    
    if (store.mapState.isDragging) {
      const deltaX = event.clientX - store.mapState.lastMousePosition.x
      const deltaY = event.clientY - store.mapState.lastMousePosition.y
      
      // Определяем точку под курсором мыши в мировых координатах
      three.raycaster.setFromCamera(three.mouse, three.camera)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      
      if (three.raycaster.ray.intersectPlane(groundPlane, intersection)) {
        // Сохраняем текущую позицию курсора на сцене перед перемещением камеры
        const prevCursorWorldPos = intersection.clone()
        
        // Перемещаем камеру
        three.camera.position.x += deltaX * 0.01 * store.mapState.zoom
        three.camera.position.z += deltaY * 0.01 * store.mapState.zoom
        
        // Обновляем луч рейкастера после изменения позиции камеры
        three.raycaster.setFromCamera(three.mouse, three.camera)
        const newIntersection = new THREE.Vector3()
        
        if (three.raycaster.ray.intersectPlane(groundPlane, newIntersection)) {
          // Вычисляем смещение в мировых координатах
          const worldDeltaX = newIntersection.x - prevCursorWorldPos.x
          const worldDeltaZ = newIntersection.z - prevCursorWorldPos.z
          
          // Корректируем позицию камеры, чтобы точка под курсором оставалась на месте
          three.camera.position.x -= worldDeltaX
          three.camera.position.z -= worldDeltaZ
        }
      }
      
      store.updateCameraPosition(three.camera.position.x, three.camera.position.y, three.camera.position.z)
      store.mapState.lastMousePosition = { x: event.clientX, y: event.clientY }
    }
  }
  
  function onMouseDown(event) {
    store.startDragging(event.clientX, event.clientY)
  }
  
  function onMouseUp() {
    store.stopDragging()
  }
  
  function onMouseWheel(event) {
    event.preventDefault()
    const zoomDelta = event.deltaY * 0.0005
    const newZoom = store.mapState.zoom - zoomDelta
    const oldZoom = store.mapState.zoom
    
    // Calculate the point on the ground plane under the cursor
    three.raycaster.setFromCamera(three.mouse, three.camera)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    three.raycaster.ray.intersectPlane(groundPlane, intersection)
    
    if (intersection) {
      // Calculate the direction from camera to intersection point
      const direction = intersection.clone().sub(three.camera.position)
      
      // Update zoom with min and max limits
      store.updateZoom(Math.max(0.5, Math.min(1.5, newZoom)))
      
      // Calculate new camera position based on zoom change
      const zoomFactor = newZoom / oldZoom
      const newPosition = three.camera.position.clone().add(
        direction.multiplyScalar(1 - zoomFactor)
      )
      
      // Update camera position
      three.camera.position.copy(newPosition)
      // Ограничиваем высоту камеры до 15
      three.camera.position.y = Math.min(15, 10 * store.mapState.zoom)
      
      // Update store with new position
      store.updateCameraPosition(three.camera.position.x, three.camera.position.y, three.camera.position.z)
    }
  }
  
  // Add event listeners
  container.value.addEventListener('mousemove', onMouseMove)
  container.value.addEventListener('mousedown', onMouseDown)
  container.value.addEventListener('mouseup', onMouseUp)
  container.value.addEventListener('click', onMouseClick)
  container.value.addEventListener('wheel', onMouseWheel)
  
  // Add keyboard controls for texture switching
  function onKeyDown(event) {
    if (event.key === 't') {
      const types = Object.keys(store.mapState.textureTypes)
      const currentIndex = types.indexOf(store.mapState.currentTextureType)
      const nextIndex = (currentIndex + 1) % types.length
      store.mapState.currentTextureType = types[nextIndex]
      loadTextures()
    }
  }
  
  window.addEventListener('keydown', onKeyDown)
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate)
    
    // Update camera position and height with 15 limit
    three.camera.position.y = Math.min(15, 10 * store.mapState.zoom)
    
    // If at maximum zoom, restrict camera movement to center
    if (store.mapState.zoom >= 3.0) {
      three.camera.position.x = 0
      three.camera.position.z = 0
      store.updateCameraPosition(0, three.camera.position.y, 0)
    } else {
      three.camera.position.x = store.mapState.cameraPosition.x
      three.camera.position.z = store.mapState.cameraPosition.z
    }
    
    // Check for LOD updates
    updateTextureLOD()
    
    three.renderer.render(three.scene, three.camera)
  }
  animate()
}

/**
 * Обработка изменения размера окна — обновление камеры и рендера.
 */
function handleResize() {
  if (!container.value || !three.camera || !three.renderer) return
  
  three.camera.aspect = container.value.clientWidth / container.value.clientHeight
  three.camera.updateProjectionMatrix()
  three.renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

/**
 * Очистка ресурсов Three.js и удаление обработчиков событий при размонтировании компонента.
 */
function cleanupThree() {
  if (container.value) {
    container.value.removeEventListener('mousemove', onMouseMove)
    container.value.removeEventListener('mousedown', onMouseDown)
    container.value.removeEventListener('mouseup', onMouseUp)
    container.value.removeEventListener('click', onMouseClick)
    container.value.removeEventListener('wheel', onMouseWheel)
  }
  
  window.removeEventListener('keydown', onKeyDown)
  
  if (three.renderer) {
    three.renderer.dispose()
    if (container.value && three.renderer.domElement.parentNode === container.value) {
      container.value.removeChild(three.renderer.domElement)
    }
  }
  
  if (three.scene) {
    three.scene.traverse((object) => {
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
  
  // Clear all references
  three = {
    scene: null,
    camera: null,
    renderer: null,
    gridGroup: null,
    raycaster: null,
    mouse: null
  }
}

// --- Реактивные наблюдатели и жизненный цикл ---

// Монтирование компонента: инициализация сцены и обработчиков
onMounted(() => {
  initThree()
  window.addEventListener('resize', handleResize)
})

// Демонтирование компонента: очистка ресурсов и обработчиков
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanupThree()
})
</script>

<template>
  <!--
    Основная разметка компонента:
    - Контейнер для Three.js
    - Отображение координат
    - Миникарта и UI для строительства
  -->
  <div class="colonization-container">
    <div ref="container" class="three-container"></div>
    <div class="coordinates">{{ coordinates }}</div>
    
    <MiniMap />
    
    <!-- Компонент MapRenderer теперь генерирует события openBuildMenu и removeBuilding -->
    <MapRenderer 
      ref="mapRenderer"
      @openBuildMenu="handleOpenBuildMenu" 
      @removeBuilding="handleRemoveBuilding"
    />
    
    <BuildButton @click="handleBuildClick" />
    <BuildConfirmButton 
      v-if="selectedItem && selectedCell" 
      @confirm="handleConfirm" 
    />
    <BuildMenu 
      v-if="showBuildMenu" 
      @build="handleBuild" 
    />
    
    <div v-if="showError" class="error-message">{{ errorMessage }}</div>
    
    <!-- Окно с информацией о ячейке -->
    <div v-if="showCellInfo" class="cell-info">
      <div v-if="cellInfo && cellInfo.loading">Загрузка данных...</div>
      <div v-else-if="cellInfo">
        <h3>Информация о ячейке</h3>
        <p><strong>Координаты:</strong> X: {{ cellInfo.gameX }}, Z: {{ cellInfo.gameZ }}</p>
        <p v-if="cellInfo.height"><strong>Высота:</strong> {{ cellInfo.height }}</p>
        <p v-if="cellInfo.angle"><strong>Угол наклона:</strong> {{ cellInfo.angle }}</p>
        <p v-if="cellInfo.zoneInfo"><strong>Зона:</strong> {{ cellInfo.zoneInfo }}</p>
        <p v-if="cellInfo.illumination"><strong>Освещенность:</strong> {{ cellInfo.illumination }}%</p>
        <p v-if="cellInfo.lunarLatitude"><strong>Лунные координаты:</strong><br>
           {{ cellInfo.lunarLatitude }}°, {{ cellInfo.lunarLongitude }}°</p>
        
        <div class="button-row">
          <button @click="closeCellInfo">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 
  Стили для контейнера, координат, позиции камеры и области рендера.
  Используется абсолютное позиционирование для наложения UI поверх сцены.
*/
.colonization-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-container {
  width: 100%;
  height: 100%;
}

.coordinates {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: white;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
}

.error-message {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: red;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 4px;
}

.cell-info {
  position: absolute;
  top: 70px;
  left: 10px; /* Изменено с right: 10px на left: 10px */
  color: white;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 6px;
  width: 280px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cell-info p {
  margin: 6px 0;
  font-size: 14px;
}

.cell-info button {
  background: #4a4a4a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.cell-info button:hover {
  background: #666;
}
</style>