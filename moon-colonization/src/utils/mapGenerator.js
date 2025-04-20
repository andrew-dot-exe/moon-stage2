/**
 * Класс CellEntity
 * Представляет сущность ячейки на карте.
 * @param {THREE.Mesh} mesh - 3D-объект ячейки
 * @param {number} x - Координата X в сетке
 * @param {number} z - Координата Z в сетке (соответствует Y на бэкенде)
 * @param {number} height - Высота ячейки (рельеф)
 * @param {number} angle - Угол наклона ячейки
 * @param {string|null} zoneType - Тип зоны (если есть)
 */
class CellEntity {
  constructor(mesh, x, z, height = 0, angle = 0, zoneType = null) {
    this.mesh = mesh
    this.x = x
    this.z = z
    this.height = height  // высота рельефа
    this.angle = angle    // угол наклона в градусах
    this.zoneType = zoneType
    this.isSelected = false
    this.isOccupied = false
    this.hasBuilding = false  // Флаг наличия здания
    
    // На бэкенде используется Y вместо Z, добавляем геттер для совместимости
    this.getY = function() {
      return this.z;
    }
  }

  // Метод для обновления высоты ячейки
  updateHeight(height, angle = null) {
    this.height = height;
    if (angle !== null) {
      this.angle = angle;
    }
    
    // Обновляем также визуальное представление ячейки
    if (this.mesh) {
      // Нормализуем высоту для визуализации (масштабирование для лучшей видимости)
      const visualHeight = this.height / 400;
      
      // Применяем высоту к положению меша
      this.mesh.position.y = visualHeight;
      
      // Если есть угол наклона, применяем его
      if (this.angle) {
        // Преобразуем угол в радианы и применяем наклон
        const angleRad = (this.angle * Math.PI) / 180;
        const maxAngle = 0.2; // Ограничиваем максимальный угол для визуализации
        const scaledAngle = Math.min(angleRad * 0.1, maxAngle);
        
        // Наклоняем mesh в соответствии с углом (создаем случайное направление наклона)
        this.mesh.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * scaledAngle;
        this.mesh.rotation.z = (Math.random() - 0.5) * scaledAngle;
      }
      
      // Окрашиваем ячейку в зависимости от высоты
      this.updateHeightColor();
    }
  }
  
  // Метод для обновления цвета ячейки в зависимости от высоты
  updateHeightColor() {
    if (!this.mesh || !this.mesh.material || this.hasBuilding) return;
    
    // Минимальная и максимальная высота для нормализации цвета
    const minHeight = -5000; // минимальная высота рельефа в метрах
    const maxHeight = 5000;  // максимальная высота рельефа в метрах
    
    // Нормализуем высоту от 0 до 1
    let normalizedHeight = (this.height - minHeight) / (maxHeight - minHeight);
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
    this.mesh.material.color = color;
    this.mesh.material.needsUpdate = true;
  }
}

/**
 * Генерирует сетку и ячейки карты для сцены Three.js.
 * @param {number} gridSize - Размер сетки (количество ячеек по одной стороне)
 * @param {number} cellSize - Размер одной ячейки
 * @param {object} THREE - Объект библиотеки three.js
 * @returns {object} { gridGroup, cellEntities }
 */
export function generateMap(gridSize, cellSize, THREE) {
  // Группа для линий сетки и ячеек
  const gridGroup = new THREE.Group()

  // Смещение, чтобы центр сцены совпадал с центром карты
  const offset = (gridSize * cellSize) / 2 - cellSize / 2

  // Материал для линий сетки
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x808080,
    transparent: true,
    opacity: 0.3,
    fog: false
  })

  // Генерация горизонтальных линий сетки
  for (let z = 0; z <= gridSize; z++) {
    const points = []
    points.push(new THREE.Vector3(0 - offset, 0.01, z * cellSize - offset))
    points.push(new THREE.Vector3(gridSize * cellSize - offset, 0.01, z * cellSize - offset))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, gridMaterial)
    line.renderOrder = 1
    gridGroup.add(line)
  }

  // Генерация вертикальных линий сетки
  for (let x = 0; x <= gridSize; x++) {
    const points = []
    points.push(new THREE.Vector3(x * cellSize - offset, 0.01, 0 - offset))
    points.push(new THREE.Vector3(x * cellSize - offset, 0.01, gridSize * cellSize - offset))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, gridMaterial)
    line.renderOrder = 1
    gridGroup.add(line)
  }

  // Карта всех ячеек: { "x,z": CellEntity }
  const cellEntities = {}

  // Геометрия и материал для ячеек
  const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize)
  const cellMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    roughness: 0.8,
    metalness: 0.2
  })

  // Генерация ячеек
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const mesh = new THREE.Mesh(cellGeometry, cellMaterial.clone())
      
      // Изначально располагаем ячейку в плоскости (высота будет обновлена позднее)
      mesh.position.set(x * cellSize + cellSize / 2 - offset, 0, z * cellSize + cellSize / 2 - offset)
      mesh.rotation.x = -Math.PI / 2
      
      // Сохраняем координаты в userData для быстрого доступа при пересечениях
      mesh.userData = { x, z, height: 0, angle: 0 }
      
      gridGroup.add(mesh)
      
      // Создаем сущность ячейки
      cellEntities[`${x},${z}`] = new CellEntity(mesh, x, z, 0, 0)
    }
  }

  return { gridGroup, cellEntities }
}
