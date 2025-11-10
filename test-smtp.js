import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log('🚀 Iniciando prueba de configuraciones SMTP...');
    
    // Configuración del transporte SMTP
    const transporter = nodemailer.createTransport({
        host: 'mail.enloja.net',
        port: 587,
        secure: false, // false para el puerto 587, true para 465
        auth: {
            user: 'restaurante200millas@enloja.net',
            pass: 'Xv37Bz5sx9.z'
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true,
        logger: true
    });

    try {
        // Verificar la conexión SMTP
        console.log('🔍 Verificando conexión SMTP...');
        await transporter.verify();
        console.log('✅ Conexión SMTP verificada correctamente');

        // Enviar correo de prueba
        console.log('✉️  Enviando correo de prueba...');
        const info = await transporter.sendMail({
            from: '"200 Millas - Prueba" <restaurante200millas@enloja.net>',
            to: 'restaurante200millas@enloja.net',
            subject: 'Prueba de correo desde 200 Millas',
            text: 'Este es un correo de prueba enviado desde el servidor.',
            html: '<h1>¡Prueba exitosa!</h1><p>Este es un correo de prueba enviado desde el servidor.</p>'
        });

        console.log('✅ Correo de prueba enviado correctamente');
        console.log('ID del mensaje:', info.messageId);
        
    } catch (error) {
        console.error('❌ Error al probar el envío de correo:');
        console.error(error);
        
        if (error.response) {
            console.error('Respuesta del servidor SMTP:');
            console.error(error.response);
        }
    }
}

// Ejecutar la prueba
testSMTP().catch(console.error);
