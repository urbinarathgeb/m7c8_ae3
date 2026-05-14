import {AppError, ValidationError} from '../utils/errors.js';

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

	if (err instanceof AppError) {
		const response = {
			success: false,
			status: err.statusCode,
			message: err.message
		};

		if (err instanceof ValidationError && err.errors) {
			response.errors = err.errors;
		}

		if (isDevelopment) {
			response.stack = err.stack;
		}

		return res.status(err.statusCode).json(response);
	}

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