-- ============================================
-- TIMBERSTOCK - Datos Iniciales (Seed)
-- ============================================
\c db_timberstock;

-- ============================================
-- STACK_CONFIGURATIONS
-- ============================================
INSERT INTO stack_configurations (name, width, height)
VALUES ('Stack 11x34', 11, 34),
       ('Stack 15x14', 15, 14),
       ('Stack 9x8', 9, 8),
       ('Stack 14x34', 14, 34),
       ('Stack 10x10', 10, 10),
       ('Stack 10x26', 10, 26),
       ('Stack 14x18', 14, 18),
       ('Stack 16x20', 16, 20),
       ('Stack 12x14', 12, 14),
       ('Stack 13x12', 13, 12),
       ('Stack 10x8', 10, 8),
       ('Stack 8x8', 8, 8),
       ('Stack 6x6', 6, 6),
       ('Stack 4x4', 4, 4);

-- ============================================
-- DIMENSIONS (con stack_config_id asociado)
-- ============================================
INSERT INTO dimensions (thickness, width, length, stack_config_id)
SELECT d.thickness, d.width, d.length, sc.id
FROM (VALUES (18, 90, 3600),
             (45, 70, 3600),
             (90, 100, 3600),
             (18, 70, 3600),
             (70, 90, 3600),
             (24, 100, 3600),
             (50, 50, 3600),
             (20, 98, 3600),
             (40, 90, 3600),
             (50, 75, 3600),
             (90, 90, 3600)) AS d(thickness, width, length)
          JOIN stack_configurations sc ON (
    (d.thickness = 18 AND d.width = 90 AND sc.width = 11 AND sc.height = 34) OR
    (d.thickness = 45 AND d.width = 70 AND sc.width = 15 AND sc.height = 14) OR
    (d.thickness = 90 AND d.width = 100 AND sc.width = 9 AND sc.height = 8) OR
    (d.thickness = 18 AND d.width = 70 AND sc.width = 14 AND sc.height = 34) OR
    (d.thickness = 70 AND d.width = 90 AND sc.width = 10 AND sc.height = 10) OR
    (d.thickness = 24 AND d.width = 100 AND sc.width = 10 AND sc.height = 26) OR
    (d.thickness = 50 AND d.width = 50 AND sc.width = 14 AND sc.height = 18) OR
    (d.thickness = 20 AND d.width = 98 AND sc.width = 16 AND sc.height = 20) OR
    (d.thickness = 40 AND d.width = 90 AND sc.width = 12 AND sc.height = 14) OR
    (d.thickness = 50 AND d.width = 75 AND sc.width = 13 AND sc.height = 12) OR
    (d.thickness = 90 AND d.width = 90 AND sc.width = 10 AND sc.height = 8)
    );

-- ============================================
-- INVENTORY_PACKAGES (ejemplo)
-- ============================================
INSERT INTO inventory_packages (dimension_id, stack_config_id, unit_count, cubic_meters, production_date, status)
VALUES (
    (SELECT id FROM dimensions WHERE thickness = 18 AND width = 90 AND length = 3600),
    (SELECT id FROM stack_configurations WHERE width = 11 AND height = 34),
    374,
    2.18,
    '2026-04-27',
    'disponible'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Seed cargado correctamente' AS status;

SELECT COUNT(*) AS total_stack_configs
FROM stack_configurations;
SELECT COUNT(*) AS total_dimensions
FROM dimensions;
SELECT COUNT(*) AS total_packages
FROM inventory_packages;

-- Listar dimensiones con su config asociada
SELECT d.id, d.thickness, d.width, d.length, sc.name AS stack_config, sc.width, sc.height
FROM dimensions d
         JOIN stack_configurations sc ON d.stack_config_id = sc.id
ORDER BY d.thickness, d.width;