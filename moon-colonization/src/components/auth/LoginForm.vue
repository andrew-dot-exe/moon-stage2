<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()

// Состояние формы
const email = ref('')
const password = ref('')
const isRegistration = ref(false)
const name = ref('')
const formError = ref('')

// Вычисляемое свойство для заголовка формы
const formTitle = computed(() => isRegistration.value ? 'Регистрация' : 'Вход')

// Обработчик отправки формы
async function handleSubmit() {
  formError.value = '' // Сбрасываем ошибку перед отправкой
  
  if (!validateForm()) {
    return
  }
  
  try {
    if (isRegistration.value) {
      await store.register({
        name: name.value,
        email: email.value,
        password: password.value
      })
    } else {
      await store.login(email.value, password.value)
    }
    
    // После успешной авторизации сохраняем пользователя в localStorage
    localStorage.setItem('user', JSON.stringify(store.user))
    
    // Инициализируем данные
    await store.loadZones()
  } catch (error) {
    formError.value = error.message || 'Произошла ошибка. Пожалуйста, попробуйте снова.'
  }
}

// Валидация формы
function validateForm() {
  if (!email.value) {
    formError.value = 'Введите email'
    return false
  }
  
  if (!password.value) {
    formError.value = 'Введите пароль'
    return false
  }
  
  if (isRegistration.value && !name.value) {
    formError.value = 'Введите имя'
    return false
  }
  
  return true
}

// Переключение между формами входа и регистрации
function toggleForm() {
  isRegistration.value = !isRegistration.value
  formError.value = ''
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>{{ formTitle }}</h2>
      
      <div v-if="formError" class="form-error">
        {{ formError }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div v-if="isRegistration" class="form-group">
          <label for="name">Имя</label>
          <input 
            id="name" 
            v-model="name" 
            type="text" 
            placeholder="Введите ваше имя"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="Введите ваш email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="Введите ваш пароль"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="store.isLoading">
            {{ isRegistration ? 'Зарегистрироваться' : 'Войти' }}
          </button>
          
          <button type="button" @click="toggleForm" class="toggle-form-btn">
            {{ isRegistration ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  color: white;
}

.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

h2 {
  margin-bottom: 1.5rem;
  color: #BCFE37;
  font-family: 'Feature Mono', monospace;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: 'Feature Mono', monospace;
  color: #A3A3A3;
}

input {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
  font-family: 'Feature Mono', monospace;
}

input:focus {
  border-color: #BCFE37;
  outline: none;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Feature Mono', monospace;
  font-weight: 600;
  transition: background-color 0.2s;
}

button[type="submit"] {
  background-color: #BCFE37;
  color: #000;
}

button[type="submit"]:hover {
  background-color: #a8e730;
}

button[type="submit"]:disabled {
  background-color: #6a8a20;
  cursor: not-allowed;
}

.toggle-form-btn {
  background-color: transparent;
  color: #BCFE37;
  text-decoration: underline;
}

.toggle-form-btn:hover {
  color: #a8e730;
}

.form-error {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  border-radius: 4px;
  color: #ff6b6b;
  font-family: 'Feature Mono', monospace;
}
</style>