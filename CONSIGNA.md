# Aprendizaje esperado nº3

## Reto de Manipulación de Datos en Node.js

### Objetivo
Desarrollar una API Node.js que permita la manipulación de datos.

### Descripción
Desarrollar una API en Node.js que permita la inserción, actualización y eliminación de registros en una base de datos PostgreSQL.

### Instrucciones

#### Escenario del reto:
Se puede utilizar la misma base que ya se está trabajando.

#### 1- Insertar registros
- Crear una función para insertar un registro nuevo.
- La función debe recibir los datos en JSON a través de `request.body`.
- Crear endpoint para insertar el registro.
- Probar funcionalidad con `Postman`/ `Cliente Rest`.

#### 2- Actualizar registros en la base de datos
- Crear función para actualizar un registro.
- El update debe recibir el parámetro id y cambiar un campo.
- Crear endpoint para actualizar registro.
- Probar funcionalidad con `Postman`/ `Cliente Rest`.

#### 3- Eliminar registros de la base de datos
- Crear función para eliminar un registro.
- El delete debe recibir el parámetro id y eliminar
- Crear endpoint para eliminar registro.
- - Probar funcionalidad con `Postman`/ `Cliente Rest`.

En cada uno de estos puntos se debe manejar los errores con `try/catch` y enviar códigos `HTTP`.