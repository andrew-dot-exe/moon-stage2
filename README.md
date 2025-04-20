# Колонизация Луны

Проект "Колонизация Луны" представляет собой симуляцию построения лунной колонии с использованием различных модулей и ресурсов. Проект состоит из frontend-части (Vue.js) и backend-части (Spring Boot), которые взаимодействуют через REST API.

## Требования

Для запуска проекта вам понадобится:

- Java 17 или новее
- Node.js 16 или новее
- npm 8 или новее
- PostgreSQL 12 или новее
- Maven 3.8 или новее

## Структура проекта

- `moon-colonization/` - Frontend часть проекта (Vue.js)
- `backend/` - Backend часть проекта (Spring Boot)
- `moon-site/` - Сайт проекта

## Настройка базы данных

1. Установите PostgreSQL, если он еще не установлен.

2. Создайте новую базу данных:

```sh
psql -U postgres
CREATE DATABASE moon;
\q
```

3. Инициализируйте базу данных с помощью скрипта:

```sh
psql -U postgres -d moon -f backend/additional\ components/command\ for\ sql/init.sql
```

## Запуск Backend

1. Перейдите в директорию backend:

```sh
cd backend
```

2. Настройте подключение к базе данных в файле `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/moon
spring.datasource.username=postgres
spring.datasource.password=ваш_пароль
spring.datasource.driver-class-name=org.postgresql.Driver
```

3. Соберите и запустите backend:

```sh
mvn clean install
mvn spring-boot:run
```

Backend будет запущен по адресу: `http://localhost:8080`

## Запуск Frontend

1. Перейдите в директорию frontend:

```sh
cd moon-colonization
```

2. Установите зависимости:

```sh
npm install
```

3. Запустите development сервер:

```sh
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

## Работа с проектом

После запуска backend и frontend частей, вы можете открыть браузер и перейти на `http://localhost:5173` для начала работы с приложением.

### Основные функции:

1. Регистрация и авторизация пользователя
2. Выбор зоны для колонизации
3. Строительство модулей различных типов:
   - Жилые модули
   - Административные модули
   - Технологические модули
   - Инфраструктурные модули
4. Управление ресурсами:
   - Вода (H2O)
   - Кислород (O2)
   - Углекислый газ (CO2)
   - Пища
   - Материалы
   - Отходы
   - Электроэнергия
5. Создание соединений между модулями и зонами
6. Мониторинг состояния колонии и производства ресурсов

## Разработка

### Frontend

Проект использует:
- Vue 3 с Composition API
- Vite в качестве сборщика
- Three.js для 3D-визуализации

### Backend

Проект использует:
- Spring Boot
- JPA/Hibernate для работы с базой данных
- REST API для взаимодействия с frontend

## Деплой

### Backend

Для сборки JAR-файла:

```sh
cd backend
mvn clean package
```

Собранный JAR-файл будет находиться в директории `target/`.

### Frontend приложения "Колонизация Луны"

Для сборки оптимизированной версии:

```sh
cd moon-colonization
npm run build
```

Собранные файлы будут находиться в директории `dist/`.

### Сайт проекта

Для запуска сайта проекта:

```sh
cd moon-site
npm install
npm run dev
```

Сайт будет доступен по адресу: `http://localhost:5174` (или следующему свободному порту).

Для сборки оптимизированной версии сайта:

```sh
cd moon-site
npm run build
```

Собранные файлы также будут находиться в директории `dist/`.

## Лицензия

MIT
