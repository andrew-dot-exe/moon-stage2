// API клиент для выполнения базовых запросов
const API_BASE_URL = '/api';  // Используем настроенный прокси-путь вместо прямого URL

/**
 * Базовая функция для выполнения fetch-запросов
 * @param {string} endpoint - API эндпоинт
 * @param {Object} options - опции запроса
 * @returns {Promise<any>} данные ответа
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  let requestBody = null;
  
  // Устанавливаем заголовки по умолчанию
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Анализируем тело запроса, если оно есть
  if (options.body) {
    try {
      requestBody = JSON.parse(options.body);
    } catch (e) {
      requestBody = options.body;
    }
  }
  
  try {
    const response = await fetch(url, { 
      ...options,
      headers,
    });
    
    let responseData = null;
    let responseStatus = response.status;
    
    // Парсим JSON для не пустых ответов
    if (response.status !== 204) {
      try {
        responseData = await response.json();
      } catch (e) {
        // Для ответов, которые не содержат JSON
        responseData = await response.text();
        if (!responseData) responseData = null;
      }
    }
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorMessage = responseData?.message || `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Для GET-запросов с кодом 204 (No Content) возвращаем null
    if (response.status === 204) {
      return null;
    }
    
    return responseData;
  } catch (error) {
    throw error;
  }
}

export default fetchAPI;