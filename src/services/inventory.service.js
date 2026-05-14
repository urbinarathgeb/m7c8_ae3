import {executeQuery, executeQueryOne} from './query.helper.js';
import {NotFoundError, ValidationError} from '../utils/errors.js';

export class InventoryService {
	async findAll(filters = {}) {
		let query = `
			SELECT ip.id,
			       ip.unit_count,
			       ip.cubic_meters,
			       ip.production_date,
			       ip.status,
			       ip.notes,
			       ip.created_at,
			       ip.updated_at,
			       d.id AS dimension_id,
			       CONCAT(d.thickness, 'x', d.width, 'x', d.length) AS dimensions,
			       sc.id AS stack_config_id,
			       CONCAT(sc.name, ' (', sc.width, 'x', sc.height, ')') AS stack_config,
			       CASE
			           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
			           ELSE 'especial'
			       END AS config_type
			FROM inventory_packages ip
			JOIN dimensions d ON ip.dimension_id = d.id
			JOIN stack_configurations sc ON ip.stack_config_id = sc.id
			WHERE ip.status != 'eliminado'
		`;

		const params = [];
		let paramIndex = 1;

		if (filters.status) {
			query += ` AND ip.status = $${paramIndex++}`;
			params.push(filters.status);
		}

		if (filters.dimension_id) {
			query += ` AND ip.dimension_id = $${paramIndex++}`;
			params.push(filters.dimension_id);
		}

		if (filters.date) {
			query += ` AND ip.production_date = $${paramIndex++}`;
			params.push(filters.date);
		}

		if (filters.from_date) {
			query += ` AND ip.production_date >= $${paramIndex++}`;
			params.push(filters.from_date);
		}

		if (filters.to_date) {
			query += ` AND ip.production_date <= $${paramIndex++}`;
			params.push(filters.to_date);
		}

		query += ' ORDER BY ip.created_at DESC';

		return executeQuery(query, params);
	}

	async findById(id) {
		return executeQueryOne(
			`SELECT ip.id,
			       ip.unit_count,
			       ip.cubic_meters,
			       ip.production_date,
			       ip.status,
			       ip.notes,
			       ip.created_at,
			       ip.updated_at,
			       d.id AS dimension_id,
			       d.thickness,
			       d.width,
			       d.length,
			       CONCAT(d.thickness, 'x', d.width, 'x', d.length) AS dimensions,
			       sc.id AS stack_config_id,
			       sc.name AS stack_config_name,
			       sc.width AS stack_width,
			       sc.height AS stack_height,
			       CASE
			           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
			           ELSE 'especial'
			       END AS config_type
			FROM inventory_packages ip
			JOIN dimensions d ON ip.dimension_id = d.id
			JOIN stack_configurations sc ON ip.stack_config_id = sc.id
			WHERE ip.id = $1`,
			[id]
		);
	}

	async create({dimension_id, stack_config_id, production_date, notes}) {
		if (!dimension_id) {
			throw new ValidationError('La dimensión es requerida');
		}

		if (!stack_config_id) {
			throw new ValidationError('La configuración de stack es requerida');
		}

		if (typeof dimension_id !== 'number' || dimension_id <= 0) {
			throw new ValidationError('El ID de dimensión debe ser un número válido mayor a 0');
		}

		if (typeof stack_config_id !== 'number' || stack_config_id <= 0) {
			throw new ValidationError('El ID de configuración de stack debe ser un número válido mayor a 0');
		}

		const dimension = await executeQueryOne('SELECT * FROM dimensions WHERE id = $1 AND is_active = true', [dimension_id]);
		if (!dimension) {
			throw new NotFoundError('La dimensión no existe o está desactivada');
		}

		const stackConfig = await executeQueryOne(
			'SELECT * FROM stack_configurations WHERE id = $1 AND is_active = true',
			[stack_config_id]
		);
		if (!stackConfig) {
			throw new NotFoundError('La configuración de stack no existe o está desactivada');
		}

		const unit_count = stackConfig.width * stackConfig.height;
		const cubic_meters = (dimension.thickness * dimension.width * dimension.length * unit_count) / 1000000000;

		const finalProductionDate = production_date || new Date().toISOString().split('T')[0];
		const today = new Date().toISOString().split('T')[0];
		if (finalProductionDate > today) {
			throw new ValidationError('La fecha de producción no puede ser futura');
		}

		return await executeQueryOne(
			`INSERT INTO inventory_packages (dimension_id, stack_config_id, unit_count, cubic_meters, production_date, status, notes)
             VALUES ($1, $2, $3, $4, $5, 'disponible', $6)
             RETURNING *`,
			[dimension_id, stack_config_id, unit_count, cubic_meters, finalProductionDate, notes || null]
		);
	}

	async update(id, {stack_config_id, production_date, status, notes}) {
		const existing = await this.findById(id);
		if (!existing) {
			throw new NotFoundError('Paquete de inventario no encontrado');
		}

		if (stack_config_id !== undefined && (typeof stack_config_id !== 'number' || stack_config_id <= 0)) {
			throw new ValidationError('El ID de configuración de stack debe ser un número válido mayor a 0');
		}

		let unit_count = existing.unit_count;
		let cubic_meters = existing.cubic_meters;

		if (stack_config_id && stack_config_id !== existing.stack_config_id) {
			const stackConfig = await executeQueryOne(
				'SELECT * FROM stack_configurations WHERE id = $1 AND is_active = true',
				[stack_config_id]
			);
			if (!stackConfig) {
				throw new NotFoundError('La configuración de stack no existe o está desactivada');
			}
			unit_count = stackConfig.width * stackConfig.height;
			cubic_meters = (existing.thickness * existing.width * existing.length * unit_count) / 1000000000;
		}

		const fields = [];
		const values = [];
		let paramIndex = 1;

		if (stack_config_id !== undefined && stack_config_id !== existing.stack_config_id) {
			fields.push(`stack_config_id = $${paramIndex++}`);
			values.push(stack_config_id);
		}

		if (unit_count !== existing.unit_count) {
			fields.push(`unit_count = $${paramIndex++}`);
			values.push(unit_count);
			fields.push(`cubic_meters = $${paramIndex++}`);
			values.push(cubic_meters);
		}

		if (production_date !== undefined) {
			fields.push(`production_date = $${paramIndex++}`);
			values.push(production_date);
		}

		if (status !== undefined) {
			fields.push(`status = $${paramIndex++}`);
			values.push(status);
		}

		if (notes !== undefined) {
			fields.push(`notes = $${paramIndex++}`);
			values.push(notes);
		}

		if (fields.length === 0) {
			return existing;
		}

		fields.push(`updated_at = CURRENT_TIMESTAMP`);
		values.push(id);

		return await executeQueryOne(
			`UPDATE inventory_packages
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex} AND status != 'eliminado'
             RETURNING *`, values
		);
	}

	async softDelete(id) {
		return await executeQueryOne(
			`UPDATE inventory_packages
             SET status = 'eliminado', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND status != 'eliminado'
             RETURNING *`,
			[id]
		);
	}

	async getStockConsolidated() {
		return executeQuery(`
			SELECT d.thickness,
			       d.width,
			       d.length,
			       CONCAT(d.thickness, 'x', d.width, 'x', d.length) AS dimensions,
			       ip.status,
			       sc.width  AS stack_width,
			       sc.height AS stack_height,
			       sc.name AS stack_config_name,
			       CASE
			           WHEN ip.stack_config_id = d.stack_config_id THEN 'estándar'
			           ELSE 'especial'
			       END AS config_type,
			       COUNT(ip.id)         AS total_packages,
			       ROUND(SUM(ip.cubic_meters)::numeric, 4) AS total_m3,
			       SUM(ip.unit_count)   AS total_units
			FROM inventory_packages ip
			JOIN dimensions d ON ip.dimension_id = d.id
			JOIN stack_configurations sc ON ip.stack_config_id = sc.id
			WHERE ip.status != 'eliminado'
			GROUP BY d.thickness, d.width, d.length, ip.status, sc.width, sc.height, sc.name, ip.stack_config_id, d.stack_config_id
			ORDER BY d.thickness, d.width, d.length, ip.status
		`);
	}

	async getStockSummary() {
		return await executeQueryOne(`
			SELECT COUNT(*) AS total_packages,
			       ROUND(SUM(cubic_meters)::numeric, 4) AS total_m3,
			       SUM(unit_count) AS total_units
			FROM inventory_packages
			WHERE status != 'eliminado'
		`);
	}
}

export const inventoryService = new InventoryService();