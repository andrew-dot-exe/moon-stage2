<script setup>
import { useGameStore } from '../../stores/gameStore'
import { ref } from 'vue'
import { generatePDF } from '@/pdf/generate' // Импортируем функцию для генерации PDF
import { parsing } from '@/pdf/parse' // Импортируем функцию для парсинга данных

const store = useGameStore()
const showStatsModal = ref(false)
const showMenu = ref(false)
const isProcessing = ref(false) // Добавляем переменную для отслеживания процесса

const handleResourceClick = (resource) => {
    console.log('Resource clicked:', resource)
}

function buttonShowMenu() {
    showMenu.value = true
}

function buttonShowStatsModal() {
    showStatsModal.value = true
}

const closeModal = () => {
    showStatsModal.value = false
}

const closeMenu = () => {
    showMenu.value = false
}

// Функция для выхода из аккаунта
function handleLogout() {
    store.logout()
    // Удаляем данные из localStorage
    localStorage.removeItem('user')
    closeMenu()
}

// Функция для завершения колонизации - перенесена из FinishColonizationButton
async function handleFinishColonization() {
  try {
    isProcessing.value = true;
    
    // Вызываем API для завершения колонизации
    const result = await store.finishColonization();
    
    if (result) {
      // Генерируем PDF с результатами
      generatePDF(result.success, result.userInfo, result.stat);
      alert('Колонизация успешно завершена! PDF отчёт сохранен.');
    } else {
      alert('Не удалось получить результаты колонизации');
    }
  } catch (error) {
    console.error('Ошибка при завершении колонизации:', error);
    alert(`Ошибка: ${error.message || 'Не удалось завершить колонизацию'}`);
  } finally {
    isProcessing.value = false;
    closeMenu(); // Закрываем меню после завершения
  }
}

// Функция для создания PDF из текущего состояния - перенесена из FinishColonizationButton
function handleGeneratePDFFromCurrentState() {
  try {
    isProcessing.value = true;
    
    // Собираем данные из хранилища
    const currentGameData = collectCurrentGameData();
    
    // Генерируем PDF на основе текущих данных
    generatePDF(
      currentGameData.success,
      currentGameData.userInfo,
      currentGameData.stat
    );
    
    alert('PDF отчёт с текущим состоянием колонии успешно создан!');
  } catch (error) {
    console.error('Ошибка при создании PDF из текущего состояния:', error);
    alert(`Ошибка: ${error.message || 'Не удалось создать PDF из текущего состояния'}`);
  } finally {
    isProcessing.value = false;
    closeMenu(); // Закрываем меню после завершения
  }
}

// Функция для сбора текущих данных игры из хранилища - перенесена из FinishColonizationButton
function collectCurrentGameData() {
  // Получаем данные о пользователе
  const userInfo = {
    name: store.user?.name || 'Тестовый пользователь',
    id: store.user?.id || 1,
    modules: [],
    links: []
  };
  
  // Получаем данные о построенных модулях
  const buildings = store.getBuildings();
  userInfo.modules = Object.entries(buildings).map(([key, building]) => {
    const [x, z] = key.split(',').map(Number);
    return {
      id: building.id || Math.floor(Math.random() * 1000),
      moduleType: getModuleTypeId(building.type),
      x: x,
      y: z, // В API используется y вместо z
      idZone: building.meta?.id_zone || store.currentZone?.id || 1
    };
  });
  
  // Создаем данные об успешности колонии
  const success = {
    successful: store.stats.success || 75,
    mood: store.stats.mood || 80,
    contPeople: store.stats.population || 500,
    needContPeople: 450, // Пример требуемого населения
    resources: store.stats.resources || 'Хорошее',
    central: store.stats.centralization || 'Средняя',
    search: store.stats.research || 15
  };
  
  // Создаем данные о ресурсах и производстве
  const stat = {
    countDay: store.currentTime.day || 25,
    countResources: store.resources.map(r => r.value),
    zoneProductions: []
  };
  
  // Данные о производстве по зонам
  // Заполняем тестовыми данными для всех 6 зон
  for (let i = 0; i < 6; i++) {
    stat.zoneProductions.push({
      id: i,
      name: getZoneName(i),
      production: [10, 15, 20, 25, 30, 5, 10, 15], // Примеры производства для каждого ресурса
      consumption: [5, 10, 15, 20, 25, 5, 5, 10]   // Примеры потребления для каждого ресурса
    });
  }
  
  return {
    success,
    userInfo,
    stat
  };
}

// Вспомогательная функция для получения ID типа модуля - перенесена из FinishColonizationButton
function getModuleTypeId(typeString) {
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
  
  return typeToIdMap[typeString] || 1; // По умолчанию жилой модуль
}

// Вспомогательная функция для получения названия зоны - перенесена из FinishColonizationButton
function getZoneName(id) {
  const zoneNames = ["Равнина 1", "Равнина 2", "Высота 1", "Высота 2", "Низина 1", "Низина 2"];
  return zoneNames[id] || `Зона ${id}`;
}
</script>

<template>
    <div class="header">
        <div class="logo">
            <div class="logo-container">
                <div class="logo-bar"></div>
                <div class="logo-content">
                    <img src="/src/assets/logo.svg" alt="Moon Logo" class="logo-image" />
                </div>
            </div>
        </div>
        
        <div class="resources">
            <div class="resource-row">
                <div 
                    class="resource-item" 
                    v-for="(resource, index) in store.resources.slice(0, 8)" 
                    :key="resource.id"
                    @click="handleResourceClick(resource)"
                >
                    <div class="resource-icon">
                        <img :src="`/resources-icons/${resource.id}.svg`" :alt="resource.name" />
                    </div>
                    <div class="resource-value">
                        <span>{{ resource.value }}</span>
                        <span>{{ resource.unit }}</span>
                    </div>
                    <div class="resource-tooltip">
                        <div class="tooltip-content">
                            <div class="tooltip-header">
                                <div class="tooltip-icon">
                                    <img :src="`/resources-icons/${resource.id}.svg`" :alt="resource.name" />
                                </div>
                                <span class="tooltip-name">{{ resource.name }}</span>
                            </div>
                            <div class="tooltip-stats">
                                <div class="tooltip-stat">
                                    <span class="plus">+</span>
                                    <span>{{ resource.production }}</span>
                                    <span>{{ resource.unit }}/с</span>
                                </div>
                                <div class="tooltip-stat">
                                    <span class="minus">-</span>
                                    <span>{{ resource.consumption }}</span>
                                    <span>{{ resource.unit }}/с</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="resource-row">
                <div 
                    class="resource-item" 
                    v-for="(resource, index) in store.resources.slice(8)" 
                    :key="resource.id" 
                    :class="{ 'opacity-0': index < 7 }"
                    @click="handleResourceClick(resource)"
                >
                    <div class="resource-icon">
                        <img :src="`/resources-icons/${resource.icon}.svg`" :alt="resource.name" />
                    </div>
                    <div class="resource-value">
                        <span>{{ resource.value }}</span>
                        <span>{{ resource.unit }}</span>
                    </div>
                    <div class="resource-tooltip">
                        <div class="tooltip-content">
                            <div class="tooltip-header">
                                <div class="tooltip-icon">
                                    <img :src="`/resources-icons/${resource.icon}.svg`" :alt="resource.name" />
                                </div>
                                <span class="tooltip-name">{{ resource.name }}</span>
                            </div>
                            <div class="tooltip-stats">
                                <div class="tooltip-stat">
                                    <span class="plus">+</span>
                                    <span>{{ resource.production }}</span>
                                    <span>{{ resource.unit }}/с</span>
                                </div>
                                <div class="tooltip-stat">
                                    <span class="minus">-</span>
                                    <span>{{ resource.consumption }}</span>
                                    <span>{{ resource.unit }}/с</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="controls">
            <div 
                class="stats-button" 
                @click="buttonShowStatsModal()"
            >
                <div class="stats-icon">
                    <img src="/ui/statistics.svg" alt="Statistics" />
                </div>
            </div>
            <div 
                class="menu-button"
                @click="buttonShowMenu()"
            >
                <div class="menu-icon">
                    <img src="/ui/menu-button.svg" alt="Menu" />
                </div>
            </div>
        </div>
    </div>

    <!-- Menu Overlay -->
    <div v-if="showMenu" class="menu-overlay" @click="closeMenu">
        <div class="menu-background"></div>
        <div class="menu-content" @click.stop>
            <div class="menu-header">
                <div class="menu-button" @click="closeMenu">
                    <div class="button-icon"></div>
                </div>
            </div>
            <div class="menu-items">
                <div class="menu-item primary" @click="handleLogout">
                    <span>Выйти из аккаунта</span>
                </div>
                <div class="menu-item primary" @click="handleFinishColonization">
                    <span>Завершить колонизацию</span>
                </div>
                <div class="menu-item" @click="handleGeneratePDFFromCurrentState">
                    <span>Экспорт в PDF</span>
                </div>
                <div class="menu-item">
                    <span>Обучение</span>
                </div>
                <div class="menu-item">
                    <span>Документация ↗</span>
                </div>
                <div class="menu-item">
                    <span>Вернуться на сайт-визитку ↗</span>
                </div>
            </div>
            <div class="menu-footer">
                <div class="footer-divider"></div>
                <div class="footer-logo">
                    <img src="/src/assets/logo.svg" alt="Logo" />
                </div>
                <div class="footer-text">
                    <p>Разработано командой BFG 10.000 в рамках олимпиады</p>
                    <div class="footer-link">
                        <span>Космический кубок: Миссия «ЛУНА»</span>
                        <span class="arrow">↗</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Статистика</h2>
                    <button class="close-button" @click="closeModal">×</button>
                </div>
                <div class="modal-body">
                    <div class="resources-section">
                        <h3>Всего у вас ресурсов:</h3>
                        <div class="resources-grid">
                            <div v-for="resource in store.resources" :key="resource.id" class="resource-item">
                                <div class="resource-icon">
                                    <img :src="`/resources-icons/${resource.icon}.svg`" :alt="resource.name" />
                                </div>
                                <div class="resource-info">
                                    <span class="resource-name">{{ resource.name }}</span>
                                    <div class="resource-values">
                                        <span class="resource-value">{{ resource.value }}</span>
                                        <span class="resource-unit">{{ resource.unit }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="consumption-section">
                        <h3>Всего потребление и восполнение ресурсов:</h3>
                        <div class="consumption-grid">
                            <div v-for="resource in store.resources" :key="resource.id" class="consumption-item">
                                <div class="consumption-header">
                                    <div class="consumption-icon">
                                        <img :src="`/resources-icons/${resource.icon}.svg`" :alt="resource.name" />
                                    </div>
                                    <span class="consumption-name">{{ resource.name }}</span>
                                </div>
                                <div class="consumption-values">
                                    <div class="value-row">
                                        <span class="plus">+</span>
                                        <span class="value">{{ resource.production }}</span>
                                        <span class="unit">{{ resource.unit }}/с</span>
                                    </div>
                                    <div class="value-row">
                                        <span class="minus">-</span>
                                        <span class="value">{{ resource.consumption }}</span>
                                        <span class="unit">{{ resource.unit }}/с</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="zones-section">
                        <h3>Потребление по областям:</h3>
                        <div class="zones-list">
                            <div v-for="zone in store.zones" :key="zone.id" class="zone-item">
                                <div class="zone-header">
                                    <span class="zone-name">{{ zone.name }}</span>
                                    <span class="zone-arrow">⇤</span>
                                </div>
                                <div class="zone-details">
                                    <div v-for="area in zone.areas" :key="area.id" class="area-item">
                                        <span class="area-name">{{ area.name }}</span>
                                        <span class="area-arrow">⇤</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 62px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.8);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

.logo {
    width: 188px;
    height: 62px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
}

.logo-container {
    width: 188px;
    height: 40px;
    display: flex;
    align-items: center;
    margin-top: 11px;
}

.logo-bar {
    width: 10px;
    height: 40px;
    background: #BCFE37;
}

.logo-content {
    width: 178px;
    height: 40px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #BCFE37;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-text {
    width: 138px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-text img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.logo-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 5px;
}

.resources {
    width: 754px;
    height: 62px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
    margin: 0 auto;
}

.resource-row {
    display: flex;
    gap: 2px;
    align-content: center;
}

.resource-item {
    position: relative;
    padding: 5px;
    background: #464646;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.resource-item:hover {
    background: #565656;
}

.resource-item.opacity-0 {
    opacity: 0;
}

.resource-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.resource-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.resource-value {
    color: white;
    font-family: 'Feature Mono', monospace;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.75px;
    display: flex;
    gap: 5px;
    align-items: center;
}

.controls {
    width: 188px;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 30px;
    padding-right: 20px;
}

.control-button {
    width: 40px;
    height: 40px;
    padding: 5px;
    background: #BCFE37;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.control-button:hover {
    background: #a8e02e;
}

.button-icon {
    width: 30px;
    height: 30px;
    position: relative;
    overflow: hidden;
}

.button-icon::after {
    content: '';
    position: absolute;
    width: 27.3px;
    height: 27.3px;
    left: 1.35px;
    top: 1.35px;
    background: black;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    position: relative;
    width: 800px;
    height: 807px;
    background: rgba(70, 70, 70, 1);
    border: 1px solid #BCFE37;
    overflow: hidden;
}

.modal-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(70, 70, 70, 1);
}

.modal-content {
    position: relative;
    padding: 50px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modal-header {
    position: relative;
    padding: 15px 0;
    text-align: center;
    border-bottom: 1px solid #BCFE37;
}

.modal-header h2 {
    color: #BCFE37;
    font-size: 40px;
    margin: 0;
    font-family: 'Feature Mono', monospace;
}

.close-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
    background: #BCFE37;
    color: black;
    border: none;
    font-size: 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
}

.resources-section,
.consumption-section,
.zones-section {
    margin-bottom: 25px;
}

.resources-section h3,
.consumption-section h3,
.zones-section h3 {
    color: white;
    font-size: 20px;
    margin-bottom: 20px;
    font-family: 'Feature Mono', monospace;
}

.resources-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.resource-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
}

.resource-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.resource-name {
    color: #BCFE37;
    font-size: 10px;
}

.resource-values {
    display: flex;
    gap: 5px;
}

.resource-value,
.resource-unit {
    color: white;
    font-size: 15px;
}

.consumption-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.consumption-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
}

.consumption-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.consumption-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.consumption-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.consumption-name {
    color: #BCFE37;
    font-size: 10px;
}

.consumption-values {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.value-row {
    display: flex;
    align-items: center;
    gap: 5px;
}

.plus {
    color: #BCFE37;
    font-size: 10px;
}

.minus {
    color: #FF2B2B;
    font-size: 10px;
}

.value {
    color: white;
    font-size: 15px;
}

.unit {
    color: white;
    font-size: 15px;
}

.zones-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.zone-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.zone-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid #BCFE37;
}

.zone-name {
    color: #BCFE37;
    font-size: 13px;
}

.zone-arrow {
    color: white;
    font-size: 21px;
}

.zone-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 20px;
}

.area-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid #BCFE37;
}

.area-name {
    color: #BCFE37;
    font-size: 13px;
}

.area-arrow {
    color: white;
    font-size: 21px;
}

.resource-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 100;
}

.resource-item:hover .resource-tooltip {
    opacity: 1;
    visibility: visible;
}

.tooltip-content {
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #BCFE37;
    padding: 10px;
    min-width: 200px;
}

.tooltip-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #BCFE37;
}

.tooltip-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tooltip-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.tooltip-name {
    color: #BCFE37;
    font-size: 14px;
    font-family: 'Feature Mono', monospace;
}

.tooltip-stats {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.tooltip-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: white;
    font-size: 12px;
    font-family: 'Feature Mono', monospace;
}

.tooltip-stat .plus {
    color: #BCFE37;
}

.tooltip-stat .minus {
    color: #FF2B2B;
}

.menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
}

.menu-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
}

.menu-content {
    position: relative;
    width: 470px;
    height: 100%;
    background: #464646;
    padding: 126px 0 0;
    display: flex;
    flex-direction: column;
    background-image: url('/textures/all-zones.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.menu-header {
    position: absolute;
    top: 10px;
    right: 20px;
}

.menu-button {
    width: 20px;
    height: 42px;
    background: #BCFE37;
    display: flex;
    justify-content: center;
    align-items: center;
}

.menu-items {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 0 20px;
}

.menu-item {
    color: white;
    font-size: 20px;
    cursor: pointer;
    transition: color 0.2s;
    font-family: 'Feature Mono', monospace;
}

.menu-item:hover {
    color: #BCFE37;
}

.menu-item.primary {
    background: #BCFE37;
    color: black;
    padding: 10px;
    border-radius: 0;
}

.menu-footer {
    margin-top: auto;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.footer-divider {
    height: 1px;
    background: #A3A3A3;
}

.footer-logo {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.footer-logo img {
    height: 100%;
    object-fit: contain;
}

.footer-text {
    color: #A3A3A3;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: 'Feature Mono', monospace;
}

.footer-link {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.footer-link:hover {
    color: #BCFE37;
}

.arrow {
    font-size: 12px;
}

.coordinates-box {
    width: 188px;
    height: 62px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.8);
    padding: 0 20px;
}

.coordinates-content {
    display: flex;
    gap: 20px;
}

.coordinate {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.label {
    color: white;
    font-size: 12px;
    font-family: 'Feature Mono', monospace;
}

.value {
    color: white;
    font-size: 15px;
    font-family: 'Feature Mono', monospace;
}
</style>