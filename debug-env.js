import dotenv from 'dotenv';
dotenv.config();

console.log('=== DIAGNÓSTICO DE VARIABLES DE ENTORNO ===\n');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST || '(NO DEFINIDO)');
console.log('MYSQL_PORT:', process.env.MYSQL_PORT || '(NO DEFINIDO)');
console.log('MYSQL_USER:', process.env.MYSQL_USER || '(NO DEFINIDO)');
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? `"${process.env.MYSQL_PASSWORD}"` : '(NO DEFINIDO)');
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE || '(NO DEFINIDO)');

console.log('\n=== COMPARACIÓN CON CREDENCIALES CORRECTAS ===');
const correctPassword = 'agA%X7gLMN6i';
const currentPassword = process.env.MYSQL_PASSWORD;

if (currentPassword === correctPassword) {
    console.log('✅ La contraseña coincide');
} else {
    console.log('❌ La contraseña NO coincide');
    console.log('   Esperada: "' + correctPassword + '"');
    console.log('   Actual:   "' + (currentPassword || '') + '"');
}
