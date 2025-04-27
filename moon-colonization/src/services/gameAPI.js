// API для работы с игровым процессом
import fetchAPI from './apiClient';

/**
 * API для работы с игровым процессом
 */
export const gameAPI = {
  /**
   * Добавление игрового дня
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} изменения за день
   */
  addDay(userId) {
    return fetchAPI(`/day/${userId}`);
  },
  
  /**
   * Получение рейтинга успешности
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} данные об успешности колонии
   */
  getSuccessRating(userId) {
    return fetchAPI(`/success/${userId}`);
  },
  
  /**
   * Обновление ресурсов колонии
   * @param {number} userId - ID пользователя
   * @param {Object} resources - объект с ресурсами для обновления
   * @returns {Promise<Object>} обновленные ресурсы
   */
  updateResources(userId, resources) {
    return fetchAPI(`/resources/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(resources),
    });
  },
  
  /**
   * Получение текущих ресурсов колонии
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} текущие ресурсы колонии
   */
  getResources(userId) {
    return fetchAPI(`/resources/${userId}`);
  },
  
  /**
   * Завершение колонизации
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} результаты колонизации
   */
  finishColonization(userId) {
    return fetchAPI(`/colonization/finish/${userId}`, {
      method: 'POST'
    });
  },
  
  /**
   * Получение статуса колонизации
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} статус колонизации
   */
  getColonizationStatus(userId) {
    return fetchAPI(`/colonization/status/${userId}`);
  }
};

export default gameAPI;