// linkStore.js - управление соединениями между модулями
import { ref } from 'vue'
import api from '@/services/api'

export function useLinkStore() {
  // Link state
  const links = ref([])
  const error = ref(null)

  // Link actions
  async function createLink(fromModuleId, toModuleId, userId) {
    if (!userId) {
      error.value = 'Создание соединений доступно только авторизованным пользователям'
      return false
    }
    
    try {
      const linkData = {
        id_user: userId,
        id_from: fromModuleId,
        id_to: toModuleId
      }
      
      const result = await api.link.createLink(linkData)
      if (result) {
        // Добавляем связь в локальный кэш
        links.value.push({
          id_from: fromModuleId,
          id_to: toModuleId
        })
      }
      return result
    } catch (err) {
      error.value = err.message || 'Ошибка создания соединения'
      console.error('Ошибка при создании соединения:', err)
      return false
    }
  }

  async function deleteLink(fromModuleId, toModuleId, userId) {
    if (!userId) {
      error.value = 'Удаление соединений доступно только авторизованным пользователям'
      return false
    }
    
    try {
      const linkData = {
        id_user: userId,
        id_from: fromModuleId,
        id_to: toModuleId
      }
      
      await api.link.deleteLink(linkData)
      
      // Удаляем связь из локального кэша
      links.value = links.value.filter(link => 
        link.id_from !== fromModuleId || link.id_to !== toModuleId
      )
      
      return true
    } catch (err) {
      error.value = err.message || 'Ошибка удаления соединения'
      console.error('Ошибка при удалении соединения:', err)
      return false
    }
  }

  async function getUserLinks(userId) {
    if (!userId) {
      return links.value
    }
    
    try {
      const userLinks = await api.link.getUserLinks(userId)
      // Обновляем локальный кэш
      links.value = userLinks
      return userLinks
    } catch (err) {
      error.value = err.message || 'Ошибка получения соединений'
      console.error('Ошибка при получении соединений:', err)
      return []
    }
  }

  return {
    // State
    links,
    error,
    
    // Actions
    createLink,
    deleteLink,
    getUserLinks
  }
}