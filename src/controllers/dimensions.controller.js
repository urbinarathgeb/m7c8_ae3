import pool from '../config/db.config.js';

export const getAllDimensions = async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM dimensions');
		console.table(result.rows);
		res.json({
			success: true,
			status: 200,
			message: 'Dimensiones obtenidas correctamente',
			data: result.rows
		})

	} catch (error) {
		console.error('❌ Error al ejecutar la query:', error.message);
		res.status(500).json({
			success: false,
			status: 500,
			message: 'Error al ejecutar la query',
			error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
		});
	}
}