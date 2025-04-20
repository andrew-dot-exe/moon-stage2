// Файл содержит механики взаимодействия с постройками в игровом мире
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import { canPlaceBuilding } from './buildingsData'
import { confirmBuildingPlacement } from './buildingApi'

/**
 * Обработка клика по ячейке: выделение, подсветка, выбор зоны.
 * @param {object} params
 * @param {Array} params.intersects - Результаты raycaster.intersectObjects
 * @param {object} params.cells - Реф на карту ячеек
 * @param {object} params.selectedCell - Реф на выбранную ячейку
 * @param {object} params.store - Стор приложения
 */
export function handleCellClick({ intersects, cells, selectedCell, store }) {
  if (intersects.length > 0) {
    const mesh = intersects[0].object
    const cellEntity = Object.values(cells.value).find(c => c.mesh === mesh)
    if (!cellEntity) return

    const coords = { x: cellEntity.x, z: cellEntity.z }

    // Проверка: есть ли зона
    const zone = store.zones.find(z =>
      z.x === coords.x && z.z === coords.z
    )

    if (zone) {
      store.selectZone(zone)
      return
    }

    store.selectCell(coords)
    selectedCell.value = cellEntity

    // Подсветка выбранной ячейки
    Object.values(cells.value).forEach(c => {
      c.mesh.material.color.setHex(0x808080)
      c.isSelected = false
    })
    cellEntity.mesh.material.color.setHex(0x00ff00)
    cellEntity.isSelected = true
  }
}

/**
 * Подтверждение строительства: создание здания, обновление состояния.
 * @param {object} params
 * @param {object} params.selectedItem - Реф на выбранный объект строительства
 * @param {object} params.selectedCell - Реф на выбранную ячейку
 * @param {object} params.three - Объекты three.js
 * @param {object} params.buildings - Реф на карту построек
 * @param {object} params.cells - Реф на карту ячеек
 * @param {object} params.showBuildMenu - Реф на флаг отображения меню
 * @param {object} params.errorMessage - Реф для отображения сообщений об ошибках
 */
export function handleBuildConfirm({ selectedItem, selectedCell, three, buildings, cells, showBuildMenu, errorMessage }) {
  if (selectedItem.value && selectedCell.value && three.scene) {
    const coords = { x: selectedCell.value.x, z: selectedCell.value.z }
    
    // Подтверждение размещения и обращение к API - вся проверка будет выполнена на сервере
    confirmBuildingPlacement({
      selectedItem,
      selectedCell,
      three,
      buildings,
      cells,
      showBuildMenu,
      errorMessage
    })
  }
}
