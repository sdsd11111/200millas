import mysql from 'mysql2/promise';

// Lazy pool initialization - created on first use
let pool = null;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ Pool de MySQL creado');
    }
    return pool;
}

export default getPool;
