// API для работы с модулями
import fetchAPI from './apiClient';

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
          { id: 1, name: 'residential_complex_2x1', isLivingModule: true, cost: 9500, peopleRequired: 5 },
          { id: 2, name: 'admin_module', isLivingModule: false, cost: 16000, peopleRequired: 3 },
          { id: 3, name: 'medical_module', isLivingModule: false, cost: 12000, peopleRequired: 4 },
          { id: 4, name: 'sport_module', isLivingModule: false, cost: 5000, peopleRequired: 2 },
          { id: 5, name: 'research_module', isLivingModule: false, cost: 14000, peopleRequired: 4 },
          { id: 6, name: 'plantation', isLivingModule: false, cost: 8000, peopleRequired: 3 },
          { id: 10, name: 'solar_power_plant', isLivingModule: false, cost: 7500, peopleRequired: 1 },
          { id: 11, name: 'mining_base', isLivingModule: false, cost: 25000, peopleRequired: 5 },
          { id: 12, name: 'manufacture', isLivingModule: false, cost: 20000, peopleRequired: 4 },
          { id: 13, name: 'warehouse', isLivingModule: false, cost: 6000, peopleRequired: 1 },
          { id: 14, name: 'waste_center', isLivingModule: false, cost: 8000, peopleRequired: 2 },
          { id: 15, name: 'repair_module', isLivingModule: false, cost: 10000, peopleRequired: 3 },
          { id: 20, name: 'communication_tower', isLivingModule: false, cost: 12000, peopleRequired: 2 },
          { id: 21, name: 'telescope', isLivingModule: false, cost: 18000, peopleRequired: 3 },
          { id: 22, name: 'cosmodrome', isLivingModule: false, cost: 50000, peopleRequired: 8, terrainRequirements: { minAreaSize: 100, maxSlope: 2.5 } }
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
    }
    
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
    console.log('Отправка запроса по адресу:', `/api/check`);
    
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

export default moduleAPI;