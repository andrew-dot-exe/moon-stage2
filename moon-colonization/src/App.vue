<script setup>
import { onMounted, computed } from 'vue'
import Header from './components/ui/Header.vue'
import GameInterface from './components/ui/GameInterface.vue'
import Colonization from './components/Colonization.vue'
import ZonePage from './components/zone/ZonePage.vue'
import LoginForm from './components/auth/LoginForm.vue'
import { useGameStore } from './stores/gameStore'

const store = useGameStore()

// Определяем, какой компонент должен отображаться
const isAuthenticated = computed(() => store.isAuthenticated)

// При монтировании компонента инициализируем приложение
onMounted(async () => {
  await store.initialize()
})
</script>

<template>
  <div class="app">
    <!-- Показываем форму авторизации, если пользователь не авторизован -->
    <template v-if="!isAuthenticated">
      <LoginForm />
    </template>
    
    <!-- Показываем игровой интерфейс, если пользователь авторизован -->
    <template v-else>
      <Header />
      <ZonePage v-if="!store.currentZone" />
      <Colonization v-else />
      <GameInterface />
    </template>
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: black;
}
</style>
