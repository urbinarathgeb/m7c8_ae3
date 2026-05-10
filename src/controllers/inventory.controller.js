import {inventoryService} from '../services/inventory.service.js';

export const getAllInventory = async (req, res, next) => {
	try {
		const inventory = await inventoryService.findAll();
		console.table(inventory);
		res.json({
			success: true,
			status: 200,
			message: 'Inventario obtenido correctamente',
			data: inventory
		});
	} catch (error) {
		next(error);
	}
};