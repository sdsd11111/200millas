import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

// Configuración del servidor SMTP
const emailConfig = {
    host: 'mail.enloja.net',
    port: 465,
    secure: true, // true para el puerto 465, false para otros puertos
    auth: {
        user: 'restaurante200millas@enloja.net',
        pass: 'Xv37Bz5sx9.z'
    },
    tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
    },
    debug: true // Habilitar modo debug para ver la comunicación SMTP
};

// Configuración de rutas ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la aplicación Express
const app = express();

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '/')));

// Configuración de body-parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Ruta principal - Redirigir a index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejador para rutas sin extensión (SPA)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, `${page}.html`);
    
    // Si el archivo existe, servirlo, de lo contrario continuar
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        next();
    }
});

// Manejador para rutas con .html
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, `${page}.html`));
});

// Manejador para subdirectorios
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path), (err) => {
        if (err) {
            // Si hay un error (archivo no encontrado), enviar el index.html
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Ruta para manejar el envío del formulario
app.post('/api/contacto', async (req, res) => {
    console.log('Solicitud POST recibida en /api/contacto');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Verificar si el cuerpo de la solicitud está vacío
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('Cuerpo de la solicitud vacío');
        return res.status(400).json({
            success: false,
            message: 'Cuerpo de la solicitud vacío o inválido'
        });
    }
    
    const { nombre, email, telefono, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
        console.log('Faltan campos requeridos');
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor completa todos los campos requeridos' 
        });
    }

    try {
        console.log('📧 Configurando el envío de correo...');
        
        // Configuración de Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sdxd2677@gmail.com', // Tu correo de Gmail
                pass: '' // Aquí va la contraseña de aplicación de Gmail
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });

        // Configuración del correo para el administrador
        const mailOptionsAdmin = {
            from: '"200 Millas - Contacto" <sdxd2677@gmail.com>',
            to: 'sdxd2677@gmail.com', // Correo de destino
            replyTo: email,
            replyTo: email,
            subject: `Nuevo mensaje de contacto de ${nombre}`,
            text: `Has recibido un nuevo mensaje de contacto:
                  
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono || 'No proporcionado'}

Mensaje:
${mensaje}`,
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
                <h3>Mensaje:</h3>
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
            `
        };

        try {
            // 1. Enviar correo al administrador
            console.log('📤 Enviando correo al administrador...');
            await transporter.sendMail(mailOptionsAdmin);
            console.log('✅ Correo al administrador enviado correctamente');
            
            // 2. Enviar correo de confirmación al remitente
            console.log('📨 Enviando correo de confirmación al remitente...');
            const mailOptionsUser = {
                from: '"200 Millas - Contacto" <sdxd2677@gmail.com>',
                to: email,
                subject: 'Gracias por contactar a 200 Millas',
                text: `Hola ${nombre},

Gracias por contactar a 200 Millas. Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.

Este es un mensaje automático, por favor no responder a este correo.

Atentamente,
El equipo de 200 Millas`,
                html: `
                    <h2>¡Gracias por contactar a 200 Millas!</h2>
                    <p>Hola ${nombre},</p>
                    <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.</p>
                    <p>Este es un mensaje automático, por favor no responder a este correo.</p>
                    <p>Atentamente,<br>El equipo de 200 Millas</p>
                `
            };
            
            await transporter.sendMail(mailOptionsUser);
            console.log('✅ Correo de confirmación enviado correctamente');

            // Enviar respuesta exitosa (aunque el correo no se envió realmente)
            return res.status(200).json({ 
                success: true, 
                message: '¡Mensaje recibido! Nos pondremos en contacto contigo pronto. Nota: El servidor de correo no está disponible temporalmente.' 
            });
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.' 
            });
        }
    } catch (error) {
        console.error('Error en el servidor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.'
        });
    }
});

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    console.log('Presiona Ctrl+C para detener el servidor');
});
