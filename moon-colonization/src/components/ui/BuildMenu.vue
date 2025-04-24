<script setup>
import { ref } from 'vue'
import BuildObject from './BuildObject.vue'

const currentSection = ref(0) // Текущая выбранная категория
const currentPage = ref(1)
const totalPages = ref(2)

const sections = [
  {
    name: 'Обитаемые модули',
    color: '#BCFE37',
    items: [
      {
        name: 'Административный модуль',
        cost: '16 000 кг',
        icon: '/buildings/habitables/admin-module.png',
        type: 'admin_module',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Жилой комплекс',
        cost: '9 500 кг',
        icon: '/buildings/habitables/2x1living-module.png',
        type: 'residential_complex_2x1',
        footprint: [ {x:0, z:0}, {x:1, z:0} ]
      },
      {
        name: 'Спортивные модули',
        cost: '5 000 кг',
        icon: '/buildings/habitables/sport-module.png',
        type: 'sport_module',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Медицинский модуль',
        cost: '12 000 кг',
        icon: '/buildings/habitables/medical-module.png',
        type: 'medical_module',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Плантация',
        cost: '8 000 кг',
        icon: '/buildings/habitables/plantation.png',
        type: 'plantation',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Исследовательский модуль',
        cost: '14 000 кг',
        icon: '/buildings/habitables/research-module.png',
        type: 'research_module',
        footprint: [ {x:0, z:0} ]
      }
    ]
  },
  {
    name: 'Технологические модули',
    color: '#3399FF',
    items: [
      {
        name: 'Солнечная электростанция',
        cost: '7 500 кг',
        icon: '/buildings/technological/solar-power-plant.png',
        type: 'solar_power_plant',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Производство',
        cost: '20 000 кг',
        icon: '/buildings/technological/manufacture.png',
        type: 'manufacture',
        footprint: [ {x:0, z:0}, {x:1, z:0} ]
      },
      {
        name: 'Склад',
        cost: '6 000 кг',
        icon: '/buildings/technological/warehouse.png',
        type: 'warehouse',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Центр утилизации',
        cost: '8 000 кг',
        icon: '/buildings/technological/waste-center.png',
        type: 'waste_center',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Ремонтный модуль',
        cost: '10 000 кг',
        icon: '/buildings/technological/repair-module.png',
        type: 'repair_module',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Горнодобывающая база',
        cost: '25 000 кг',
        icon: '/buildings/technological/mining-base.png',
        type: 'mining_base',
        footprint: [ {x:0, z:0}, {x:1, z:0} ]
      }
    ]
  },
  {
    name: 'Связь и инфраструктура',
    color: '#FF9900',
    items: [
      {
        name: 'Коммуникационная башня',
        cost: '12 000 кг',
        icon: '/buildings/technological/communication-tower.png',
        type: 'communication_tower',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Телескоп',
        cost: '18 000 кг',
        icon: '/buildings/technological/telescope.png',
        type: 'telescope',
        footprint: [ {x:0, z:0} ]
      },
      {
        name: 'Космодром',
        cost: '50 000 кг',
        icon: '/buildings/technological/cosmodrome.png',
        type: 'cosmodrome',
        footprint: [ {x:0, z:0}, {x:1, z:0}, {x:0, z:1}, {x:1, z:1} ]
      }
    ]
  }
]

const emit = defineEmits(['build'])

const changeSection = (index) => {
  currentSection.value = index
  currentPage.value = 1 // Сбрасываем страницу на первую при смене категории
}

const handleBuild = (item) => {
  const fullItem = sections[currentSection.value].items.find(i => i.type === item.type)
  emit('build', fullItem)
}
</script>

<template>
  <div class="build-menu">
    <div class="sections">
      <div 
        v-for="(section, index) in sections" 
        :key="index" 
        class="section"
        @click="changeSection(index)"
      >
        <div 
          class="section-name" 
          :style="{ 
            color: section.color, 
            opacity: currentSection === index ? 1 : 0.5,
            fontWeight: currentSection === index ? 'bold' : 'normal'
          }"
        >
          {{ section.name }}
        </div>
        <div v-if="index < sections.length - 1" class="separator">|</div>
      </div>
      <div class="destroy-section">
        <div class="destroy-text">Разрушить объект</div>
        <div class="delete-icon">Del</div>
      </div>
    </div>

    <div class="objects">
      <BuildObject
        v-for="(item, index) in sections[currentSection].items"
        :key="index"
        :name="item.name"
        :cost="item.cost"
        :icon="item.icon"
        @build="() => handleBuild(item)"
      />
    </div>

    <div class="pagination">
      <div class="prev">&lt;</div>
      <div class="page-numbers">
        <span class="current">{{ currentPage }}</span>
        <span>/</span>
        <span>{{ totalPages }}</span>
      </div>
      <div class="next">&gt;</div>
    </div>
  </div>
</template>

<style scoped>
.build-menu {
  width: 60%;
  max-width: 1500px;
  height: auto;
  min-height: 220px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  position: absolute;
  bottom: 20px;
  left: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.sections {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer; /* Добавлен курсор pointer для визуального указания на кликабельность */
}

.section-name {
  font-size: 14px;
  font-weight: 500;
}

.separator {
  color: #454545;
}

.destroy-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.destroy-text {
  color: #FF2B2B;
  font-size: 12px;
}

.delete-icon {
  color: #454545;
  font-size: 14px;
}

.objects {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  margin-top: auto;
}

.prev, .next {
  color: #454545;
  font-size: 16px;
}

.page-numbers {
  display: flex;
  gap: 5px;
  color: #BCFE37;
  font-size: 16px;
}

.current {
  color: #BCFE37;
}
</style>