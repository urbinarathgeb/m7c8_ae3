import {stackConfigsService} from '../services/stackConfigs.service.js';

const MAX_ID_VALUE = 2147483647;
const MAX_NAME_LENGTH = 100;
const MAX_DIMENSION_VALUE = 2147483647;

export const getAllStackConfigs = async (req, res, next) => {
	try {
		const configs = await stackConfigsService.findAll();
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Configuraciones de stack obtenidas correctamente',
			data: configs
		});
	} catch (error) {
		next(error);
	}
};

export const getStackConfigById = async (req, res, next) => {
	try {
		const {id} = req.params;
		const idNum = parseInt(id, 10);
		if (isNaN(idNum) || idNum <= 0 || idNum > MAX_ID_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El ID debe ser un número válido mayor a 0'
			});
		}
		const config = await stackConfigsService.findById(idNum);
		if (!config) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Configuración de stack no encontrada'
			});
		}
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Configuración de stack obtenida correctamente',
			data: config
		});
	} catch (error) {
		next(error);
	}
};

export const createStackConfig = async (req, res, next) => {
	try {
		const {name, width, height} = req.body;

		if (name === undefined || name === null || width === undefined || width === null || height === undefined || height === null) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Los campos name, width y height son requeridos'
			});
		}

		if (typeof name !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo name debe ser texto'
			});
		}

		if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `El campo name debe tener entre 1 y ${MAX_NAME_LENGTH} caracteres`
			});
		}

		if (typeof width !== 'number' && typeof width !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo width debe ser un número'
			});
		}

		if (typeof height !== 'number' && typeof height !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo height debe ser un número'
			});
		}

		const widthNum = parseInt(width, 10);
		const heightNum = parseInt(height, 10);

		if (isNaN(widthNum) || widthNum <= 0 || widthNum > MAX_DIMENSION_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `Width debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
			});
		}

		if (isNaN(heightNum) || heightNum <= 0 || heightNum > MAX_DIMENSION_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `Height debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
			});
		}

		const isUnique = await stackConfigsService.isUnique(widthNum, heightNum);
		if (!isUnique) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Ya existe una configuración con este width y height'
			});
		}

		const nameExists = await stackConfigsService.nameExists(name);
		if (nameExists) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Ya existe una configuración con este nombre'
			});
		}

		const config = await stackConfigsService.create({name, width: widthNum, height: heightNum});
		res.status(201).json({
			success: true,
			status: 201,
			message: 'Configuración de stack creada correctamente',
			data: config
		});
	} catch (error) {
		next(error);
	}
};

export const updateStackConfig = async (req, res, next) => {
	try {
		const {id} = req.params;
		const idNum = parseInt(id, 10);
		if (isNaN(idNum) || idNum <= 0 || idNum > MAX_ID_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El ID debe ser un número válido mayor a 0'
			});
		}

		const {name, width, height} = req.body;

		const existing = await stackConfigsService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Configuración de stack no encontrada'
			});
		}

		if (name !== undefined && name !== null) {
			if (typeof name !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo name debe ser texto'
				});
			}
			if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `El campo name debe tener entre 1 y ${MAX_NAME_LENGTH} caracteres`
				});
			}
			const nameExists = await stackConfigsService.nameExists(name, idNum);
			if (nameExists) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'Ya existe una configuración con este nombre'
				});
			}
		}

		if (width !== undefined && width !== null) {
			if (typeof width !== 'number' && typeof width !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo width debe ser un número'
				});
			}
			const widthNum = parseInt(width, 10);
			if (isNaN(widthNum) || widthNum <= 0 || widthNum > MAX_DIMENSION_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Width debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
				});
			}
		}

		if (height !== undefined && height !== null) {
			if (typeof height !== 'number' && typeof height !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo height debe ser un número'
				});
			}
			const heightNum = parseInt(height, 10);
			if (isNaN(heightNum) || heightNum <= 0 || heightNum > MAX_DIMENSION_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Height debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
				});
			}
		}

		if (width !== undefined || height !== undefined) {
			const finalWidth = width ? parseInt(width, 10) : existing.width;
			const finalHeight = height ? parseInt(height, 10) : existing.height;
			const isUnique = await stackConfigsService.isUnique(finalWidth, finalHeight, idNum);
			if (!isUnique) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'Ya existe una configuración con este width y height'
				});
			}
		}

		const updated = await stackConfigsService.update(idNum, {
			name: (name !== undefined && name !== null) ? name : existing.name,
			width: (width !== undefined && width !== null) ? parseInt(width, 10) : existing.width,
			height: (height !== undefined && height !== null) ? parseInt(height, 10) : existing.height
		});

		res.status(200).json({
			success: true,
			status: 200,
			message: 'Configuración de stack actualizada correctamente',
			data: updated
		});
	} catch (error) {
		next(error);
	}
};

export const deleteStackConfig = async (req, res, next) => {
	try {
		const {id} = req.params;
		const idNum = parseInt(id, 10);
		if (isNaN(idNum) || idNum <= 0 || idNum > MAX_ID_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El ID debe ser un número válido mayor a 0'
			});
		}

		const existing = await stackConfigsService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Configuración de stack no encontrada'
			});
		}

		if (!existing.is_active) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'La configuración ya está desactivada'
			});
		}

		const inUse = await stackConfigsService.isInUse(idNum);
		if (inUse) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'No se puede eliminar: hay paquetes de inventario asociados a esta configuración'
			});
		}

		const deleted = await stackConfigsService.softDelete(idNum);
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Configuración de stack eliminada correctamente',
			data: deleted
		});
	} catch (error) {
		next(error);
	}
};
