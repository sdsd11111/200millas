import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

async function testConnection() {
    console.log('--- Iniciando prueba de conexión ---');
    console.log('Host:', process.env.MYSQL_HOST);
    console.log('Port:', process.env.MYSQL_PORT);
    console.log('User:', process.env.MYSQL_USER);
    console.log('DB:', process.env.MYSQL_DATABASE);

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 10000
        });

        console.log('✅ Conexión exitosa al servidor MySQL');

        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM gallery_images');
        console.log('✅ Consulta exitosa. Total imágenes en BD:', rows[0].count);

        await connection.end();
        console.log('--- Prueba finalizada con éxito ---');
    } catch (error) {
        console.error('❌ Error en el test de conexión:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);

        if (error.code === 'ECONNRESET') {
            console.log('\n--- DIAGNÓSTICO ---');
            console.log('El error ECONNRESET indica que el host cerró la conexión.');
            console.log('Causas probables:');
            console.log('1. Tu dirección IP NO está autorizada en el panel de control del hosting (StackCP).');
            console.log('2. El servidor de base de datos no permite conexiones externas.');
        }
    }
}

testConnection();
