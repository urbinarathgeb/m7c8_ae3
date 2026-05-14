import {inventoryService} from '../services/inventory.service.js';
import {dimensionService} from '../services/dimension.service.js';
import {stackConfigsService} from '../services/stackConfigs.service.js';

const VALID_STATUSES = ['disponible', 'reservado', 'vendido', 'eliminado'];

const MAX_NOTES_LENGTH = 1000;
const MAX_ID_VALUE = 2147483647;

const validateDate = (dateStr) => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateStr)) return { valid: false, message: 'La fecha debe tener formato YYYY-MM-DD' };
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return { valid: false, message: 'La fecha no es válida' };
	if (date > new Date()) return { valid: false, message: 'La fecha no puede ser futura' };
	return { valid: true };
};

export const getAllInventory = async (req, res, next) => {
	try {
		const {status, dimension_id, date, from_date, to_date} = req.query;
		const filters = {};

		if (status) {
			if (!VALID_STATUSES.includes(status)) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
				});
			}
			filters.status = status;
		}

		if (dimension_id) {
			const dimIdNum = parseInt(dimension_id, 10);
			if (isNaN(dimIdNum) || dimIdNum <= 0 || dimIdNum > MAX_ID_VALUE) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo dimension_id debe ser un número válido mayor a 0'
				});
			}
			filters.dimension_id = dimIdNum;
		}

		if (date) {
			const dateValidation = validateDate(date);
			if (!dateValidation.valid) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: dateValidation.message
				});
			}
			filters.date = date;
		}

		if (from_date) {
			const dateValidation = validateDate(from_date);
			if (!dateValidation.valid) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: dateValidation.message
				});
			}
			filters.from_date = from_date;
		}

		if (to_date) {
			const dateValidation = validateDate(to_date);
			if (!dateValidation.valid) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: dateValidation.message
				});
			}
			filters.to_date = to_date;
		}

		const inventory = await inventoryService.findAll(filters);
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Inventario obtenido correctamente',
			data: inventory
		});
	} catch (error) {
		next(error);
	}
};

export const getInventoryById = async (req, res, next) => {
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
		const inventory = await inventoryService.findById(idNum);

		if (!inventory) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Paquete de inventario no encontrado'
			});
		}

		res.status(200).json({
			success: true,
			status: 200,
			message: 'Paquete de inventario obtenido correctamente',
			data: inventory
		});
	} catch (error) {
		next(error);
	}
};

export const createInventory = async (req, res, next) => {
	try {
		const {dimension_id, stack_config_id, production_date, notes} = req.body;

		if (dimension_id === undefined || dimension_id === null || stack_config_id === undefined || stack_config_id === null) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Los campos dimension_id y stack_config_id son requeridos'
			});
		}

		if (typeof dimension_id !== 'number' && typeof dimension_id !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo dimension_id debe ser un número'
			});
		}

		if (typeof stack_config_id !== 'number' && typeof stack_config_id !== 'string') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo stack_config_id debe ser un número'
			});
		}

		const dimensionIdNum = parseInt(dimension_id, 10);
		const stackConfigIdNum = parseInt(stack_config_id, 10);

		if (isNaN(dimensionIdNum) || dimensionIdNum <= 0 || dimensionIdNum > MAX_ID_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo dimension_id debe ser un número válido mayor a 0'
			});
		}

		if (isNaN(stackConfigIdNum) || stackConfigIdNum <= 0 || stackConfigIdNum > MAX_ID_VALUE) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El campo stack_config_id debe ser un número válido mayor a 0'
			});
		}

		const dimension = await dimensionService.findById(dimensionIdNum);
		if (!dimension) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'La dimensión no existe'
			});
		}
		if (!dimension.is_active) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'La dimensión está desactivada'
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

		if (production_date !== undefined && production_date !== null && production_date !== '') {
			const dateValidation = validateDate(production_date);
			if (!dateValidation.valid) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: dateValidation.message
				});
			}
		}

		if (notes !== undefined && notes !== null) {
			if (typeof notes !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo notes debe ser texto'
				});
			}
			if (notes.length > MAX_NOTES_LENGTH) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `El campo notes no puede exceder ${MAX_NOTES_LENGTH} caracteres`
				});
			}
		}

		const package_data = await inventoryService.create({
			dimension_id: dimensionIdNum,
			stack_config_id: stackConfigIdNum,
			production_date,
			notes
		});

		res.status(201).json({
			success: true,
			status: 201,
			message: 'Paquete de inventario creado correctamente',
			data: package_data
		});
	} catch (error) {
		if (error.message.includes('no existe') || error.message.includes('desactivada') || error.message.includes('futura') || error.message.includes('requerida')) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: error.message
			});
		}
		next(error);
	}
};

export const updateInventory = async (req, res, next) => {
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

		const {stack_config_id, production_date, status, notes} = req.body;

		const existing = await inventoryService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Paquete de inventario no encontrado'
			});
		}

		if (existing.status === 'eliminado') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'No se puede editar un paquete eliminado'
			});
		}

		if (status !== undefined && status !== null) {
			if (typeof status !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo status debe ser texto'
				});
			}
			if (!VALID_STATUSES.includes(status)) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
				});
			}
		}

		if (production_date !== undefined && production_date !== null && production_date !== '') {
			const dateValidation = validateDate(production_date);
			if (!dateValidation.valid) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: dateValidation.message
				});
			}
		}

		if (notes !== undefined && notes !== null) {
			if (typeof notes !== 'string') {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'El campo notes debe ser texto'
				});
			}
			if (notes.length > MAX_NOTES_LENGTH) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: `El campo notes no puede exceder ${MAX_NOTES_LENGTH} caracteres`
				});
			}
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

		const updated = await inventoryService.update(idNum, {
			stack_config_id: stackConfigIdNum,
			production_date,
			status,
			notes
		});

		res.status(200).json({
			success: true,
			status: 200,
			message: 'Paquete de inventario actualizado correctamente',
			data: updated
		});
	} catch (error) {
		if (error.message.includes('no existe') || error.message.includes('desactivada')) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: error.message
			});
		}
		next(error);
	}
};

export const deleteInventory = async (req, res, next) => {
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

		const existing = await inventoryService.findById(idNum);
		if (!existing) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Paquete de inventario no encontrado'
			});
		}

		if (existing.status === 'eliminado') {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'El paquete ya está eliminado'
			});
		}

		const deleted = await inventoryService.softDelete(idNum);
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Paquete de inventario eliminado correctamente',
			data: deleted
		});
	} catch (error) {
		next(error);
	}
};

export const getStock = async (req, res, next) => {
	try {
		const summary = await inventoryService.getStockSummary();
		const consolidated = await inventoryService.getStockConsolidated();

		res.status(200).json({
			success: true,
			status: 200,
			message: 'Stock obtenido correctamente',
			data: {
				summary,
				by_dimension: consolidated
			}
		});
	} catch (error) {
		next(error);
	}
};
