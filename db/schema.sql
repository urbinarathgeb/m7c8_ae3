-- ============================================
-- TIMBERSTOCK - Schema de Base de Datos
-- ============================================

CREATE DATABASE db_timberstock;
\c db_timberstock;

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: ROLES
-- ============================================
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: PERMISSIONS
-- ============================================
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: ROLE_PERMISSIONS (Pivote)
-- ============================================
CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- TABLA: USERS
-- ============================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role_id       UUID NOT NULL REFERENCES roles (id),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: STACK_CONFIGURATIONS (debe crearse antes que dimensions)
-- ============================================
CREATE TABLE stack_configurations (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(100) NOT NULL,
    width      INTEGER NOT NULL,
    height     INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users (id),
    UNIQUE (name),
    UNIQUE (width, height)
);

-- ============================================
-- TABLA: DIMENSIONS
-- ============================================
CREATE TABLE dimensions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thickness       DECIMAL(7, 2) NOT NULL,
    width           DECIMAL(7, 2) NOT NULL,
    length          DECIMAL(7, 2) NOT NULL,
    stack_config_id UUID REFERENCES stack_configurations (id),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users (id),
    UNIQUE (thickness, width, length)
);

-- ============================================
-- TABLA: INVENTORY_PACKAGES
-- ============================================
CREATE TABLE inventory_packages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_id    UUID NOT NULL REFERENCES dimensions (id),
    stack_config_id UUID NOT NULL REFERENCES stack_configurations (id),
    unit_count      INTEGER NOT NULL,
    cubic_meters    DECIMAL(10, 4) NOT NULL,
    production_date DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'disponible',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users (id),
    CONSTRAINT valid_status CHECK (status IN ('disponible', 'reservado', 'vendido', 'eliminado'))
);

-- ============================================
-- TABLA: INVENTORY_MOVEMENTS
-- ============================================
CREATE TABLE inventory_movements (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id     UUID NOT NULL REFERENCES inventory_packages (id) ON DELETE CASCADE,
    action         VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value      JSONB,
    changed_by     UUID REFERENCES users (id),
    changed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_action CHECK (action IN ('created', 'status_changed', 'updated', 'deleted'))
);

-- ============================================
-- TABLA: DAILY_PRODUCTION_LOG
-- ============================================
CREATE TABLE daily_production_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE INDEX idx_users_role ON users (role_id);
CREATE INDEX idx_users_email ON users (email) WHERE is_active = true;
CREATE INDEX idx_dimensions_active ON dimensions (is_active);
CREATE INDEX idx_dimensions_stack_config ON dimensions (stack_config_id);
CREATE INDEX idx_inventory_status ON inventory_packages (status);
CREATE INDEX idx_inventory_date ON inventory_packages (production_date);
CREATE INDEX idx_inventory_dimension ON inventory_packages (dimension_id);
CREATE INDEX idx_inventory_stack_config ON inventory_packages (stack_config_id);
CREATE INDEX idx_movements_package ON inventory_movements (package_id);
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
       d.thickness,
       d.width,
       d.length,
       d.stack_config_id AS dimension_default_config_id,
       sc.name   AS stack_config_name,
       sc.width  AS stack_width,
       sc.height AS stack_height,
       CASE 
           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
           ELSE 'especial'
       END AS config_type,
       u.name    AS created_by_name,
       u.email   AS created_by_email
FROM inventory_packages ip
JOIN dimensions d ON ip.dimension_id = d.id
JOIN stack_configurations sc ON ip.stack_config_id = sc.id
LEFT JOIN users u ON ip.created_by = u.id;

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