<script setup>
const emit = defineEmits(['confirm'])

const handleClick = () => {
  emit('confirm')
}
</script>

<template>
  <button class="confirm-button" @click="handleClick">
    <div class="button-content">
      <div class="icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.4142 2.58579C10.6332 1.80474 9.36684 1.80474 8.58579 2.58579L2.58579 8.58579C1.80474 9.36684 1.80474 10.6332 2.58579 11.4142L11.4142 20.2426C12.1953 21.0237 13.4616 21.0237 14.2426 20.2426L20.2426 14.2426C21.0237 13.4616 21.0237 12.1953 20.2426 11.4142L11.4142 2.58579Z" stroke="#BCFE37" stroke-width="2"/>
          <path d="M15 9L9 15" stroke="#BCFE37" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 8L8 16" stroke="#BCFE37" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="text">Построить</div>
    </div>
  </button>
</template>

<style scoped>
.confirm-button {
  position: absolute;
  bottom: 20px;
  right: 240px; /* Изменение позиции с 20px на 240px, чтобы кнопка была левее миникарты */
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #BCFE37;
  border-radius: 4px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  width: 48px;
}

.confirm-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
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