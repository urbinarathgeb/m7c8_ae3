import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const poolConfig =  {
		// Si no hay DATABASE_URL, usa tus credenciales locales
		host: process.env.PG_HOST,
		port: process.env.PG_PORT,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
	};

const pool = new pg.Pool(poolConfig);

pool.connect((err, client, release) => {
	if (err) {
		return console.error('❌ Error de conexión:', err.stack);
	}
	console.log(`✅ Conexión exitosa a PostgreSQL en Local`);
	client.release();
});

export default pool;