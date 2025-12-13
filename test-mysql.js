import mysql from 'mysql2/promise';

// Credenciales de prueba
const config = {
    host: 'mysql.us.stackcp.com',
    port: 39244,
    user: 'galeria-35303936129e',
    password: 'agA%X7gLMN6i',
    database: 'galeria-35303936129e'
};

console.log('🔄 Probando conexión a MySQL...');
console.log(`   Host: ${config.host}:${config.port}`);
console.log(`   Usuario: ${config.user}`);
console.log(`   Base de datos: ${config.database}`);

try {
    const connection = await mysql.createConnection(config);
    console.log('✅ ¡Conexión exitosa!');

    // Probar query
    const [rows] = await connection.query('SHOW TABLES');
    console.log('📋 Tablas en la base de datos:');
    rows.forEach(row => {
        console.log('   -', Object.values(row)[0]);
    });

    await connection.end();
    console.log('🔌 Conexión cerrada.');
} catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que la contraseña sea correcta');
    console.log('   2. Agrega tu IP en "Remote MySQL" de cPanel');
    console.log('   3. Verifica que el puerto 39244 esté abierto');
}
