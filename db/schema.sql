-- ============================================
-- TIMBERSTOCK - Schema de Base de Datos
-- ============================================

CREATE DATABASE db_timberstock;
\c db_timberstock;

-- ============================================
-- TABLA: STACK_CONFIGURATIONS
-- ============================================
CREATE TABLE stack_configurations (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    width      INTEGER NOT NULL CHECK (width > 0),
    height     INTEGER NOT NULL CHECK (height > 0),
    is_active  BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name),
    UNIQUE (width, height)
);

-- ============================================
-- TABLA: DIMENSIONS
-- ============================================
CREATE TABLE dimensions (
    id              SERIAL PRIMARY KEY,
    thickness       DECIMAL(7, 2) NOT NULL CHECK (thickness > 0),
    width           DECIMAL(7, 2) NOT NULL CHECK (width > 0),
    length          DECIMAL(7, 2) NOT NULL CHECK (length > 0),
    stack_config_id INTEGER NOT NULL REFERENCES stack_configurations (id),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (thickness, width, length)
);

-- ============================================
-- TABLA: INVENTORY_PACKAGES
-- ============================================
CREATE TABLE inventory_packages (
    id              SERIAL PRIMARY KEY,
    dimension_id    INTEGER NOT NULL REFERENCES dimensions (id),
    stack_config_id INTEGER NOT NULL REFERENCES stack_configurations (id),
    unit_count      INTEGER NOT NULL CHECK (unit_count > 0),
    cubic_meters    DECIMAL(10, 4) NOT NULL CHECK (cubic_meters >= 0),
    production_date DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'disponible',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('disponible', 'reservado', 'vendido', 'eliminado'))
);

-- ============================================
-- TABLA: DAILY_PRODUCTION_LOG
-- ============================================
CREATE TABLE daily_production_log (
    id                  SERIAL PRIMARY KEY,
    date                DATE NOT NULL UNIQUE,
    total_packages      INTEGER DEFAULT 0,
    total_cubic_meters  DECIMAL(12, 4) DEFAULT 0,
    total_units         INTEGER DEFAULT 0,
    dimension_breakdown JSONB,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_stack_configs_active ON stack_configurations (is_active);
CREATE INDEX idx_dimensions_active ON dimensions (is_active);
CREATE INDEX idx_dimensions_stack_config ON dimensions (stack_config_id);
CREATE INDEX idx_inventory_status ON inventory_packages (status);
CREATE INDEX idx_inventory_date ON inventory_packages (production_date);
CREATE INDEX idx_inventory_dimension ON inventory_packages (dimension_id);
CREATE INDEX idx_inventory_stack_config ON inventory_packages (stack_config_id);
CREATE INDEX idx_daily_log_date ON daily_production_log (date);

-- ============================================
-- VISTAS
-- ============================================
CREATE VIEW v_inventory_full AS
SELECT ip.id,
       ip.cubic_meters,
       ip.unit_count,
       ip.production_date,
       ip.status,
       ip.notes,
       ip.created_at,
       ip.updated_at,
       d.thickness,
       d.width,
       d.length,
       d.id AS dimension_id,
       d.stack_config_id AS dimension_default_config_id,
       sc.id AS stack_config_id,
       sc.name   AS stack_config_name,
       sc.width  AS stack_width,
       sc.height AS stack_height,
       CASE
           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
           ELSE 'especial'
       END AS config_type
FROM inventory_packages ip
JOIN dimensions d ON ip.dimension_id = d.id
JOIN stack_configurations sc ON ip.stack_config_id = sc.id;

CREATE VIEW v_stock_consolidated AS
SELECT d.thickness,
       d.width,
       d.length,
       ip.status,
       sc.width  AS stack_width,
       sc.height AS stack_height,
       CASE
           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
           ELSE 'especial'
       END AS config_type,
       COUNT(ip.id)         AS total_packages,
       SUM(ip.cubic_meters) AS total_m3,
       SUM(ip.unit_count)   AS total_units
FROM inventory_packages ip
JOIN dimensions d ON ip.dimension_id = d.id
JOIN stack_configurations sc ON ip.stack_config_id = sc.id
WHERE ip.status != 'eliminado'
GROUP BY d.thickness, d.width, d.length, ip.status, sc.width, sc.height, ip.stack_config_id, d.stack_config_id
ORDER BY d.thickness, d.width, d.length, ip.status;

SELECT 'Schema creado correctamente' AS status;