// Configuración del servidor de correo
export const emailConfig = {
    host: 'mail.cesarreyesjaramillo.com',
    port: 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: 'menuobjetivo@cesarreyesjaramillo.com',
        pass: 'CN0Cf9Cwhkcs'
    },
    tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
    }
};

export const emailOptions = {
    from: '"200 Millas - Contacto" <menuobjetivo@cesarreyesjaramillo.com>',
    to: 'menuobjetivo@cesarreyesjaramillo.com',
    subject: 'Nuevo mensaje de contacto',
    replyTo: '' // Se establecerá dinámicamente con el correo del remitente
};
