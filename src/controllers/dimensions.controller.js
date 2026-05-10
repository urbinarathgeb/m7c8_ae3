import { dimensionService } from '../services/dimension.service.js';

export const getAllDimensions = async (req, res, next) => {
	try {
		const dimensions = await dimensionService.findAll();
		console.table(dimensions);
		res.json({
			success: true,
			status: 200,
			message: 'Dimensiones obtenidas correctamente',
			data: dimensions
		});
	} catch (error) {
		next(error);
	}
};