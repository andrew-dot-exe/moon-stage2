// API для работы с территориями
import fetchAPI from './apiClient';

/**
 * API для работы с территориями
 */
export const areaAPI = {
  /**
   * Получение информации о зонах
   * @returns {Promise<Array>} данные о зонах
   */
  getAreas() {
    return fetchAPI('/area');
  },
  
  /**
   * Получение информации о рельефе конкретной зоны
   * @param {number} zoneId - ID зоны
   * @returns {Promise<Object>} данные о рельефе зоны
   */
  getZoneTerrain(zoneId) {
    return fetchAPI(`/area/${zoneId}/terrain`);
  },
  
  /**
   * Получение данных о пригодности зоны для разных типов модулей
   * @param {number} zoneId - ID зоны
   * @returns {Promise<Object>} данные о пригодности зоны
   */
  getZoneSuitability(zoneId) {
    return fetchAPI(`/area/${zoneId}/suitability`);
  }
};

export default areaAPI;