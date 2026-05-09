# Módulo 7 - Aprendizaje esperado nº1

## Conectando y administrando una base de datos PostgreSQL con Node.js

### Objetivo

Desarrollar aplicación  `Node.js` que se conecta a una base de datos `PostgreSQL`.

### DESCRIPCIÓN

Esta actividad está diseñada con el fin de conectar a una base de datos PostgreSQL con Node.js, aplicando las librerías necesarias.

### Instrucciones específicas

#### 1- Configurar el entorno de trabajo

- Inicializar proyecto `Node.js` `Express`.
- Instalar las librerías necesarias.
- Crear archivo .env con credenciales a conexión `PostgreSQL`.
- Crear base de datos con al menos una tabla con 3 parámetros (debe existir id) e ingresar al menos 5 registros.

#### 2- Implementación de la conexión

- Crear archivo `db.js`donde se implemente la conexión `Pool`a `PostgreSQL`
- Crear un archivo `index.js` en donde se configure el servidor con `Expres.js` (debe contener middlewares).
- Crear `endpoint` para obtener los datos de la base de datos.
- Aplicar los archivos `try`y `catch`para los mensajes de errores.

#### 3- Responde las siguientes preguntas prácticas, las cuales pueden entregarse en el `Github`en un Readme o PDF

- a. ¿Por qué es mejor utilizar un pool de conexión, en vez de una simple?
- b. Genera un error en la conexión de la base de datos y explica qué tipo de error es.