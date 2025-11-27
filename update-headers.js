const fs = require('fs');
const path = require('path');

// Archivos a actualizar
const filesToUpdate = [
    'ceviches.html',
    'segundos.html',
    'especialidades.html',
    'acompañamientos.html',
    'parihuela.html',
    'camaron-reventado.html',
    'ceviche-mixto.html',
    'arroz-con-mariscos.html',
    'conchas-asadas.html',
    'plato-lojano.html',
    'gallery.html',
    'contact.html'
];

// Nuevo contenido del header
const newHeaderContent = `
    <!-- Contenedor del header -->
    <div id="header-container"></div>
    
    <!-- Cargar el header dinámicamente -->
    <script src="/assets/js/load-header.js" defer></script>
`;

// Patrón para encontrar el código del header antiguo
const headerPattern = /<!-- Cargar el header dinámicamente -->[\s\S]*?<script>[\s\S]*?function loadHeader\(\)[\s\S]*?<\/script>/i;

// Actualizar cada archivo
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
        try {
            // Leer el contenido del archivo
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Reemplazar el header antiguo por el nuevo
            const newContent = content.replace(headerPattern, newHeaderContent);
            
            // Escribir el archivo actualizado
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ ${file} actualizado correctamente`);
        } catch (error) {
            console.error(`❌ Error al actualizar ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  ${file} no encontrado, omitiendo...`);
    }
});

console.log('\n🎉 ¡Proceso de actualización completado!');
