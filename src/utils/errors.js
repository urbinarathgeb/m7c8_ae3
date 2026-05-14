export class AppError extends Error {
	constructor(message, statusCode = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message, errors = []) {
		super(message, 400);
		this.errors = errors;
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Recurso no encontrado') {
		super(message, 404);
	}
}

export class ConflictError extends AppError {
	constructor(message) {
		super(message, 409);
	}
}

export class DatabaseError extends AppError {
	constructor(message = 'Error de base de datos') {
		super(message, 500);
	}
}
