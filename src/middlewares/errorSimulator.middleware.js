export const errorSimulator = (req, res, next) => {
  const { simulate } = req.query;

  if (!simulate) {
    return next();
  }

  const errors = {
    connection: () => {
      const error = new Error('No se pudo conectar al servidor PostgreSQL. Verifique que el servicio esté corriendo.');
      error.code = 'ECONNREFUSED';
      error.status = 503;
      return error;
    },
    auth: () => {
      const error = new Error('Autenticación fallida. Verifique el usuario y contraseña en el archivo .env');
      error.code = '28P01';
      error.status = 401;
      return error;
    },
    database: () => {
      const error = new Error('La base de datos especificada no existe en el servidor PostgreSQL');
      error.code = '3D000';
      error.status = 404;
      return error;
    },
    query: () => {
      const error = new Error('Error de sintaxis en la consulta SQL. Verifique la query.');
      error.code = '42601';
      error.status = 400;
      return error;
    }
  };

  const errorFn = errors[simulate];
  if (errorFn) {
    const error = errorFn();
    return next(error);
  }

  next();
};