// API сервис для взаимодействия с бэкендом
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

/**
 * API для работы с модулями
 */
export const moduleAPI = {
  /**
   * Получение оптимальности модулей
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} данные об оптимальности модулей
   */
  getOptimality(userId) {
    return fetchAPI(`/module/${userId}`);
  },
  
  /**
   * Получение всех доступных типов модулей
   * @returns {Promise<Object>} данные о доступных типах модулей
   */
  getModuleTypes() {
    // Используем прокси Vite для обхода проблем с CORS
    return fetchAPI('/module-types')
    .catch(error => {
      console.error('Ошибка при получении типов модулей:', error);
      // Возвращаем статические данные для резервного варианта
      return {
        moduleTypes: [
          { id: 0, name: 'residential_complex_2x1', isLivingModule: true, cost: 9500, peopleRequired: 0 },
          { id: 1, name: 'residential_complex_1x2', isLivingModule: true, cost: 9500, peopleRequired: 0 },
          { id: 2, name: 'live_admin_module', isLivingModule: true, cost: 16000, peopleRequired: 2 },
          { id: 11, name: 'admin_module', isLivingModule: false, cost: 16000, peopleRequired: 2 },
          { id: 4, name: 'medical_module', isLivingModule: true, cost: 5000, peopleRequired: 1 },
          { id: 3, name: 'sport_module', isLivingModule: true, cost: 5000, peopleRequired: 0 },
          { id: 6, name: 'p_research_module', isLivingModule: true, cost: 5000, peopleRequired: 1 },
          { id: 7, name: 'm_research_module', isLivingModule: true, cost: 5000, peopleRequired: 1 },
          { id: 8, name: 't_research_module', isLivingModule: true, cost: 5000, peopleRequired: 1 },
          { id: 9, name: 'ter_research_module', isLivingModule: true, cost: 5000, peopleRequired: 1 },
          { id: 5, name: 'plantation', isLivingModule: true, cost: 42000, peopleRequired: 3 },
          { id: 10, name: 'hallway', isLivingModule: true, cost: 3500, peopleRequired: 0 },
          { id: 12, name: 'solar_power_plant', isLivingModule: false, cost: 900, peopleRequired: 0 },
          { id: 21, name: 'mining_base', isLivingModule: false, cost: 20000, peopleRequired: 1 },
          { id: 18, name: 'manufacture', isLivingModule: false, cost: 4200, peopleRequired: 1 },
          { id: 19, name: 'fuel_manufacture', isLivingModule: false, cost: 4200, peopleRequired: 1 },
          { id: 22, name: 'food_warehouse', isLivingModule: false, cost: 14000, peopleRequired: 0 },
          { id: 23, name: 'gases_warehouse', isLivingModule: false, cost: 14000, peopleRequired: 0 },
          { id: 24, name: 'fuel_warehouse', isLivingModule: false, cost: 14000, peopleRequired: 0 },
          { id: 25, name: 'material_warehouse', isLivingModule: false, cost: 14000, peopleRequired: 0 },
          { id: 16, name: 'waste_center', isLivingModule: false, cost: 15000, peopleRequired: 1 },
          { id: 17, name: 'bio_waste_center', isLivingModule: false, cost: 15000, peopleRequired: 1 },
          { id: 13, name: 'repair_module', isLivingModule: false, cost: 15000, peopleRequired: 2 },
          { id: 15, name: 'communication_tower', isLivingModule: false, cost: 1000, peopleRequired: 0 },
          { id: 20, name: 'telescope', isLivingModule: false, cost: 30000, peopleRequired: 0 },
          { id: 14, name: 'cosmodrome', isLivingModule: false, cost: 900, peopleRequired: 2 }
        ]
      };
    });
  },
  
  /**
   * Создание модуля
   * @param {Object} moduleData - данные о создаваемом модуле
   * @returns {Promise<number>} статус создания модуля
   */
  createModule(moduleData) {
    // Проверяем наличие всех обязательных полей
    if (!moduleData.id_user) {
      console.error('Ошибка: id_user не указан');
      return Promise.reject(new Error('ID пользователя обязателен'));
    }
    
    if (!moduleData.module_type) {
      console.error('Ошибка: module_type не указан');
      return Promise.reject(new Error('Тип модуля обязателен'));
    }
    
    if (moduleData.x === null || moduleData.x === undefined) {
      console.error('Ошибка: координата x не указана');
      return Promise.reject(new Error('Координата X обязательна'));
    }
    
    if (moduleData.y === null || moduleData.y === undefined) {
      console.error('Ошибка: координата y не указана');
      return Promise.reject(new Error('Координата Y обязательна'));
    }
    /* бэк
    // Проверка космодрома на соответствие требованиям рельефа
    if (moduleData.module_type === 22) { // Космодром
      console.log('Проверка требований к рельефу для космодрома');
      
      // Дополнительно проверяем возможность размещения космодрома
      return this.checkCosmodromeRequirements(moduleData)
        .then(isValid => {
          if (!isValid) {
            return Promise.reject(new Error('Космодром не может быть размещен в этой зоне. Требуется более ровная поверхность.'));
          }
          
          // Логирование данных для отладки
          console.log('Отправка запроса на создание модуля с данными:', moduleData);
          
          return fetchAPI('/module', {
            method: 'POST',
            body: JSON.stringify(moduleData),
          });
        })
        .catch(error => {
          console.error('Ошибка при создании модуля через API:', error);
          return Promise.reject(error);
        });
    }*/
    
    // Логирование данных для отладки
    console.log('Отправка запроса на создание модуля с данными:', moduleData);
    
    return fetchAPI('/module', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    }).catch(error => {
      console.error('Ошибка при создании модуля через API:', error);
      return Promise.reject(new Error('Не удалось создать модуль'));
    });
  },
  
  /**
   * Проверка требований к космодрому
   * @param {Object} moduleData - данные о модуле космодрома
   * @returns {Promise<boolean>} возможность размещения
   */
  checkCosmodromeRequirements(moduleData) {
    return fetchAPI(`/area/${moduleData.id_zone}/terrain/${moduleData.x}/${moduleData.y}`)
      .then(terrainData => {
        // Проверка требований к рельефу для космодрома
        const maxSlope = 2.5; // максимальный уклон для космодрома
        const minArea = 100; // минимальная площадь ровной поверхности
        
        return terrainData.slope <= maxSlope && terrainData.flatArea >= minArea;
      })
      .catch(error => {
        console.error('Ошибка при проверке требований к космодрому:', error);
        return false;
      });
  },
  
  /**
   * Удаление модуля
   * @param {number} userId - ID пользователя
   * @param {number} moduleId - ID модуля
   * @returns {Promise<void>}
   */
  deleteModule(userId, moduleId) {
    return fetchAPI(`/module/${userId}?id=${moduleId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Проверка места для размещения модуля
   * @param {Object} placeData - данные о проверяемом размещении
   * @returns {Promise<Object>} результаты проверки
   */
  checkPlacement(placeData) {
    // Проверяем, что id_zone не null и не undefined
    if (placeData.id_zone === null || placeData.id_zone === undefined) {
      // Устанавливаем id_zone = 1 по умолчанию, если он не указан
      placeData.id_zone = 1;
    }
    
    // Другие проверки для гарантированной валидности данных
    if (!placeData.id_user) {
      throw new Error('ID пользователя обязателен');
    }
    
    if (!placeData.module_type) {
      throw new Error('Тип модуля обязателен');
    }

    // Преобразование координат: z в бэкенде соответствует y
    const transformedData = { ...placeData };
    
    // Если есть z и нет y, используем z в качестве y для backend
    if (placeData.z !== undefined && placeData.y === undefined) {
      transformedData.y = placeData.z;
      delete transformedData.z;  // Удаляем z, так как бэкенд не ожидает этот параметр
    }
    
    // Выводим в консоль информацию о запросе для отладки
    console.log('checkPlacement data:', transformedData);
    console.log('Отправка запроса по адресу:', `${API_BASE_URL}/check`);
    
    return fetchAPI('/check', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    }).catch(error => {
      console.error('Ошибка при проверке размещения:', error);
      console.error('Запрос был отправлен с данными:', transformedData);
      return Promise.reject(error);
    });
  },
  
  /**
   * Получение модулей пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} список модулей
   */
  getUserModules(userId) {
    return fetchAPI(`/modules/${userId}`);
  },
  
  /**
   * Получение данных о производстве и потреблении ресурсов модулем
   * @param {number} moduleId - ID модуля
   * @returns {Promise<Object>} данные о производстве/потреблении
   */
  getModuleResourceData(moduleId) {
    return fetchAPI(`/module/resources/${moduleId}`);
  }
};

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

// Экспортируем все API
export default {
  user: userAPI,
  colony: colonyAPI,
  module: moduleAPI,
  link: linkAPI,
  game: gameAPI,
  area: areaAPI,
  lunarCoordinates: lunarCoordinatesAPI, // Добавляем новый API
};