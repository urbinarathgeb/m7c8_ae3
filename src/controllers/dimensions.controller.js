import {dimensionService} from '../services/dimension.service.js';
import {stackConfigsService} from '../services/stackConfigs.service.js';

const MAX_ID_VALUE = 2147483647;
const MAX_DIMENSION_VALUE = 99999.99;

export const getAllDimensions = async (req, res, next) => {
	try {
		const dimensions = await dimensionService.findAll();
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Dimensiones obtenidas correctamente',
			data: dimensions
		});
	} catch (error) {
		next(error);
	}
};

export const getDimensionById = async (req, res, next) => {
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
		const dimension = await dimensionService.findById(idNum);
		if (!dimension) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Dimensión no encontrada'
			});
		}
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Dimensión obtenida correctamente',
			data: dimension
		});
	} catch (error) {
		next(error);
	}
};

export const createDimension = async (req, res, next) => {
	try {
		const {thickness, width, length, stack_config_id} = req.body;

		if (thickness === undefined || thickness === null || width === undefined || width === null || length === undefined || length === null) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Los campos thickness, width y length son obligatorios'
			});
		}

		if (typeof thickness !== 'number' && typeof thickness !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo thickness debe ser un número'
			});
		}
		if (typeof width !== 'number' && typeof width !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo width debe ser un número'
			});
		}
		if (typeof length !== 'number' && typeof length !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo length debe ser un número'
			});
		}

		const thicknessNum = parseFloat(thickness);
		const widthNum = parseFloat(width);
		const lengthNum = parseFloat(length);

		if (isNaN(thicknessNum) || isNaN(widthNum) || isNaN(lengthNum)) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Los campos thickness, width y length deben ser números válidos'
			});
		}

		if (thicknessNum <= 0 || thicknessNum > MAX_DIMENSION_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `Thickness debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
			});
		}

		if (widthNum <= 0 || widthNum > MAX_DIMENSION_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `Width debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
			});
		}

		if (lengthNum <= 0 || lengthNum > MAX_DIMENSION_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: `Length debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
			});
		}

		const isUnique = await dimensionService.isUnique(thickness, width, length);
		if (!isUnique) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Ya existe una dimensión con estas medidas'
			});
		}

		let stackConfigIdNum;
		if (stack_config_id !== undefined && stack_config_id !== null) {
			if (typeof stack_config_id !== 'number' && typeof stack_config_id !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo stack_config_id debe ser un número'
				});
			}
			stackConfigIdNum = parseInt(stack_config_id, 10);
			if (isNaN(stackConfigIdNum) || stackConfigIdNum <= 0 || stackConfigIdNum > MAX_ID_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo stack_config_id debe ser un número válido mayor a 0'
				});
			}
			const stackConfig = await stackConfigsService.findById(stackConfigIdNum);
			if (!stackConfig) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'La configuración de stack no existe'
				});
			}
			if (!stackConfig.is_active) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'La configuración de stack está desactivada'
				});
			}
		}

		const dimension = await dimensionService.create({thickness: thicknessNum, width: widthNum, length: lengthNum, stack_config_id: stackConfigIdNum});
		res.status(201).json({
			success: true,
			status: 201,
			message: 'Dimensión creada correctamente',
			data: dimension
		});
	} catch (error) {
		next(error);
	}
};

export const updateDimension = async (req, res, next) => {
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

		const {thickness, width, length, stack_config_id} = req.body;

		const existing = await dimensionService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Dimensión no encontrada'
			});
		}

		if (thickness !== undefined && thickness !== null) {
			if (typeof thickness !== 'number' && typeof thickness !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo thickness debe ser un número'
				});
			}
			const thicknessNum = parseFloat(thickness);
			if (isNaN(thicknessNum) || thicknessNum <= 0 || thicknessNum > MAX_DIMENSION_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Thickness debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
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
			const widthNum = parseFloat(width);
			if (isNaN(widthNum) || widthNum <= 0 || widthNum > MAX_DIMENSION_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Width debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
				});
			}
		}

		if (length !== undefined && length !== null) {
			if (typeof length !== 'number' && typeof length !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo length debe ser un número'
				});
			}
			const lengthNum = parseFloat(length);
			if (isNaN(lengthNum) || lengthNum <= 0 || lengthNum > MAX_DIMENSION_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Length debe ser mayor a 0 y menor o igual a ${MAX_DIMENSION_VALUE}`
				});
			}
		}

		const finalThickness = thickness !== undefined && thickness !== null ? parseFloat(thickness) : existing.thickness;
		const finalWidth = width !== undefined && width !== null ? parseFloat(width) : existing.width;
		const finalLength = length !== undefined && length !== null ? parseFloat(length) : existing.length;

		if (thickness !== undefined || width !== undefined || length !== undefined) {
			const isUnique = await dimensionService.isUnique(finalThickness, finalWidth, finalLength, idNum);
			if (!isUnique) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'Ya existe una dimensión con estas medidas'
				});
			}
		}

		let stackConfigIdNum = stack_config_id;
		if (stack_config_id !== undefined && stack_config_id !== null) {
			if (typeof stack_config_id !== 'number' && typeof stack_config_id !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo stack_config_id debe ser un número'
				});
			}
			stackConfigIdNum = parseInt(stack_config_id, 10);
			if (isNaN(stackConfigIdNum) || stackConfigIdNum <= 0 || stackConfigIdNum > MAX_ID_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo stack_config_id debe ser un número válido mayor a 0'
				});
			}
			const stackConfig = await stackConfigsService.findById(stackConfigIdNum);
			if (!stackConfig) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'La configuración de stack no existe'
				});
			}
			if (!stackConfig.is_active) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'La configuración de stack está desactivada'
				});
			}
		}

		const updated = await dimensionService.update(idNum, {
			thickness,
			width,
			length,
			stack_config_id: stackConfigIdNum
		});

		res.status(200).json({
			success: true,
			status: 200,
			message: 'Dimensión actualizada correctamente',
			data: updated
		});
	} catch (error) {
		next(error);
	}
};

export const deleteDimension = async (req, res, next) => {
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

		const existing = await dimensionService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Dimensión no encontrada'
			});
		}

		if (!existing.is_active) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'La dimensión ya está desactivada'
			});
		}

		const inUse = await dimensionService.isInUse(idNum);
		if (inUse) {
			const deleted = await dimensionService.softDelete(idNum);
			return res.status(200).json({
				success: true,
				status: 200,
				message: 'Dimensión desactivada. Hay paquetes de inventario asociados, por lo que se mantiene activa pero no estará disponible para nuevos paquetes',
				data: deleted
			});
		}

		const deleted = await dimensionService.softDelete(idNum);
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Dimensión eliminada correctamente',
			data: deleted
		});
	} catch (error) {
		next(error);
	}
};