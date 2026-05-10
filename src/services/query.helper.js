import pool from '../config/db.config.js';

export const executeQuery = async (query, params = []) => {
	const {rows} = await pool.query(query, params);
	return rows;
};