import {executeQuery} from './query.helper.js';

export class DimensionService {
	async findAll() {
		return executeQuery('SELECT * FROM dimensions');
	}
}

export const dimensionService = new DimensionService();