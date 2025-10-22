const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const fs = require('fs');

// Crear la aplicación Express
const app = express();

// Middleware para servir archivos estáticos
app.use(serveStatic(path.join(__dirname, '/')));

// Middleware para incluir archivos .html
app.use((req, res, next) => {
    // Solo procesar archivos HTML
    if (req.path.endsWith('.html') || !path.extname(req.path)) {
        const originalSend = res.send;
        res.send = function (body) {
            if (typeof body === 'string') {
                // Reemplazar las inclusiones del servidor
                body = body.replace(
                    /<!--#include\s+virtual=["']([^"']+)["']\s*-->/g,
                    (match, filePath) => {
                        try {
                            const fullPath = path.join(__dirname, filePath);
                            if (fs.existsSync(fullPath)) {
                                return fs.readFileSync(fullPath, 'utf8');
                            } else {
                                console.error(`Archivo no encontrado: ${fullPath}`);
                                return '';
                            }
                        } catch (err) {
                            console.error(`Error al incluir el archivo ${filePath}:`, err);
                            return '';
                        }
                    }
                );
            }
            return originalSend.call(this, body);
        };
    }
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
    
    // Verificar si el archivo existe
    require('fs').access(filePath, require('fs').constants.F_OK, (err) => {
        if (!err) {
            res.sendFile(filePath);
        } else {
            // Si el archivo no existe, pasar al siguiente middleware
            next();
        }
    });
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

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    console.log('Presiona Ctrl+C para detener el servidor');
});
