<template>
  <div class="cell-info-panel" v-if="visible">
    <div class="panel-header">
      <h3>Информация о ячейке</h3>
      <button class="close-button" @click="close">×</button>
    </div>
    <div class="panel-content" v-if="cellInfo">
      <div class="info-group">
        <h4>Координаты</h4>
        <div class="info-row">
          <span class="label">Игровые:</span>
          <span class="value">X: {{ cellInfo.x }}, Z: {{ cellInfo.z }}</span>
        </div>
        <div class="info-row" v-if="lunarCoordinates">
          <span class="label">Лунные:</span>
          <div class="lunar-coordinates">
            <div class="coordinates-row" title="Скопировать координаты" @click="copyToClipboard(`${formatCoordinate(lunarCoordinates.latitude, 'lat')}, ${formatCoordinate(lunarCoordinates.longitude, 'long')}`)">
              <span class="coord-value">{{ formatCoordinate(lunarCoordinates.latitude, 'lat') }}</span>
              <span class="coord-value">{{ formatCoordinate(lunarCoordinates.longitude, 'long') }}</span>
              <span class="copy-icon">⧉</span>
            </div>
            <div class="coordinates-details" v-if="lunarCoordinates.regionName">
              <span class="region-name">{{ lunarCoordinates.regionName }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="info-group" v-if="terrainInfo">
        <h4>Рельеф</h4>
        <div class="info-row">
          <span class="label">Тип:</span>
          <span class="value">{{ getTerrainTypeName(terrainInfo.type) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Высота:</span>
          <span class="value">{{ terrainInfo.height }} м</span>
        </div>
        <div class="info-row">
          <span class="label">Уклон:</span>
          <span class="value" :class="getSlopeClass(terrainInfo.slope)">
            {{ terrainInfo.slope.toFixed(2) }}°
          </span>
        </div>
        <div class="info-row">
          <span class="label">Освещенность:</span>
          <span class="value">{{ terrainInfo.illumination }}%</span>
        </div>
      </div>
      
      <div class="info-group" v-if="buildingInfo">
        <h4>Постройка</h4>
        <div class="info-row">
          <span class="label">Тип:</span>
          <span class="value">{{ getBuildingTypeName(buildingInfo.type) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Размещена:</span>
          <span class="value">{{ formatDate(buildingInfo.placedAt) }}</span>
        </div>
      </div>
      
      <div class="info-group" v-if="placementInfo && !buildingInfo">
        <h4>Размещение</h4>
        <div class="info-row">
          <span class="label">Статус:</span>
          <span class="value" :class="placementInfo.possible ? 'success' : 'error'">
            {{ placementInfo.possible ? 'Можно строить' : 'Нельзя строить' }}
          </span>
        </div>
        <div class="info-row" v-if="!placementInfo.possible">
          <span class="label">Причина:</span>
          <span class="value error">{{ placementInfo.reason || 'Неизвестная причина' }}</span>
        </div>
        <div class="info-row" v-if="placementInfo.suitability">
          <span class="label">Пригодность:</span>
          <span class="value" :class="getSuitabilityClass(placementInfo.suitability)">
            {{ getSuitabilityText(placementInfo.suitability) }}
          </span>
        </div>
      </div>
      
      <div class="actions" v-if="!buildingInfo">
        <button 
          v-if="!checkingPlacement && !isBuildMenuOpen" 
          class="action-button" 
          @click="openBuildMenu">
          Построить
        </button>
        <button 
          v-if="buildingInfo" 
          class="action-button danger" 
          @click="removeBuilding">
          Удалить
        </button>
      </div>
    </div>
    <div class="loading" v-else-if="loading">
      <div class="spinner"></div>
      <span>Загрузка информации...</span>
    </div>
    <div class="empty-state" v-else>
      <p>Выберите ячейку на карте, чтобы увидеть информацию о ней</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps({
  cellInfo: Object,
  visible: {
    type: Boolean,
    default: false
  },
  isBuildMenuOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'build', 'remove']);

const store = useGameStore();
const loading = ref(false);
const terrainInfo = ref(null);
const placementInfo = ref(null);
const checkingPlacement = ref(false);

// Получаем информацию о выбранном здании, если оно есть
const buildingInfo = computed(() => {
  if (!props.cellInfo) return null;
  const key = `${props.cellInfo.x},${props.cellInfo.z}`;
  return store.buildings[key] || null;
});

// Получаем лунные координаты из хранилища
const lunarCoordinates = computed(() => store.lunarCoordinates);

// Загрузка данных о рельефе при выборе ячейки
watch(() => props.cellInfo, async (newCell) => {
  if (newCell) {
    loading.value = true;
    terrainInfo.value = null;
    placementInfo.value = null;
    
    try {
      // Получаем информацию о рельефе
      const zoneId = store.currentZone?.id;
      if (zoneId) {
        const terrain = await store.getZoneTerrainData(zoneId);
        
        if (terrain) {
          // Находим информацию о конкретной ячейке
          const cellTerrain = terrain.find(t => 
            t.x === newCell.x && t.y === newCell.z
          ) || {
            x: newCell.x,
            y: newCell.z,
            type: 'unknown',
            height: 0,
            slope: 0,
            illumination: 50
          };
          
          terrainInfo.value = {
            ...cellTerrain,
            z: cellTerrain.y // Преобразуем y с бэкенда в z для фронтенда
          };
        }
        
        // Проверяем возможность размещения модулей
        await checkPlacement(newCell.x, newCell.z);
      }
    } catch (error) {
      console.error('Ошибка при получении данных о ячейке:', error);
    } finally {
      loading.value = false;
    }
  }
}, { immediate: true });

/**
 * Проверка возможности размещения модулей
 */
async function checkPlacement(x, z) {
  if (!store.user?.id || !store.currentZone?.id) return;
  
  checkingPlacement.value = true;
  
  try {
    // Проверяем общую возможность размещения
    const defaultModuleType = 2; // ID административного модуля
    const result = await store.module.checkPlacement({
      id_user: Number(store.user.id),
      module_type: defaultModuleType,
      x: Number(x),
      y: Number(z),
      id_zone: store.currentZone.id
    });
    
    // Проверяем пригодность зоны
    const suitabilityData = await store.getZoneSuitability();
    
    let suitability = 0;
    if (suitabilityData) {
      const cellSuitability = suitabilityData.find(s => 
        s.x === x && s.y === z
      );
      suitability = cellSuitability ? cellSuitability.suitability : 0;
    }
    
    placementInfo.value = {
      possible: result.possible,
      reason: result.reason,
      suitability: suitability
    };
  } catch (error) {
    console.error('Ошибка при проверке возможности размещения:', error);
    placementInfo.value = { 
      possible: false, 
      reason: 'Ошибка при проверке: ' + (error.message || 'неизвестная ошибка')
    };
  } finally {
    checkingPlacement.value = false;
  }
}

function close() {
  emit('close');
}

function openBuildMenu() {
  emit('build');
}

function removeBuilding() {
  if (props.cellInfo && buildingInfo.value) {
    emit('remove', { x: props.cellInfo.x, z: props.cellInfo.z });
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Координаты скопированы:', text);
  }).catch(err => {
    console.error('Ошибка копирования:', err);
  });
}

function formatCoordinate(value, type) {
  if (type === 'lat') {
    return `${value.toFixed(2)}° N`;
  } else if (type === 'long') {
    return `${value.toFixed(2)}° E`;
  }
  return value.toFixed(2);
}

// Вспомогательные функции
function getTerrainTypeName(type) {
  const typeMap = {
    'heights': 'Возвышенность',
    'lowlands': 'Низина',
    'plains': 'Равнина',
    'unknown': 'Неизвестно'
  };
  return typeMap[type] || 'Неизвестно';
}

function getSlopeClass(slope) {
  if (slope < 5) return 'success';
  if (slope < 15) return 'warning';
  return 'error';
}

function getSuitabilityClass(value) {
  if (value > 70) return 'success';
  if (value > 40) return 'warning';
  return 'error';
}

function getSuitabilityText(value) {
  if (value > 70) return 'Высокая (' + value + '%)';
  if (value > 40) return 'Средняя (' + value + '%)';
  return 'Низкая (' + value + '%)';
}

function getBuildingTypeName(type) {
  const typeMap = {
    'residential_complex_2x1': 'Жилой комплекс',
    'admin_module': 'Административный модуль',
    'medical_module': 'Медицинский модуль',
    'sport_module': 'Спортивный модуль',
    'research_module': 'Исследовательский модуль',
    'plantation': 'Плантация',
    'solar_power_plant': 'Солнечная электростанция',
    'mining_base': 'Горнодобывающая база',
    'manufacture': 'Производство',
    'warehouse': 'Склад',
    'waste_center': 'Центр утилизации',
    'repair_module': 'Ремонтный модуль',
    'communication_tower': 'Коммуникационная башня',
    'telescope': 'Телескоп',
    'cosmodrome': 'Космодром'
  };
  
  return typeMap[type] || (typeof type === 'number' ? `Модуль #${type}` : 'Неизвестный модуль');
}

function formatDate(dateString) {
  if (!dateString) return 'Неизвестно';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}
</script>

<style scoped>
.cell-info-panel {
  position: fixed; /* Изменено на fixed для привязки к окну */
  left: 20px;
  top: 20px; /* Перенос в левый верхний угол */
  width: 300px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  border-radius: 4px;
  padding: 15px;
  color: white;
  font-family: 'Feature Mono', monospace;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  max-height: calc(100vh - 40px); /* Уменьшено для учета нового положения */
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(188, 254, 55, 0.5);
  padding-bottom: 8px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #BCFE37;
}

.close-button {
  background: none;
  border: none;
  color: #BCFE37;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-button:hover {
  color: white;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  margin-bottom: 15px;
}

.info-group h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #BCFE37;
  border-bottom: 1px solid rgba(188, 254, 55, 0.2);
  padding-bottom: 5px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.value {
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-align: right;
}

.success {
  color: #BCFE37;
}

.warning {
  color: #F5A623;
}

.error {
  color: #FF4D4F;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(188, 254, 55, 0.2);
  border-top-color: #BCFE37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: rgba(255, 255, 255, 0.5);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-button {
  flex: 1;
  background-color: rgba(188, 254, 55, 0.2);
  border: 1px solid #BCFE37;
  color: #BCFE37;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Feature Mono', monospace;
  font-size: 14px;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: rgba(188, 254, 55, 0.3);
}

.action-button.danger {
  background-color: rgba(255, 77, 79, 0.2);
  border-color: #FF4D4F;
  color: #FF4D4F;
}

.action-button.danger:hover {
  background-color: rgba(255, 77, 79, 0.3);
}

.lunar-coordinates {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.coordinates-row {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.coord-value {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.copy-icon {
  color: #BCFE37;
  font-size: 14px;
}

.coordinates-details {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.region-name {
  font-style: italic;
}
</style>