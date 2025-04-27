// userStore.js - управление пользователями и аутентификацией
import { ref, computed } from 'vue'
import api from '@/services/api'

export function useUserStore() {
  // User state
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Авторизация пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} данные пользователя
   */
  async function login(email, password) {
    isLoading.value = true
    error.value = null
    
    try {
      const userData = await api.user.login(email, password)
      user.value = userData
      return userData
    } catch (err) {
      error.value = err.message || 'Ошибка входа'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Регистрация нового пользователя
   * @param {Object} userData - данные пользователя
   * @returns {Promise<number>} ID созданного пользователя
   */
  async function register(userData) {
    isLoading.value = true
    error.value = null
    
    try {
      const userId = await api.user.register(userData)
      // После регистрации можно автоматически авторизоваться
      if (userId) {
        return login(userData.email, userData.password)
      }
      return userId
    } catch (err) {
      error.value = err.message || 'Ошибка регистрации'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Выход пользователя из системы
   */
  function logout() {
    user.value = null
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout
  }
}