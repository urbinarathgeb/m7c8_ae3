import {inventoryService} from '../services/inventory.service.js';

export const getAllInventory = async (req, res, next) => {
	try {
		const dimensions = await inventoryService.findAll();
		console.table(dimensions);
		res.json({
			success: true,
			status: 200,
			message: 'Inventario obtenido correctamente',
			data: dimensions
		});
	} catch (error) {
		next(error);
	}
};