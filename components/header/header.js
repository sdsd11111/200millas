// Header Component JavaScript - 200 Millas Loja
function initHeader() {
    const header = document.querySelector('.header');
    
    // Solo inicializar si el header existe
    if (!header) {
        console.log('Header not found, will retry...');
        setTimeout(initHeader, 100);
        return;
    }

    console.log('Initializing header...');

    // Efecto de scroll en el header
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Eliminar el event listener anterior si existe
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    // Efecto inicial de scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // Menú móvil toggle
    function setupMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        
        if (!mobileMenu || !navLinks) {
            console.log('Mobile menu elements not found, will retry...');
            return false;
        }

        // Clonar y reemplazar para limpiar event listeners
        const newMobileMenu = mobileMenu.cloneNode(true);
        mobileMenu.parentNode.replaceChild(newMobileMenu, mobileMenu);
        
        // Agregar el nuevo event listener
        newMobileMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = this.classList.contains('active');
            console.log('Mobile menu clicked, current state:', isActive ? 'active' : 'inactive');

            // Toggle del menú
            this.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Control del body scroll
            if (navLinks.classList.contains('active')) {
                document.body.classList.add('menu-open');
                // Cerrar todos los dropdowns al abrir el menú móvil
                document.querySelectorAll('.dropdown').forEach(dd => {
                    dd.classList.remove('active');
                });
            } else {
                document.body.classList.remove('menu-open');
            }

            console.log('Mobile menu toggled to:', isActive ? 'inactive' : 'active');
        });
        
        // Cerrar menú al hacer clic fuera
        function handleClickOutside(e) {
            if (window.innerWidth <= 992 && 
                !e.target.closest('.nav-links') && 
                !e.target.closest('#mobile-menu') &&
                navLinks.classList.contains('active')) {
                newMobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                // Cerrar todos los dropdowns
                document.querySelectorAll('.dropdown').forEach(dd => {
                    dd.classList.remove('active');
                });
            }
        }
        
        // Eliminar el event listener anterior si existe
        document.removeEventListener('click', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
        
        console.log('Mobile menu initialized successfully');
        return true;
    }

    // Inicializar menús desplegables
    function setupDropdowns() {
        console.log('Setting up dropdowns...');
        const dropdowns = document.querySelectorAll('.dropdown');
        
        // Función para cerrar todos los dropdowns excepto el especificado
        function closeOtherDropdowns(except = null) {
            document.querySelectorAll('.dropdown').forEach(dd => {
                if (dd !== except) {
                    dd.classList.remove('active');
                }
            });
        }

        // Función para manejar el clic fuera de los dropdowns
        function handleClickOutsideDropdowns(e) {
            if (window.innerWidth <= 992) {
                const clickedInsideDropdown = e.target.closest('.dropdown');
                const clickedToggle = e.target.closest('.dropdown-toggle');
                
                if (!clickedInsideDropdown && !clickedToggle) {
                    closeOtherDropdowns();
                }
            }
        }

        // Eliminar event listeners anteriores
        document.removeEventListener('click', handleClickOutsideDropdowns);
        document.addEventListener('click', handleClickOutsideDropdowns);
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!toggle || !menu) return;
            
            // Limpiar eventos anteriores
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            // Clonar el menú para limpiar eventos
            const newMenu = menu.cloneNode(true);
            menu.parentNode.replaceChild(newMenu, menu);
            
            // Evento para mostrar/ocultar el menú desplegable en móviles
            newToggle.addEventListener('click', function(e) {
                // Solo para móviles
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Cerrar otros dropdowns
                    closeOtherDropdowns(dropdown);
                    
                    // Alternar el dropdown actual
                    dropdown.classList.toggle('active');
                    
                    // Prevenir que el clic se propague al documento
                    return false;
                }
                
                // Para desktop, permitir el comportamiento normal del enlace
                if (this.href) {
                    window.location.href = this.href;
                }
            });
            
            // Prevenir que el menú se cierre al hacer clic en él
            newMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Si se hace clic en un enlace dentro del menú desplegable
                if (e.target.tagName === 'A') {
                    // Cerrar el menú móvil después de hacer clic en un enlace
                    if (window.innerWidth <= 992) {
                        const mobileMenu = document.getElementById('mobile-menu');
                        const navLinks = document.querySelector('.nav-links');
                        
                        if (mobileMenu && navLinks) {
                            mobileMenu.classList.remove('active');
                            navLinks.classList.remove('active');
                            document.body.classList.remove('menu-open');
                            closeOtherDropdowns();
                        }
                    }
                }
            });
        });
        
        console.log('Dropdowns initialized');
    }
    
    // Inicializar todo
    function initializeAll() {
        const mobileMenuInitialized = setupMobileMenu();
        setupDropdowns();
        
        if (!mobileMenuInitialized) {
            console.log('Retrying mobile menu initialization...');
            setTimeout(initializeAll, 100);
        }
    }
    
    // Iniciar la inicialización
    initializeAll();

    // Cerrar menú con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const navLinks = document.querySelector('.nav-links');
            const mobileMenu = document.getElementById('mobile-menu');
            
            if (navLinks && navLinks.classList.contains('active')) {
                if (mobileMenu) {
                    mobileMenu.classList.remove('active');
                }
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');

                // Cerrar todos los dropdowns
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });

                console.log('Menu closed with Escape key');
            }
        }
    });

    console.log('✅ Header JavaScript initialized successfully');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    
    // También intentar inicializar si el script se carga después de DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHeader();
    }
});

// Exportar para poder llamar desde otros scripts
window.initHeader = initHeader;
