// API для работы с соединениями между модулями
import fetchAPI from './apiClient';

/**
 * API для работы с соединениями между модулями
 */
export const linkAPI = {
  /**
   * Создание соединения
   * @param {Object} linkData - данные о создаваемом соединении
   * @returns {Promise<number>} статус создания соединения
   */
  createLink(linkData) {
    return fetchAPI('/link', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },
  
  /**
   * Удаление соединения
   * @param {Object} linkData - данные об удаляемом соединении
   * @returns {Promise<void>}
   */
  deleteLink(linkData) {
    return fetchAPI('/link', {
      method: 'DELETE',
      body: JSON.stringify(linkData),
    });
  },
  
  /**
   * Получение всех соединений для пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} список соединений
   */
  getUserLinks(userId) {
    return fetchAPI(`/link/${userId}`);
  },
  
  /**
   * Проверка возможности создания соединения
   * @param {Object} linkData - данные о проверяемом соединении
   * @returns {Promise<Object>} результаты проверки
   */
  checkLinkPossibility(linkData) {
    return fetchAPI('/link/check', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },
  
  /**
   * Получение оптимальных маршрутов соединений
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} оптимальные маршруты
   */
  getOptimalRoutes(userId) {
    return fetchAPI(`/link/optimal/${userId}`);
  }
};

export default linkAPI;