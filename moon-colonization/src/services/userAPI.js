// API для работы с пользователями
import fetchAPI from './apiClient';

/**
 * API для работы с пользователями
 */
export const userAPI = {
  /**
   * Авторизация пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} данные пользователя и колонии
   */
  login(email, password) {
    return fetchAPI('/user', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  /**
   * Получение статистики пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} статистика пользователя
   */
  getStatistics(userId) {
    return fetchAPI(`/user/${userId}`);
  },
  
  /**
   * Регистрация нового пользователя
   * @param {Object} userData - данные пользователя
   * @returns {Promise<number>} ID созданного пользователя
   */
  register(userData) {
    return fetchAPI('/userCreate', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export default userAPI;