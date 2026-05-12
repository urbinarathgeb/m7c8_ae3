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
# Recrear base de datos (schema + seeds)
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

## Estado del Proyecto

### Fase 1 ✅ Completada
- Base de datos completa con 9 tablas
- Datos seed (roles, permisos, dimensiones, configuraciones de stack)
- Endpoint básico de dimensiones

---

## Endpoints Actuales

| Método | Ruta | Descripción |
|--------|-----|-------------|
| GET | `/api/dimensions` | Listar todas las dimensiones |
| GET | `/api/inventory` | Listar inventario completo |

---

## Estructura de la Base de Datos

```
roles ← role_permissions → permissions
         ↑
       users
         ↓
dimensions ← inventory_packages → inventory_movements
       ↑
stack_configurations
         ↓
  daily_production_log
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `roles` | Tipos de usuario (admin, operario) |
| `permissions` | Acciones del sistema |
| `users` | Usuarios del sistema |
| `dimensions` | Catálogo de medidas (espesor x ancho x largo) |
| `stack_configurations` | Configuraciones de apilamiento |
| `inventory_packages` | Paquetes de madera registrados |
| `inventory_movements` | Historial de cambios |
| `daily_production_log` | Resúmenes diarios de producción |

---

## Arquitectura

```
src/
├── config/
│   └── db.config.js        # Pool de PostgreSQL
├── controllers/
│   ├── dimensions.controller.js
│   └── inventory.controller.js
├── services/
│   ├── query.helper.js     # Helper reutilizable para queries
│   ├── dimension.service.js
│   └── inventory.service.js
├── routes/
│   ├── dimensions.routes.js
│   └── inventory.routes.js
├── middlewares/
│   ├── errorHandler.middleware.js
│   └── errorSimulator.middleware.js
└── index.js
```

---

## Simulación de Errores

Para probar el manejo de errores:

| Parámetro | Código | Status | Descripción |
|-----------|--------|--------|-------------|
| `simulate=connection` | ECONNREFUSED | 503 | PostgreSQL no está corriendo |
| `simulate=auth` | 28P01 | 401 | Credenciales incorrectas |
| `simulate=database` | 3D000 | 404 | Base de datos no existe |
| `simulate=query` | 42601 | 400 | Sintaxis SQL inválida |

**Prueba:** Usa el archivo `src/requests/errorSimulation.rest` con la extensión ClientREST de VSCode.

---