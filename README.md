# TimberStock API - Control de Inventario y Cubicación

API REST desarrollada con Node.js y Express para gestionar el inventario de un aserradero. Controla paquetes de madera dimensionada con cálculo automático de metros cúbicos (m³).

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación

```bash
npm install
```

## Configuración

1. Crear archivo `.env` en la raíz del proyecto:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=
PG_DATABASE=db_timberstock
PORT=3001
NODE_ENV=development
```

2. Ejecutar el script SQL:

```bash
psql -U postgres -f db/schema.sql
psql -U postgres -f db/seed.sql
```

## Ejecutar

```bash
# Desarrollo (con watch)
npm run dev

# Producción
npm start
```

---

## Endpoints API

### Stack Configurations

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stack-configs` | Listar todas las configuraciones |
| GET | `/api/stack-configs/:id` | Ver una configuración |
| POST | `/api/stack-configs` | Crear configuración |
| PUT | `/api/stack-configs/:id` | Editar configuración |
| DELETE | `/api/stack-configs/:id` | Eliminar (soft delete) |

### Dimensions

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dimensions` | Listar todas las dimensiones |
| GET | `/api/dimensions/:id` | Ver una dimensión |
| POST | `/api/dimensions` | Crear dimensión |
| PUT | `/api/dimensions/:id` | Editar dimensión |
| DELETE | `/api/dimensions/:id` | Eliminar (soft delete) |

### Inventory Packages

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inventory` | Listar inventario |
| GET | `/api/inventory/:id` | Ver un paquete |
| POST | `/api/inventory` | Crear paquete (calcula m³) |
| PUT | `/api/inventory/:id` | Editar paquete |
| DELETE | `/api/inventory/:id` | Eliminar (soft delete) |

### Stock

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stock` | Ver stock consolidado |

---

## Estructura de la Base de Datos

```
dimensions ← inventory_packages
      ↑
stack_configurations
      ↓
daily_production_log
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `stack_configurations` | Configuraciones de apilamiento (piezas por fila x columna) |
| `dimensions` | Catálogo de medidas (espesor x ancho x largo en mm) |
| `inventory_packages` | Paquetes de madera registrados |
| `daily_production_log` | Resúmenes diarios de producción |

### Vistas

| Vista | Descripción |
|-------|-------------|
| `v_inventory_full` | Inventario completo con datos de dimensión y stack |
| `v_stock_consolidated` | Stock agrupado por dimensión, status y configuración |

---

## Lógica de Negocio

### Cálculo Automático de Paquetes

Al crear un `inventory_package`:

```
unit_count = stack_config.width × stack_config.height
cubic_meters = (thickness × width × length × unit_count) / 1,000,000,000
```

### Tipos de Configuración

- **Estándar**: El paquete usa la configuración por defecto de la dimensión
- **Especial**: El paquete usa una configuración diferente a la estándar

### Estados de Paquete

- `disponible`: Disponible para venta
- `reservado`: Reservado para un cliente
- `vendido`: Ya vendido
- `eliminado`: Eliminado (soft delete)

### Integridad Referencial

**Reglas de negocio para eliminar recursos:**

| Recurso | ¿Se puede eliminar si está en uso? |
|---------|-------------------------------------|
| Stack Config | ❌ No si está asociado a una dimensión activa |
| Stack Config | ❌ No si tiene paquetes de inventario asociados |
| Dimensión | ⚠️ Sí, pero hace soft delete si tiene paquetes asociados |
| Dimensión | ✅ Sí, eliminación directa si no tiene paquetes |
| Inventory Package | ❌ Siempre soft delete (cambia status a 'eliminado') |

---

## Arquitectura

```
src/
├── config/
│   └── db.config.js           # Pool de PostgreSQL
├── controllers/
│   ├── dimensions.controller.js
│   ├── stackConfigs.controller.js
│   └── inventory.controller.js
├── services/
│   ├── query.helper.js        # Helper reutilizable para queries
│   ├── dimension.service.js
│   ├── stackConfigs.service.js
│   └── inventory.service.js
├── routes/
│   ├── dimensions.routes.js
│   ├── stackConfigs.routes.js
│   └── inventory.routes.js
├── middlewares/
│   ├── errorHandler.middleware.js  # Manejo centralizado de errores
│   └── errorSimulator.middleware.js
├── utils/
│   └── errors.js              # Clases de errores personalizadas
└── index.js
```

---

## Sistema de Errores

El proyecto implementa clases de errores personalizadas en `src/utils/errors.js`:

| Clase | Status | Uso |
|-------|--------|-----|
| `AppError` | 500 | Error base del sistema |
| `ValidationError` | 400 | Datos inválidos (incluye `errors` array) |
| `NotFoundError` | 404 | Recurso no encontrado |
| `ConflictError` | 409 | Conflicto de datos (ej: duplicado) |
| `DatabaseError` | 500 | Error de base de datos |

### Validaciones Implementadas

| Campo | Validación |
|-------|------------|
| IDs numéricos | `parseInt` + `isNaN` + `> 0` + límite máximo (`2147483647`) |
| Tipos de datos | Verificación de `typeof` para strings/numbers |
| Límites numéricos | `MAX_ID_VALUE`, `MAX_DIMENSION_VALUE` (99999.99), `MAX_NAME_LENGTH` (100) |
| Fechas | Formato `YYYY-MM-DD` + validación de fecha válida + no futura |
| Status inventario | Lista blanca: `disponible`, `reservado`, `vendido`, `eliminado` |
| Campos activos | Verifica `is_active = true` para dimensiones y stack_configs |
| stack_config_id en dimensions | **Requerido** - No puede ser null ni omitido |
| Integridad referencial | No permite eliminar stack_configs asociados a dimensiones o inventario |

### Simulación de Errores

Para probar el manejo de errores:

| Parámetro | Código | Status | Descripción |
|-----------|--------|--------|-------------|
| `simulate=connection` | ECONNREFUSED | 503 | PostgreSQL no está corriendo |
| `simulate=auth` | 28P01 | 401 | Credenciales incorrectas |
| `simulate=database` | 3D000 | 404 | Base de datos no existe |
| `simulate=query` | 42601 | 400 | Sintaxis SQL inválida |

**Prueba:** Usa el archivo `requests/errorSimulation.rest` con la extensión ClientREST de VSCode.

---