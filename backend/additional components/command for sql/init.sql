CREATE DATABASE moon;
-- Переход в эту базу
--DROP TABLE users CASCADE;
CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(16) NOT NULL,
    current_day BIGINT,
    days_before_delivery INTEGER,
    live BOOLEAN DEFAULT TRUE,
);

--DROP TABLE module CASCADE;
CREATE TABLE module(
    id BIGSERIAL PRIMARY KEY,
    id_user BIGINT REFERENCES users(id) NOT NULL,
    id_zone INTEGER NOT NULL,
    module_type INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL
);

--DROP TABLE resource CASCADE;
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


--DROP TABLE link CASCADE;
CREATE TABLE link(
    type INTEGER, -- 0 - провод, 1 - дорога
    id_user BIGINT REFERENCES users(id),
    id_zone1 INTEGER,
    id_zone2 INTEGER,
    PRIMARY KEY(type, id_user, id_zone1, id_zone2)
);