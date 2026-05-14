import pool from '../config/db.config.js';

export const executeQuery = async (query, params = []) => {
	const {rows} = await pool.query(query, params);
	return rows;
};

export const executeQueryOne = async (query, params = []) => {
	const {rows} = await pool.query(query, params);
	return rows[0] || null;
};
