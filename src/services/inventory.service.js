import {executeQuery} from './query.helper.js';

export class InventoryService {
	async findAll() {
		const query = `
			SELECT 
				ip.id,
				CONCAT(d.thickness, 'x', d.width, 'x', d.length) AS dimensions,
				CONCAT(sc.width, 'x', sc.height) AS stack_config,
				ip.unit_count,
				ip.cubic_meters AS total_cubic_meters,
				ip.production_date,
				ip.status
			FROM inventory_packages ip
			JOIN dimensions d ON ip.dimension_id = d.id
			JOIN stack_configurations sc ON ip.stack_config_id = sc.id
		`;
		return executeQuery(query);
	}
}

export const inventoryService = new InventoryService();