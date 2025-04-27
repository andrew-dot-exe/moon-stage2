// API для работы с колонией
import fetchAPI from './apiClient';

/**
 * API для работы с колонией
 */
export const colonyAPI = {
  /**
   * Создание колонии для пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} данные созданной колонии
   */
  createColony(userId) {
    return fetchAPI('/colony', {
      method: 'POST',
      body: JSON.stringify(userId),
    });
  },
  
  /**
   * Удаление колонии
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  deleteColony(userId) {
    return fetchAPI(`/colony?idUser=${userId}`, {
      method: 'DELETE',
    });
  },
};

export default colonyAPI;