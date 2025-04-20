<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import MapRenderer from './MapRenderer.vue'
import * as THREE from 'three'

const store = useGameStore()
const container = ref(null)
const viewport = ref(null)
const isDragging = ref(false)
const cellCoords = ref({ x: 10, z: 10 })
const mapRenderer = ref(null)

// Raycaster setup
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Calculate viewport size based on zoom level
const getViewportSize = () => {
  // Размер области просмотра на миникарте должен отражать
  // фактическую область просмотра камеры на основной карте
  const gridSize = store.mapState.gridSize
  
  // Получаем размер миникарты в пикселях
  const miniMapWidth = container.value ? container.value.clientWidth : 200
  const miniMapHeight = container.value ? container.value.clientHeight : 120
  
  // Рассчитываем соотношение сторон миникарты
  const aspectRatio = miniMapWidth / miniMapHeight
  
  // Размер видимой области в единицах мировой сетки
  // При zoom = 1 видим примерно половину карты
  const visibleWidth = gridSize / (store.mapState.zoom * 2)
  const visibleHeight = visibleWidth / aspectRatio
  
  // Преобразуем размер видимой области в пиксели миникарты
  const viewportWidth = (visibleWidth / gridSize) * miniMapWidth
  const viewportHeight = (visibleHeight / gridSize) * miniMapHeight
  
  return {
    width: viewportWidth,
    height: viewportHeight
  }
}

// Update viewport position and size
const updateViewport = () => {
  if (!container.value || !viewport.value) return

  const viewportSize = getViewportSize()
  
  // Установка размера области просмотра
  viewport.value.style.width = `${viewportSize.width}px`
  viewport.value.style.height = `${viewportSize.height}px`
  
  // Синхронизация с текущей позицией камеры
  syncViewportWithCamera()
}

// Update the viewport position based on the camera's position
const syncViewportWithCamera = () => {
  if (!container.value || !viewport.value) return

  const gridSize = store.mapState.gridSize
  const cameraPosition = store.mapState.cameraPosition

  // Перевод координат из мировых в нормализованные для миникарты (0 до 1)
  // Обратите внимание, что для оси Z мы инвертируем направление,
  // чтобы движение вниз на сцене соответствовало движению вниз на миникарте
  const normalizedX = (cameraPosition.x / gridSize) + 0.5
  const normalizedZ = (cameraPosition.z / gridSize) + 0.5 // Убрали отрицательный знак, чтобы инвертировать направление
  
  // Ограничиваем значения от 0 до 1
  const boundedX = Math.max(0, Math.min(1, normalizedX))
  const boundedZ = Math.max(0, Math.min(1, normalizedZ))
  
  // Перевод в пиксельные координаты миникарты
  const x = boundedX * container.value.clientWidth
  const y = boundedZ * container.value.clientHeight

  // Учитываем смещение из-за transform: translate(-50%, -50%) на элементе viewport
  viewport.value.style.left = `${x}px`
  viewport.value.style.top = `${y}px`
}

const handleMouseDown = (event) => {
  isDragging.value = true
  updateViewportPosition(event)
}

const handleMouseMove = (event) => {
  if (isDragging.value) {
    updateViewportPosition(event)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const updateViewportPosition = (event) => {
  if (!container.value || !viewport.value) return

  const rect = container.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Ограничиваем перемещение внутри миникарты
  const boundedX = Math.max(viewport.value.clientWidth / 2, Math.min(rect.width - viewport.value.clientWidth / 2, x))
  const boundedY = Math.max(viewport.value.clientHeight / 2, Math.min(rect.height - viewport.value.clientHeight / 2, y))

  // Update viewport element's position directly using absolute values
  viewport.value.style.left = `${boundedX}px`
  viewport.value.style.top = `${boundedY}px`

  // Преобразуем координаты миникарты в координаты мировой сцены
  const gridSize = store.mapState.gridSize
  const normalizedX = boundedX / rect.width  // от 0 до 1
  const normalizedY = boundedY / rect.height // от 0 до 1
  
  // Переводим в координаты от -gridSize/2 до gridSize/2
  const worldX = (normalizedX - 0.5) * gridSize
  const worldZ = (normalizedY - 0.5) * gridSize // Убрали минус, чтобы сделать направление согласованным

  // Обновляем позицию камеры, сохраняя текущую высоту (Y)
  store.updateCameraPosition(worldX, store.mapState.cameraPosition.y, worldZ)
}

const updateCellCoordinates = (event) => {
  if (!mapRenderer.value) return
  
  const rect = mapRenderer.value.$el.getBoundingClientRect()
  
  // Convert mouse coordinates to normalized device coordinates (-1 to +1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // Get the raw Three.js objects
  const camera = mapRenderer.value.camera
  const scene = mapRenderer.value.scene
  
  if (!camera || !scene) return
  
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera)
  
  // Get all cells from the scene
  const cells = []
  scene.traverse((object) => {
    if (object.isMesh && object.userData.x !== undefined) {
      cells.push(object)
    }
  })
  
  // Find intersections
  const intersects = raycaster.intersectObjects(cells)
  if (intersects.length > 0) {
    const cell = intersects[0].object
    if (cell.userData) {
      cellCoords.value = cell.userData
    }
  }
}

// Watch for camera position and zoom changes
watch(() => [store.mapState.cameraPosition, store.mapState.zoom], () => {
  updateViewport()
}, { deep: true })

// Watch for camera position changes and sync the viewport
watch(() => store.mapState.cameraPosition, () => {
  syncViewportWithCamera()
}, { deep: true })

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  // Center the viewport initially
  store.updateCameraPosition(0, store.mapState.cameraPosition.y, 0)
  updateViewport()
  syncViewportWithCamera() // Initial sync
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="mini-map" ref="container">
    <div class="mini-map-content">
      <MapRenderer ref="mapRenderer" :is-minimap="true" />
      
      <!-- Viewport indicator -->
      <div class="viewport" ref="viewport" 
           @mousedown="handleMouseDown">
        <div class="viewport-border"></div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.mini-map {
  position: absolute;
  bottom: 60px;
  right: 20px;
  width: 200px;
  height: 120px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  border-radius: 4px;
  overflow: hidden;
  z-index: 1000;
}

.mini-map-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.viewport {
  position: absolute;
  width: 40px;
  height: 30px;
  transform: translate(-50%, -50%);
  cursor: move;
}

.viewport-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #BCFE37;
  pointer-events: none;
}

.coordinates {
  position: absolute;
  bottom: 5px;
  left: 5px;
  padding: 2px 5px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #BCFE37;
  border-radius: 2px;
  color: #BCFE37;
  font-size: 12px;
  font-family: monospace;
  z-index: 1001;
}

.viewport-coords {
  margin-bottom: 2px;
}

.cell-coords {
  border-top: 1px solid #BCFE37;
  padding-top: 2px;
}
</style>