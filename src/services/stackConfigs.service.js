import {executeQuery, executeQueryOne} from './query.helper.js';
import {NotFoundError, ValidationError} from '../utils/errors.js';

export class StackConfigsService {
	async findAll() {
		return executeQuery('SELECT * FROM stack_configurations WHERE is_active = true ORDER BY width, height');
	}

	async findById(id) {
		return executeQueryOne('SELECT * FROM stack_configurations WHERE id = $1', [id]);
	}

	async create({name, width, height}) {
		if (width === undefined || width <= 0) {
			throw new ValidationError('El campo width debe ser mayor a 0');
		}
		if (height === undefined || height <= 0) {
			throw new ValidationError('El campo height debe ser mayor a 0');
		}

		return await executeQueryOne(
			`INSERT INTO stack_configurations (name, width, height)
             VALUES ($1, $2, $3)
             RETURNING *`,
			[name, width, height]
		);
	}

	async update(id, {name, width, height}) {
		const existing = await this.findById(id);
		if (!existing) {
			throw new NotFoundError('Configuración de stack no encontrada');
		}

		if (width !== undefined && width <= 0) {
			throw new ValidationError('El campo width debe ser mayor a 0');
		}
		if (height !== undefined && height <= 0) {
			throw new ValidationError('El campo height debe ser mayor a 0');
		}

		return await executeQueryOne(
			`UPDATE stack_configurations
             SET name = $1, width = $2, height = $3
             WHERE id = $4 AND is_active = true
             RETURNING *`,
			[name, width, height, id]
		);
	}

	async softDelete(id) {
		return await executeQueryOne(
			`UPDATE stack_configurations
             SET is_active = false
             WHERE id = $1 AND is_active = true
             RETURNING *`,
			[id]
		);
	}

	async isInUse(id) {
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM inventory_packages WHERE stack_config_id = $1',
			[id]
		);
		return parseInt(result.count) > 0;
	}

	async isUnique(width, height, excludeId = null) {
		if (excludeId) {
			const result = await executeQueryOne(
				`SELECT COUNT(*) as count FROM stack_configurations
                 WHERE width = $1 AND height = $2 AND id != $3`,
				[width, height, excludeId]
			);
			return parseInt(result.count) === 0;
		}
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM stack_configurations WHERE width = $1 AND height = $2',
			[width, height]
		);
		return parseInt(result.count) === 0;
	}

	async nameExists(name, excludeId = null) {
		if (excludeId) {
			const result = await executeQueryOne(
				'SELECT COUNT(*) as count FROM stack_configurations WHERE name = $1 AND id != $2',
				[name, excludeId]
			);
			return parseInt(result.count) > 0;
		}
		const result = await executeQueryOne(
			'SELECT COUNT(*) as count FROM stack_configurations WHERE name = $1',
			[name]
		);
		return parseInt(result.count) > 0;
	}
}

export const stackConfigsService = new StackConfigsService();