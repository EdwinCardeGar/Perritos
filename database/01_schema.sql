CREATE DATABASE IF NOT EXISTS registro_perritos
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE registro_perritos;

CREATE TABLE IF NOT EXISTS razas (
    id_raza INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_razas_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS colores (
    id_color INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_colores_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS perritos (
    id_perrito BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    id_raza INT UNSIGNED NULL,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT NULL,

    id_color_principal INT UNSIGNED NOT NULL,

    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,

    foto VARCHAR(255) NOT NULL,

    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Clave utilizada para garantizar idempotencia
    clave_idempotencia CHAR(36) NOT NULL,

    CONSTRAINT uq_perritos_idempotencia
        UNIQUE (clave_idempotencia),

    CONSTRAINT fk_perritos_raza
        FOREIGN KEY (id_raza)
        REFERENCES razas(id_raza),

    CONSTRAINT fk_perritos_color_principal
        FOREIGN KEY (id_color_principal)
        REFERENCES colores(id_color),

    CONSTRAINT chk_perritos_nombre
        CHECK (CHAR_LENGTH(TRIM(nombre)) > 0),

    CONSTRAINT chk_perritos_latitud
        CHECK (latitud BETWEEN -90 AND 90),

    CONSTRAINT chk_perritos_longitud
        CHECK (longitud BETWEEN -180 AND 180)
);

CREATE TABLE IF NOT EXISTS perrito_colores (
    id_perrito BIGINT UNSIGNED NOT NULL,
    id_color INT UNSIGNED NOT NULL,

    PRIMARY KEY (id_perrito, id_color),

    CONSTRAINT fk_perrito_colores_perrito
        FOREIGN KEY (id_perrito)
        REFERENCES perritos(id_perrito)
        ON DELETE CASCADE,

    CONSTRAINT fk_perrito_colores_color
        FOREIGN KEY (id_color)
        REFERENCES colores(id_color)
);

CREATE INDEX idx_perritos_raza
    ON perritos(id_raza);

CREATE INDEX idx_perritos_color_principal
    ON perritos(id_color_principal);

CREATE INDEX idx_perritos_fecha
    ON perritos(fecha_registro);

CREATE INDEX idx_perritos_ubicacion
    ON perritos(latitud, longitud);

CREATE INDEX idx_perrito_colores_color
    ON perrito_colores(id_color);