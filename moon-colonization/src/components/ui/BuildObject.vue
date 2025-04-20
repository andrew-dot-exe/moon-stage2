<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['build'])

const handleClick = () => {
  emit('build', {
    name: props.name,
    cost: props.cost
  })
}
</script>

<template>
  <div class="object" @click="handleClick">
    <div class="icon">
      <img :src="icon" :alt="name" />
    </div>
    <div class="info">
      <div class="name">{{ name }}</div>
      <div class="cost">{{ cost }}</div>
    </div>
    <div class="documentation">
      <div class="help-icon">?</div>
    </div>
  </div>
</template>

<style scoped>
.object {
  display: flex;
  align-items: center;
  background: #454545;
  padding: 10px;
  border-radius: 4px;
  width: 640px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.object:hover {
  background: #555555;
  transform: scale(1.02);
}

.icon {
  width: 100px;
  height: 100px;
  margin-right: 10px;
}

.icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info {
  flex: 1;
}

.name {
  color: white;
  font-size: 16px;
  margin-bottom: 5px;
}

.cost {
  color: white;
  font-size: 14px;
}

.documentation {
  width: 20px;
  height: 20px;
  background: #BCFE37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.help-icon {
  color: #454545;
  font-size: 14px;
}
</style> 