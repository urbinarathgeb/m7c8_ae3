import {executeQuery, executeQueryOne} from './query.helper.js';
import {NotFoundError, ValidationError} from '../utils/errors.js';

export class DimensionService {
	async findAll() {
		return executeQuery(
			`SELECT d.*, sc.name as stack_config_name, sc.width as stack_width, sc.height as stack_height
             FROM dimensions d
             LEFT JOIN stack_configurations sc ON d.stack_config_id = sc.id
             WHERE d.is_active = true
             ORDER BY d.thickness, d.width, d.length`
		);
	}

	async findById(id) {
		return executeQueryOne(
			`SELECT d.*, sc.name as stack_config_name, sc.width as stack_width, sc.height as stack_height
             FROM dimensions d
             LEFT JOIN stack_configurations sc ON d.stack_config_id = sc.id
             WHERE d.id = $1`,
			[id]
		);
	}

	async create({thickness, width, length, stack_config_id}) {
		if (thickness === undefined || width === undefined || length === undefined) {
			throw new ValidationError('Los campos thickness, width y length son requeridos');
		}

		if (stack_config_id !== null && stack_config_id !== undefined) {
			if (typeof stack_config_id !== 'number' || stack_config_id <= 0) {
				throw new ValidationError('El ID de configuración de stack debe ser un número válido mayor a 0');
			}
			const stackExists = await this.stackConfigExists(stack_config_id);
			if (!stackExists) {
				throw new NotFoundError('La configuración de stack no existe o está desactivada');
			}
		}

		return await executeQueryOne(
			`INSERT INTO dimensions (thickness, width, length, stack_config_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
			[thickness, width, length, stack_config_id || null]
		);
	}

	async update(id, {thickness, width, length, stack_config_id}) {
		const existing = await this.findById(id);
		if (!existing) {
			throw new NotFoundError('Dimensión no encontrada');
		}

		const fields = [];
		const values = [];
		let paramIndex = 1;

		if (thickness !== undefined) {
			fields.push(`thickness = $${paramIndex++}`);
			values.push(thickness);
		}
		if (width !== undefined) {
			fields.push(`width = $${paramIndex++}`);
			values.push(width);
		}
		if (length !== undefined) {
			fields.push(`length = $${paramIndex++}`);
			values.push(length);
		}
		if (stack_config_id !== undefined) {
			if (stack_config_id !== null && (typeof stack_config_id !== 'number' || stack_config_id <= 0)) {
				throw new ValidationError('El ID de configuración de stack debe ser un número válido mayor a 0');
			}
			if (stack_config_id !== null) {
				const stackExists = await this.stackConfigExists(stack_config_id);
				if (!stackExists) {
					throw new NotFoundError('La configuración de stack no existe o está desactivada');
				}
			}
			fields.push(`stack_config_id = $${paramIndex++}`);
			values.push(stack_config_id || null);
		}

		if (fields.length === 0) {
			return this.findById(id);
		}

		values.push(id);
		return await executeQueryOne(
			`UPDATE dimensions
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex} AND is_active = true
             RETURNING *`,
			values
		);
	}

	async softDelete(id) {
		return await executeQueryOne(
			`UPDATE dimensions
             SET is_active = false
             WHERE id = $1 AND is_active = true
             RETURNING *`,
			[id]
		);
	}

	async isInUse(id) {
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM inventory_packages WHERE dimension_id = $1',
			[id]
		);
		return parseInt(result.count) > 0;
	}

	async isUnique(thickness, width, length, excludeId = null) {
		if (excludeId) {
			const result = await executeQueryOne(
				`SELECT COUNT(*) as count FROM dimensions
                 WHERE thickness = $1 AND width = $2 AND length = $3 AND id != $4`,
				[thickness, width, length, excludeId]
			);
			return parseInt(result.count) === 0;
		}
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM dimensions WHERE thickness = $1 AND width = $2 AND length = $3',
			[thickness, width, length]
		);
		return parseInt(result.count) === 0;
	}

	async stackConfigExists(stack_config_id) {
		if (!stack_config_id) return true;
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM stack_configurations WHERE id = $1 AND is_active = true',
			[stack_config_id]
		);
		return parseInt(result.count) > 0;
	}
}

export const dimensionService = new DimensionService();