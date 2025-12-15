// IMPORTANTE: Cargar dotenv PRIMERO antes de cualquier import que use process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import multer from 'multer';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import getPool from './db.js';

const MySQLStore = MySQLStoreFactory(session);

// Configuración del servidor SMTP usando variables de entorno
const emailConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
    },
    debug: true
};

// Configuración de rutas ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la aplicación Express
const app = express();

// Confiar en el proxy de Vercel/Nginx para que las cookies seguras funcionen
app.set('trust proxy', 1);

// Habilitar compresión Gzip
app.use(compression());

// Configuración de la tienda de sesiones MySQL
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutos
    expiration: 86400000, // 1 día (24 horas)
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, getPool()); // Usar el pool existente

// Configuración de sesiones para admin
app.use(session({
    key: 'session_cookie_name',
    secret: 'galeria200millas_secret_key_2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // True en producción (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Configuración de multer para subida de archivos (1MB máximo)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, WebP y GIF.'), false);
        }
    }
});

// Credenciales de admin (hardcoded as requested)
const ADMIN_USER = '200millas';
const ADMIN_PASS = 'Contraseña123.';

// Middleware para servir archivos estáticos con caché del navegador (1 día)
app.use(express.static(path.join(__dirname, '/'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            // No cachear HTML para asegurar que los cambios se vean reflejados
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Configuración de body-parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    next();
});

// ============================================
// ADMIN ROUTES
// ============================================

// Redirect /admin to login page
app.get('/admin', (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.redirect('/admin/gallery.html');
    } else {
        res.redirect('/admin/login.html');
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check admin auth
app.get('/api/admin/check', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

// ============================================
// GALLERY API ROUTES
// ============================================

// Get all gallery images (metadata only)
app.get('/api/gallery', async (req, res) => {
    try {
        const [rows] = await getPool().query(
            'SELECT id, title, category, image_type, created_at FROM gallery_images ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ success: false, message: 'Error al obtener imágenes' });
    }
});

// Get single image data (for display)
app.get('/api/gallery/image/:id', async (req, res) => {
    try {
        const [rows] = await getPool().query(
            'SELECT image_data, image_type FROM gallery_images WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Imagen no encontrada');
        }

        res.set('Content-Type', rows[0].image_type);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache 1 day
        res.send(rows[0].image_data);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Error al obtener imagen');
    }
});

// Upload new image (admin only)
app.post('/api/gallery', upload.single('image'), async (req, res) => {
    // Check auth
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    try {
        const { title, category } = req.body;
        const file = req.file;

        if (!title || !category || !file) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Validate category
        const validCategories = ['cliente', 'evento', 'plato'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ success: false, message: 'Categoría inválida' });
        }

        await getPool().query(
            'INSERT INTO gallery_images (title, category, image_data, image_type) VALUES (?, ?, ?, ?)',
            [title, category, file.buffer, file.mimetype]
        );

        res.json({ success: true, message: 'Imagen subida correctamente' });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: 'Error al subir imagen' });
    }
});

// Delete image (admin only)
app.delete('/api/gallery/:id', async (req, res) => {
    // Check auth
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    try {
        const result = await getPool().query('DELETE FROM gallery_images WHERE id = ?', [req.params.id]);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
        }

        res.json({ success: true, message: 'Imagen eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar imagen' });
    }
});

// ============================================
// STATIC FILE ROUTES
// ============================================

// Ruta principal - Redirigir a index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejador para rutas sin extensión (SPA)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;

    // Skip 'admin' - it has its own route handler
    if (page === 'admin') {
        return next();
    }

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

        // Configuración del servidor propio
        const transporter = nodemailer.createTransport({
            ...emailConfig,
            logger: true
        });

        // Configuración del correo para el administrador
        const mailOptionsAdmin = {
            from: '"200 Millas - Contacto" <email@restaurante200millasloja.com>',
            to: 'email@restaurante200millasloja.com',
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
                from: '"200 Millas - Contacto" <email@restaurante200millasloja.com>',
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
