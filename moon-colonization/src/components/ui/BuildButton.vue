<script setup>
import { ref } from 'vue'

const isActive = ref(false)

const emit = defineEmits(['click'])

const handleClick = () => {
  isActive.value = !isActive.value
  emit('click', isActive.value)
}
</script>

<template>
  <button class="build-button" :class="{ active: isActive }" @click="handleClick">
    <div class="button-content">
      <div class="icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21" :stroke="isActive ? '#000000' : '#BCFE37'" stroke-width="2" stroke-linecap="round"/>
          <path d="M3 6H21" :stroke="isActive ? '#000000' : '#BCFE37'" stroke-width="2" stroke-linecap="round"/>
          <path d="M3 18H21" :stroke="isActive ? '#000000' : '#BCFE37'" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="text">Меню</div>
    </div>
  </button>
</template>

<style scoped>
.build-button {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  border-radius: 4px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  width: 48px;
}

.build-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.build-button.active {
  background: #BCFE37;
  border-color: #BCFE37;
}

.build-button.active .button-content {
  color: #000000;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #BCFE37;
}

.icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  font-size: 12px;
  font-weight: 500;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style> 