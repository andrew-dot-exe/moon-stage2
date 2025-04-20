CREATE DATABASE IF NOT EXISTS moon;
-- Переход в эту базу
DROP TABLE IF EXISTS link CASCADE;
DROP TABLE IF EXISTS resource CASCADE;
DROP TABLE IF EXISTS module CASCADE;
DROP TABLE IF EXISTS module_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(16) NOT NULL,
    current_day BIGINT,
    days_before_delivery INTEGER,
    live BOOLEAN
);

CREATE TABLE module(
    id BIGSERIAL PRIMARY KEY,
    id_user BIGINT REFERENCES users(id) NOT NULL,
    id_zone INTEGER NOT NULL,
    module_type INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL
);

CREATE TABLE module_types(
    id INTEGER PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    category VARCHAR(32) NOT NULL, -- 'habitat', 'technological', etc.
    size_x INTEGER NOT NULL DEFAULT 1,
    size_y INTEGER NOT NULL DEFAULT 1,
    build_cost BIGINT NOT NULL DEFAULT 1000,
    maintenance_cost BIGINT NOT NULL DEFAULT 100,
    max_capacity INTEGER DEFAULT 0, -- For habitats
    energy_production BIGINT DEFAULT 0,
    energy_consumption BIGINT DEFAULT 0,
    oxygen_production BIGINT DEFAULT 0,
    oxygen_consumption BIGINT DEFAULT 0,
    water_production BIGINT DEFAULT 0,
    water_consumption BIGINT DEFAULT 0,
    food_production BIGINT DEFAULT 0,
    food_consumption BIGINT DEFAULT 0,
    waste_production BIGINT DEFAULT 0,
    waste_consumption BIGINT DEFAULT 0
);

CREATE TABLE resource(
    resource_type INTEGER,
    id_user BIGINT REFERENCES users(id),
    count BIGINT,
    production BIGINT,
    consumption BIGINT, -- больше 0
    sum_production BIGINT,
    sum_consumption BIGINT, -- больше 0
    PRIMARY KEY(resource_type, id_user)
);

CREATE TABLE link(
    type INTEGER, -- 0 - провод, 1 - дорога
    id_user BIGINT REFERENCES users(id),
    id_zone1 INTEGER,
    id_zone2 INTEGER,
    PRIMARY KEY(type, id_user, id_zone1, id_zone2)
);

-- Заполнение таблицы типов модулей
INSERT INTO module_types (id, name, description, category, size_x, size_y, build_cost, 
                         energy_production, energy_consumption, oxygen_production, oxygen_consumption,
                         water_production, water_consumption, food_production, food_consumption,
                         waste_production, waste_consumption, max_capacity)
VALUES 
-- Жилые модули (1-9)
(1, 'LIVE_MODULE_2X1', 'Жилой модуль 2x1', 'habitat', 2, 1, 5000, 0, 50, 0, 30, 0, 20, 0, 15, 10, 0, 8),
(2, 'ADMINISTRATIVE_MODULE', 'Административный модуль', 'habitat', 1, 1, 4000, 0, 40, 0, 15, 0, 10, 0, 5, 5, 0, 4),
(3, 'MEDICAL_MODULE', 'Медицинский модуль', 'habitat', 1, 1, 4500, 0, 60, 0, 25, 0, 30, 0, 5, 15, 5, 6),
(4, 'SPORT_MODULE', 'Спортивный модуль', 'habitat', 1, 1, 3500, 0, 80, 0, 40, 0, 40, 0, 10, 5, 0, 10),
(5, 'RESEARCH_MODULE', 'Исследовательский модуль', 'habitat', 1, 1, 6000, 0, 100, 0, 20, 0, 15, 0, 10, 20, 0, 6),

-- Технологические модули (10-19)
(10, 'SOLAR_POWER_PLANT', 'Солнечная электростанция', 'technological', 2, 2, 8000, 500, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0),
(11, 'MINING_BASE', 'Добывающая база', 'technological', 2, 1, 7000, 0, 200, 0, 0, 100, 0, 0, 0, 30, 0, 0),
(12, 'MANUFACTURE', 'Производственный комплекс', 'technological', 2, 2, 10000, 0, 300, 0, 50, 0, 50, 0, 20, 80, 0, 0),
(13, 'WAREHOUSE', 'Склад ресурсов', 'technological', 1, 1, 3000, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, 'WASTE_CENTER', 'Центр переработки отходов', 'technological', 1, 1, 5000, 0, 150, 0, 0, 0, 0, 0, 0, 0, 100, 0),
(15, 'PLANTATION', 'Плантация', 'technological', 2, 1, 6000, 0, 100, 0, 0, 0, 50, 200, 0, 20, 0, 0),
(16, 'REPAIR_MODULE', 'Ремонтный модуль', 'technological', 1, 1, 4000, 0, 80, 0, 10, 0, 15, 0, 0, 10, 0, 0),
(17, 'COMMUNICATION_TOWER', 'Башня связи', 'technological', 1, 1, 4500, 0, 120, 0, 0, 0, 0, 0, 0, 5, 0, 0),
(18, 'TELESCOPE', 'Телескоп', 'technological', 1, 1, 7500, 0, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, 'COSMODROME', 'Космодром', 'technological', 3, 3, 20000, 0, 500, 0, 100, 0, 100, 0, 50, 100, 0, 0);

-- Заполняем таблицу ресурсов по умолчанию для новых пользователей
-- Создаем функцию, которая будет автоматически добавлять ресурсы для новых пользователей
CREATE OR REPLACE FUNCTION setup_new_user_resources()
RETURNS TRIGGER AS $$
BEGIN
    -- Добавляем базовые ресурсы для нового пользователя
    INSERT INTO resource (resource_type, id_user, count, production, consumption, sum_production, sum_consumption)
    VALUES 
    (1, NEW.id, 1000, 0, 0, 0, 0),  -- Вода
    (2, NEW.id, 1000, 0, 0, 0, 0),  -- Кислород
    (3, NEW.id, 1000, 0, 0, 0, 0),  -- Еда
    (4, NEW.id, 2000, 0, 0, 0, 0),  -- Энергия
    (5, NEW.id, 0, 0, 0, 0, 0),     -- Отходы
    (6, NEW.id, 10000, 0, 0, 0, 0), -- Строительные материалы
    (7, NEW.id, 1000, 0, 0, 0, 0),  -- Топливо
    (8, NEW.id, 0, 0, 0, 0, 0);     -- CO2
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который будет вызывать функцию при создании нового пользователя
DROP TRIGGER IF EXISTS setup_resources_for_new_user ON users;
CREATE TRIGGER setup_resources_for_new_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION setup_new_user_resources();

-- Создаем представление для удобного получения данных о модулях с их характеристиками
DROP VIEW IF EXISTS module_details;
CREATE VIEW module_details AS
SELECT 
    m.id,
    m.id_user,
    m.id_zone,
    m.module_type,
    m.x,
    m.y,
    mt.name,
    mt.category,
    mt.size_x,
    mt.size_y,
    mt.energy_production,
    mt.energy_consumption,
    mt.oxygen_production,
    mt.oxygen_consumption,
    mt.water_production,
    mt.water_consumption,
    mt.food_production,
    mt.food_consumption,
    mt.waste_production,
    mt.waste_consumption,
    mt.max_capacity
FROM 
    module m
JOIN 
    module_types mt ON m.module_type = mt.id;

-- Функция для расчета производства и потребления ресурсов на основе модулей
CREATE OR REPLACE FUNCTION calculate_user_resources(user_id BIGINT)
RETURNS VOID AS $$
DECLARE
    energy_prod BIGINT := 0;
    energy_cons BIGINT := 0;
    water_prod BIGINT := 0;
    water_cons BIGINT := 0;
    oxygen_prod BIGINT := 0;
    oxygen_cons BIGINT := 0;
    food_prod BIGINT := 0;
    food_cons BIGINT := 0;
    waste_prod BIGINT := 0;
    waste_cons BIGINT := 0;
BEGIN
    -- Рассчитываем суммарное производство и потребление ресурсов на основе модулей
    SELECT 
        COALESCE(SUM(md.energy_production), 0), COALESCE(SUM(md.energy_consumption), 0),
        COALESCE(SUM(md.water_production), 0), COALESCE(SUM(md.water_consumption), 0),
        COALESCE(SUM(md.oxygen_production), 0), COALESCE(SUM(md.oxygen_consumption), 0),
        COALESCE(SUM(md.food_production), 0), COALESCE(SUM(md.food_consumption), 0),
        COALESCE(SUM(md.waste_production), 0), COALESCE(SUM(md.waste_consumption), 0)
    INTO 
        energy_prod, energy_cons,
        water_prod, water_cons,
        oxygen_prod, oxygen_cons,
        food_prod, food_cons,
        waste_prod, waste_cons
    FROM 
        module_details md
    WHERE 
        md.id_user = user_id;

    -- Обновляем таблицу ресурсов
    -- Энергия (тип 4)
    UPDATE resource SET 
        production = energy_prod,
        consumption = energy_cons,
        sum_production = energy_prod,
        sum_consumption = energy_cons
    WHERE resource_type = 4 AND id_user = user_id;
    
    -- Вода (тип 1)
    UPDATE resource SET 
        production = water_prod,
        consumption = water_cons,
        sum_production = water_prod,
        sum_consumption = water_cons
    WHERE resource_type = 1 AND id_user = user_id;
    
    -- Кислород (тип 2)
    UPDATE resource SET 
        production = oxygen_prod,
        consumption = oxygen_cons,
        sum_production = oxygen_prod,
        sum_consumption = oxygen_cons
    WHERE resource_type = 2 AND id_user = user_id;
    
    -- Еда (тип 3)
    UPDATE resource SET 
        production = food_prod,
        consumption = food_cons,
        sum_production = food_prod,
        sum_consumption = food_cons
    WHERE resource_type = 3 AND id_user = user_id;
    
    -- Отходы (тип 5)
    UPDATE resource SET 
        production = waste_prod,
        consumption = waste_cons,
        sum_production = waste_prod,
        sum_consumption = waste_cons
    WHERE resource_type = 5 AND id_user = user_id;
END;
$$ LANGUAGE plpgsql;

-- Триггер для пересчета ресурсов при добавлении или удалении модуля
CREATE OR REPLACE FUNCTION update_resources_on_module_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM calculate_user_resources(NEW.id_user);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM calculate_user_resources(OLD.id_user);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS module_change_update_resources ON module;
CREATE TRIGGER module_change_update_resources
AFTER INSERT OR DELETE ON module
FOR EACH ROW
EXECUTE FUNCTION update_resources_on_module_change();

-- Создаем таблицу для зон
CREATE TABLE areas (
    id INTEGER PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    description TEXT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    size_x INTEGER NOT NULL DEFAULT 10,
    size_y INTEGER NOT NULL DEFAULT 10,
    terrain_type VARCHAR(32) NOT NULL DEFAULT 'plains'
);

-- Заполняем базовые зоны
INSERT INTO areas (id, name, type, description, x, y, terrain_type)
VALUES
(1, 'Равнина Покоя', 'plains', 'Плоская равнина, идеальная для строительства базы', 0, 0, 'plains'),
(2, 'Горная станция', 'heights', 'Гористая местность с доступом к минеральным ресурсам', 15, 5, 'heights'),
(3, 'Кратер Тяготения', 'lowlands', 'Низина с доступом к подземным водным ресурсам', -10, -8, 'lowlands'),
(4, 'Плато Восхода', 'plains', 'Плоскогорье с хорошей видимостью', 8, -12, 'plains'),
(5, 'Разлом Гагарина', 'heights', 'Глубокий каньон с редкими минералами', -5, 15, 'heights');