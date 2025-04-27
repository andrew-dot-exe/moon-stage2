// Индексный файл для экспорта всех API сервисов
import userAPI from './userAPI';
import colonyAPI from './colonyAPI';
import moduleAPI from './moduleAPI';
import linkAPI from './linkAPI';
import gameAPI from './gameAPI';
import areaAPI from './areaAPI';
import lunarCoordinatesAPI from './lunarCoordinatesAPI';

// Экспортируем все API сервисы
export {
  userAPI,
  colonyAPI,
  moduleAPI,
  linkAPI,
  gameAPI,
  areaAPI,
  lunarCoordinatesAPI
};

// Экспортируем по умолчанию объект со всеми API для удобства использования
export default {
  user: userAPI,
  colony: colonyAPI,
  module: moduleAPI,
  link: linkAPI,
  game: gameAPI,
  area: areaAPI,
  lunarCoordinates: lunarCoordinatesAPI,
};