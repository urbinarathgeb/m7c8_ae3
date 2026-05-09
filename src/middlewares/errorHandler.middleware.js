export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: 'Ruta no encontrada',
    path: req.path
  });
};

export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error('Error capturado por el handler:', err.message);

  const response = {
    success: false,
    status: err.status || 500,
    message: err.message || 'Error interno del servidor'
  };

  if (err.code && isDevelopment) {
    response.code = err.code;
  }

  if (isDevelopment) {
    response.stack = err.stack;
  }

  res.status(response.status).json(response);
};