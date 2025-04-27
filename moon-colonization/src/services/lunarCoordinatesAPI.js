// API для работы с лунными координатами
import fetchAPI from './apiClient';

/**
 * API для работы с лунными координатами
 */
export const lunarCoordinatesAPI = {
  /**
   * Получение реальных лунных координат для игровых координат
   * @param {number} zoneId - ID зоны
   * @param {number} x - координата X
   * @param {number} y - координата Y (на фронтенде это Z)
   * @returns {Promise<Object>} данные о лунных координатах
   */
  getLunarCoordinates(zoneId, x, y) {
    return fetchAPI(`/lunar-coordinates/${zoneId}/${x}/${y}`);
  }
};

export default lunarCoordinatesAPI;