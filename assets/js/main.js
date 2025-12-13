/**
 * Script principal para el sitio web de 200 Millas Loja
 * Maneja la funcionalidad interactiva del sitio
 */

document.addEventListener('DOMContentLoaded', function () {
    // Menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownToggles = document.querySelectorAll('.dropdown > a');

    // Toggle del menú móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Dropdowns en móvil
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const parent = this.parentElement;
                parent.classList.toggle('active');
            }
        });
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinksAll = document.querySelectorAll('.nav-links a');
    navLinksAll.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animación al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                element.classList.add('fade-in-up');
            }
        });
    };

    // Ejecutar animación al cargar y al hacer scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Aquí iría la lógica para enviar el formulario
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Simular envío
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            // Simular tiempo de espera
            setTimeout(() => {
                // Aquí iría la llamada AJAX real
                console.log('Formulario enviado:', Object.fromEntries(formData));

                // Mostrar mensaje de éxito
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
                contactForm.prepend(successMessage);

                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                // Limpiar formulario
                contactForm.reset();

                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }, 1500);
        });
    }

    // Galería de imágenes (Generic)
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                // Aquí iría la lógica para abrir un lightbox o modal
                console.log('Abrir imagen:', this.querySelector('img').src);
            });
        });
    }

    // Lightbox for "RESTAURANTE 200 MILLAS" section
    // Lightbox Logic (Event Delegation)
    document.body.addEventListener('click', function (e) {
        const target = e.target;
        // Check if clicked element is an image inside our target containers
        if (target.tagName === 'IMG' && (
            target.closest('.quienes-visual .image-grid') ||
            target.closest('.dish-image') ||
            target.closest('.welcome-image') ||
            target.closest('.category-slider') ||
            target.closest('.sopas-slide') ||
            target.closest('.gallery-item') ||
            target.closest('.sidebar-image')
        )) {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');

            if (lightbox && lightboxImg) {
                lightbox.style.display = "block";
                lightboxImg.src = target.src;
                document.body.style.overflow = 'hidden';
            }
        }
    });

    // Close Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');

    if (lightbox) {
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            });
        }

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.style.display === "block") {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Función para manejar el cambio de tamaño de la ventana
function handleResize() {
    // Cerrar menú móvil al cambiar a escritorio
    if (window.innerWidth > 992) {
        document.querySelector('.menu-toggle')?.classList.remove('active');
        document.querySelector('.nav-links')?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// Escuchar cambios de tamaño de ventana
window.addEventListener('resize', handleResize);

// Inicialización de componentes de terceros (si es necesario)
function initThirdPartyComponents() {
    // Inicialización de librerías externas como sliders, etc.
    console.log('Componentes de terceros inicializados');
}

// Inicializar todo cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThirdPartyComponents);
} else {
    initThirdPartyComponents();
}
