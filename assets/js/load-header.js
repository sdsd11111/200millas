/**
 * Carga dinámica del header para 200 Millas
 * Versión: 1.0.0
 */

// Configuración
const CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    headerContainerId: 'header-container',
    headerCssPath: '/components/header/header.css',
    headerHtmlPath: '/components/header/header.html',
    headerJsPath: '/components/header/header.js'
};

// Contador de reintentos
let retryCount = 0;

/**
 * Crea el contenedor del header si no existe
 */
function ensureHeaderContainer() {
    let container = document.getElementById(CONFIG.headerContainerId);
    if (!container) {
        container = document.createElement('div');
        container.id = CONFIG.headerContainerId;
        document.body.insertBefore(container, document.body.firstChild);
    }
    return container;
}

/**
 * Carga el CSS del header
 */
function loadHeaderCss() {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CONFIG.headerCssPath;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

/**
 * Carga el HTML del header
 */
function loadHeaderHtml() {
    return fetch(CONFIG.headerHtmlPath)
        .then(response => {
            if (!response.ok) throw new Error('HTTP error ' + response.status);
            return response.text();
        });
}

/**
 * Carga el JS del header
 */
function loadHeaderJs() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CONFIG.headerJsPath;
        script.async = false;
        script.onload = () => {
            if (typeof initHeader === 'function') {
                initHeader();
            }
            // Marcar header como cargado
            document.documentElement.classList.add('header-loaded');
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

/**
 * Inicializa el header
 */
function initHeader() {
    const container = ensureHeaderContainer();
    
    // Cargar CSS
    loadHeaderCss()
        .then(() => {
            console.log('Header CSS cargado');
            // Cargar HTML
            return loadHeaderHtml();
        })
        .then(html => {
            container.innerHTML = html;
            console.log('Header HTML cargado');
            // Cargar JS
            return loadHeaderJs();
        })
        .then(() => {
            console.log('Header JS cargado e inicializado');
            // Asegurar que el header tenga la clase scrolled al cargar
            const header = document.querySelector('.header');
            if (header) {
                header.classList.add('scrolled');
            }
            retryCount = 0; // Resetear contador de reintentos
        })
        .catch(error => {
            console.error('Error cargando el header:', error);
            // Reintentar si no hemos alcanzado el máximo de reintentos
            if (retryCount < CONFIG.maxRetries) {
                retryCount++;
                console.log(`Reintentando cargar el header (${retryCount}/${CONFIG.maxRetries})...`);
                setTimeout(initHeader, CONFIG.retryDelay * retryCount);
            } else {
                console.error('Se agotaron los intentos de cargar el header');
            }
        });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
} else {
    initHeader();
}

// Exportar para uso en la consola
window.loadHeader = initHeader;
