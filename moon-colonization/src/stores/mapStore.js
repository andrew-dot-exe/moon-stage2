// mapStore.js - управление картой и взаимодействием с ней
import { ref } from 'vue'

export function useMapStore() {
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

  return {
    // State
    mapState,
    
    // Actions
    updateZoom,
    selectCell,
    updateCell,
    startDragging,
    stopDragging,
    updateCameraPosition
  }
}